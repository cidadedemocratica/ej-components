export class User {
  name: string;
  email: string;
  password1: string;
  password2: string;
  displayName: string;
  stats: any;

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
}
export class API {
  HOST: string = "";
  API_URL: string = "";
  CONVERSATIONS_ROUTE: string = "";
  VOTES_ROUTE: string = "";
  COMMENTS_ROUTE: string = "";
  REGISTRATION_ROUTE: string = "";
  COMMENT_ROUTE: string = "";
  USER_STATISTICS_ROUTE: string = "";
  USER_COMMENTS_ROUTE: string = "";
  USER_PENDING_COMMENTS_ROUTE: string = "";
  MAUTIC_COOKIE: string = "mtc_id";
  VOTE_CHOICES: any = { skip: 0, agree: 1, disagree: -1 };

  constructor(host: string, conversationID: string, commentID?: string) {
    this.HOST = host;
    this.API_URL = `${this.HOST}/api/v1`;
    this.CONVERSATIONS_ROUTE = `${this.API_URL}/conversations/${conversationID}/`;
    this.VOTES_ROUTE = `${this.API_URL}/votes/`;
    this.COMMENTS_ROUTE = `${this.API_URL}/comments/`;
    if (commentID) {
      this.COMMENT_ROUTE = `${this.API_URL}/comments/${commentID}/`;
    }
    this.REGISTRATION_ROUTE = `${this.HOST}/rest-auth/registration/`;
    this.USER_STATISTICS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-statistics/`;
    this.USER_COMMENTS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-comments/`;
    this.USER_PENDING_COMMENTS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-pending-comments/`;
  }

  async authenticate() {
    if (this.authTokenExists()) {
      return this.getUser();
    }
    const user: User = this.getUser();
    if (user) {
      let response = await this.createUser(user);
      this.setUserTokenOnLocalStorage(response.key);
      return user;
    } else {
      throw new Error("could not authenticate user");
    }
  }

  async getConversation() {
    return this.httpRequest(this.CONVERSATIONS_ROUTE);
  }

  async getUserConversationStatistics() {
    return this.httpRequest(this.USER_STATISTICS_ROUTE);
  }

  async getConversationNextComment(conversation: any) {
    let commentUrl: string = "";
    if (this.COMMENT_ROUTE) {
      commentUrl = this.COMMENT_ROUTE;
    } else {
      commentUrl = this.getRandomCommentUrl(conversation);
    }
    return await this.httpRequest(commentUrl);
  }

  async userCanAddNewComment() {
    let stats = await this.getUserCommentsStatistics();
    if (stats.createdComments >= 2) {
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
    const response = await this.httpRequest(this.USER_COMMENTS_ROUTE);
    return response.length;
  }

  async getUserPendingCommentsCount() {
    const response = await this.httpRequest(this.USER_PENDING_COMMENTS_ROUTE);
    return response.length;
  }

  async computeVote(comment: any, choice: string) {
    let body: string = JSON.stringify({
      comment: this.getCommentID(comment),
      choice: this.VOTE_CHOICES[choice],
    });
    await this.httpRequest(this.VOTES_ROUTE, body);
  }

  async createComment(content: any, conversation: any) {
    let data = {
      content: content,
      conversation: this.getConversationID(conversation),
      status: "approved",
    };
    await this.httpRequest(this.COMMENTS_ROUTE, JSON.stringify(data));
  }

  async createUser(data: any) {
    try {
      return await this.httpRequest(
        this.REGISTRATION_ROUTE,
        JSON.stringify(data)
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async httpRequest(route: string, payload?: string) {
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
    if (localStorage.getItem("ejToken")) {
      return true;
    }
    return false;
  }

  getUserToken() {
    return localStorage.getItem("ejToken");
  }

  setUserTokenOnLocalStorage(token: string) {
    localStorage.setItem("ejToken", token);
  }

  getUser(): any {
    let cookie = this.getUserIdentifierCookie(document.cookie);
    if (cookie) {
      return new User(
        `${cookie}-mautic`,
        `${cookie}-mautic@mail.com`,
        `${cookie}-mautic`,
        `${cookie}-mautic`
      );
    }
    let token: string = this.getUserToken();
    if (token) {
      return new User(`${token}`, `${token}@mail.com`, `${token}`, `${token}`);
    }
    return false;
  }

  /*
   * This method will retrieve a mautic cookie and use it as
   * username on EJ
   */
  getUserIdentifierCookie(cookies: string): string {
    let cookieIndex = cookies.indexOf(this.MAUTIC_COOKIE);
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
      if (this.HOST.split(":")[0] == "https") {
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
      if (this.HOST.split(":")[0] == "https") {
        return comment.replace("http", "https");
      }
      return comment;
    } catch (error) {
      return comment;
    }
  }
}
