import { APIConfig } from "./api_config";
import { User, UserMetaData } from "./user";

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
  }

  async authenticate() {
    let user: User;
    if (this.authMethod == "mautic") {
      user = this.newUserUsingMauticID();
    }
    if (this.authMethod == "analytics") {
      user = this.newUserUsingAnalyticsID();
    }
    if (this.authMethod == "register") {
      user = this.getUser();
    }
    if (user) {
      let response = await this.createUser(user);
      user.token = response.key;
      user.save();
      return user;
    } else {
      throw new Error("could not authenticate user");
    }
  }

  async getConversation() {
    let response = await this.httpRequest(this.config.CONVERSATIONS_ROUTE);
    if (response.status) {
      return { response: response, status: response.status };
    }
    return { response: response, status: 200 };
  }

  async getUserConversationStatistics() {
    return this.httpRequest(this.config.USER_STATISTICS_ROUTE);
  }

  async getConversationClusters() {
    return this.httpRequest(this.config.CONVERSATION_CLUSTERS_ROUTE);
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
    let metadata = this.newUserMetaData();
    data.metadata = metadata;
    try {
      return await this.httpRequest(
        this.config.REGISTRATION_ROUTE,
        JSON.stringify(data)
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  newUserMetaData() {
    let metadata: UserMetaData = new UserMetaData();
    let mauticCookie: string = this.config.COOKIES_MAP["mautic"];
    let analyticsCookie: string = this.config.COOKIES_MAP["analytics"];
    metadata.mautic_id = parseInt(this.getCookie(mauticCookie));
    metadata.analytics_id = this.getCookie(analyticsCookie);
    return metadata;
  }

  async httpRequest(route: string, payload?: string) {
    let requestOpts = this.getHttpRequestOpts(payload);
    const response = await fetch(route, requestOpts);
    if (response.ok) {
      try {
        return await response.json();
      } catch (error) {
        return {};
      }
    } else {
      return response;
    }
  }

  authTokenExists() {
    return this.getUserToken() ? true : false;
  }

  getUserToken() {
    let user = User.get();
    return user && user.token ? user.token : "";
  }

  getUser() {
    let user = User.get();
    user.token = "";
    return user;
  }

  newUserUsingMauticID() {
    let cookieName: string = this.config.COOKIES_MAP["mautic"];
    let cookie = this.getCookie(cookieName);
    if (cookie) {
      return new User(
        `Participante anônimo`,
        `${cookie}-mautic@mail.com`,
        `${cookie}-mautic`,
        `${cookie}-mautic`
      );
    }
  }

  newUserUsingAnalyticsID() {
    let cookieName: string = this.config.COOKIES_MAP["analytics"];
    let cookie = this.getCookie(cookieName);
    if (cookie) {
      return new User(
        `Participante anônimo`,
        `${cookie}-analytics@mail.com`,
        `${cookie}-analytics`,
        `${cookie}-analytics`
      );
    }
  }

  /*
   * This method will retrieve a cookie and use it as
   * username on EJ
   */
  getCookie(cookieName: string): string {
    let cookies = document.cookie;
    let cookieIndex = cookies.indexOf(cookieName);
    let cookieValue = "";
    if (cookieIndex != -1) {
      let cookieKeyAndValue = cookies.substring(cookieIndex, cookies.length);
      cookieValue = cookieKeyAndValue.split("=")[1];
      if (cookieValue.indexOf(";") != -1) {
        cookieValue = cookieValue.split(";")[0];
      }
    }
    return cookieValue;
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
