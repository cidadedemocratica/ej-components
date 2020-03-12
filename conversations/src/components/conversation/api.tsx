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
  APPROVED_COMMENTS_ROUTE: string = "";
  MAUTIC_COOKIE: string = "mtc_id";

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
    this.APPROVED_COMMENTS_ROUTE = `${this.API_URL}/conversations/${conversationID}/approved-comments/`;
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
    const response = await fetch(this.CONVERSATIONS_ROUTE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await response.json();
  }

  async getUserConversationStatistics() {
    const response = await fetch(this.USER_STATISTICS_ROUTE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      }
    });
    return await response.json();
  }

  async getConversationNextComment(conversation: any) {
    let commentUrl: string = "";
    if (this.COMMENT_ROUTE) {
      commentUrl = this.COMMENT_ROUTE;
    } else {
      commentUrl = this.getRandomCommentUrl(conversation);
    }
    const response = await fetch(commentUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      }
    });
    if (response.ok) {
      let bodyResponse: any;
      try {
        bodyResponse = await response.json();
      } catch (error) {
        console.info("no comments to show");
        return {};
      }
      return bodyResponse;
    } else {
      return {};
    }
  }

  async userCanAddNewComment() {
    let stats = await this.getUserCommentsStatistics();
    if (stats.comments >= 2) {
      return false;
    }
    return true;
  }

  async getUserCommentsStatistics() {
    const response = await fetch(this.APPROVED_COMMENTS_ROUTE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      }
    });
    let listOfComments: Array<any> = await response.json();
    return { comments: listOfComments.length };
  }

  async computeDisagreeVote(comment: any) {
    await fetch(this.VOTES_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(comment), choice: -1 })
    });
  }

  async computeSkipVote(comment: any) {
    await fetch(this.VOTES_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(comment), choice: 0 })
    });
  }

  async computeAgreeVote(comment: any) {
    await fetch(this.VOTES_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(comment), choice: 1 })
    });
  }

  async createComment(content: any, conversation: any) {
    let data = {
      content: content,
      conversation: this.getConversationID(conversation),
      status: "approved"
    };
    await fetch(this.COMMENTS_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify(data)
    });
  }

  async createUser(data: any) {
    const response = await fetch(this.REGISTRATION_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return response.json();
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
