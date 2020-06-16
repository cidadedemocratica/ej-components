export class User {
  name: string;
  email: string;
  password1: string;
  password2: string;
  displayName: string;
  stats: any;
  token?: string;

  constructor(
    name?: string,
    email?: string,
    password1?: string,
    password2?: string
  ) {
    this.name = name || "";
    this.email = email || "";
    this.password1 = password1 || "";
    this.password2 = password2 || "";
    this.displayName = "";
    this.stats = {};
  }

  saveOnLocalStorage() {
    let data: any = {
      name: this.name,
      email: this.email,
      password1: this.password1,
      password2: this.password2,
      displayName: this.displayName,
      token: this.token,
      stats: this.stats,
    };
    localStorage.setItem("user", JSON.stringify(data));
  }

  static getFromLocalStorage() {
    let user: User = new User();
    user = { ...JSON.parse(localStorage.getItem("user")) };
    return user;
  }
}

import { APIConfig } from "./api_config";

export class API {
  config: APIConfig;
  COMMENTS_PER_USER: number = 2;
  authMethod: string;
  constructor(
    host: string,
    conversationID: string,
    authMethod: string,
    commentID?: string
  ) {
    this.config = new APIConfig(host, conversationID, commentID);
    this.authMethod = authMethod;
    console.log(authMethod);
  }

  async authenticate() {
    if (this.authTokenExists()) {
      return User.getFromLocalStorage();
    }
    let user: User;
    if (this.authMethod == "register") {
      user = this.newUserUsingEJToken();
    }
    if (this.authMethod == "mautic") {
      user = this.newUserUsingMauticID();
    }
    if (this.authMethod == "analytics") {
      user = this.newUserUsingAnalyticsID();
    }
    if (user) {
      let response = await this.createUser(user);
      user.token = response.key;
      user.saveOnLocalStorage();
      return user;
    } else {
      throw new Error("could not authenticate user");
    }
  }

  async getConversation() {
    return this.httpRequest(this.config.CONVERSATIONS_ROUTE);
  }

  async getUserConversationStatistics() {
    return this.httpRequest(this.config.USER_STATISTICS_ROUTE);
  }

  async getConversationNextComment(conversation: any) {
    let commentUrl: string = "";
    if (this.config.COMMENT_ROUTE) {
      commentUrl = this.config.COMMENT_ROUTE;
    } else {
      commentUrl = this.getRandomCommentUrl(conversation);
    }
    return await this.httpRequest(commentUrl);
  }

  async userCanAddNewComment() {
    let stats = await this.getUserCommentsStatistics();
    if (stats.createdComments >= this.COMMENTS_PER_USER) {
      return false;
    }
    return true;
  }

  async getUserCommentsStatistics() {
    let created: number = await this.getUserCreatedCommentsCount();
    let pending: number = await this.getUserPendingCommentsCount();
    return { createdComments: created, pendingComments: pending };
  }

  async getUserCreatedCommentsCount() {
    const response = await this.httpRequest(this.config.USER_COMMENTS_ROUTE);
    return response.length;
  }

  async getUserPendingCommentsCount() {
    const response = await this.httpRequest(
      this.config.USER_PENDING_COMMENTS_ROUTE
    );
    return response.length;
  }

  async computeVote(comment: any, choice: string) {
    let body: string = JSON.stringify({
      comment: this.getCommentID(comment),
      choice: this.config.VOTE_CHOICES[choice],
    });
    await this.httpRequest(this.config.VOTES_ROUTE, body);
  }

  async createComment(content: any, conversation: any) {
    let data = {
      content: content,
      conversation: this.getConversationID(conversation),
      status: "approved",
    };
    return await this.httpRequest(
      this.config.COMMENTS_ROUTE,
      JSON.stringify(data)
    );
  }

  async createUser(data: any) {
    try {
      return await this.httpRequest(
        this.config.REGISTRATION_ROUTE,
        JSON.stringify(data)
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async httpRequest(route: string, payload?: string) {
    let requestOpts = this.getHttpRequestOpts(payload);
    const response = await fetch(route, requestOpts);
    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        console.error("could not send request");
        return {};
      }
    } else {
      let invalidResponse = await response.json();
      throw new Error(invalidResponse.name);
    }
  }

  authTokenExists() {
    return localStorage.getItem("ejToken") ? true : false;
  }

  getUserToken() {
    return localStorage.getItem("ejToken");
  }

  newUserUsingMauticID() {
    let cookie = this.getUserIdentifierCookie(document.cookie);
    if (cookie) {
      return new User(
        `Participante anônimo`,
        `${cookie}-mautic@mail.com`,
        `${cookie}-mautic`,
        `${cookie}-mautic`
      );
    }
  }

  newUserUsingEJToken() {
    let token: string = this.getUserToken();
    if (token) {
      return new User(`${token}`, `${token}@mail.com`, `${token}`, `${token}`);
    }
  }

  newUserUsingAnalyticsID() {
    return new User(
      `Participante anônimo`,
      `analytics@mail.com`,
      `analytics`,
      `analytics`
    );
  }

  /*
   * This method will retrieve a mautic cookie and use it as
   * username on EJ
   */
  getUserIdentifierCookie(cookies: string): string {
    let cookieIndex = cookies.indexOf(this.config.MAUTIC_COOKIE);
    if (cookieIndex != -1) {
      let cookieKeyAndValue = cookies.substring(cookieIndex, cookies.length);
      let cookieValue = cookieKeyAndValue.split("=")[1];
      if (cookieValue.indexOf(";") != -1) {
        cookieValue = cookieValue.split(";")[0];
      }
      return cookieValue;
    }
    return "";
  }

  getCommentID(comment: any): number {
    let selfLink = comment.links["self"];
    let linkAsArray = selfLink.split("/");
    return Number(linkAsArray[linkAsArray.length - 2]);
  }

  getConversationID(conversation: any): number {
    let selfLink = conversation.links["self"];
    return Number(selfLink.split("/").reverse()[1]);
  }

  getRandomCommentUrl(conversation: any) {
    let comment: any = conversation.links["random-comment"];
    try {
      if (this.config.HOST.split(":")[0] == "https") {
        return comment.replace("http", "https");
      }
      return comment;
    } catch (error) {
      return comment;
    }
  }

  getApprovedCommentsUrl(conversation: any) {
    let comment: any = conversation.links["approved-comments"];
    try {
      if (this.config.HOST.split(":")[0] == "https") {
        return comment.replace("http", "https");
      }
      return comment;
    } catch (error) {
      return comment;
    }
  }

  private getHttpRequestOpts(payload: string) {
    let requestOpts: any = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (payload) {
      requestOpts["body"] = payload;
      requestOpts["method"] = "POST";
    }
    if (this.getUserToken()) {
      requestOpts.headers["Authorization"] = `Token ${this.getUserToken()}`;
    }
    return requestOpts;
  }
}
