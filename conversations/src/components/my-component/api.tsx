export class API {
  HOST: string = "";
  API_HOST: string = "";
  CONVERSATIONS_ROUTE: string = "";
  VOTES_ROUTE: string = "";
  COMMENTS_ROUTE: string = "";
  REGISTRATION_ROUTE: string = "";

  constructor(host: string, conversation_id: string) {
    this.HOST = host;
    this.API_HOST = `${this.HOST}/api/v1`;
    this.CONVERSATIONS_ROUTE = `${this.API_HOST}/conversations/${conversation_id}`;
    this.VOTES_ROUTE = `${this.API_HOST}/votes/`;
    this.COMMENTS_ROUTE = `${this.API_HOST}/comments/`;
    this.REGISTRATION_ROUTE = `${this.HOST}/rest-auth/registration/`;
  }

  async authenticate() {
    if (this.authTokenExists()) {
      return;
    }
    const data = this.getUserData();
    if (data.identifier != "") {
      let response = await this.createUserFromData(data);
      this.setUserTokenOnLocalStorage(response.key);
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

  async getConversationNextComment(conversation: any) {
    let commentUrl = this.getRandomCommentUrl(
      conversation.links["random-comment"]
    );
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

  private async createUserFromData(data: any) {
    const response = await fetch(this.REGISTRATION_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  private authTokenExists() {
    if (localStorage.getItem("ejToken")) {
      return true;
    }
    return false;
  }

  private getUserToken() {
    return localStorage.getItem("ejToken");
  }

  private setUserTokenOnLocalStorage(token: string) {
    localStorage.setItem("ejToken", token);
  }

  private getUserData(): any {
    let identifier = this.getUserIdentifierCookie();
    return {
      name: identifier,
      email: `${identifier}@fakemail.com`,
      password1: identifier,
      password2: identifier
    };
  }

  /*
   * This method will retrieve a mautic cookie and use it as
   * username on EJ
   */
  private getUserIdentifierCookie(): string {
    let cookies = document.cookie;
    let userIdentifierCookie = "mautic";
    let cookieIndex = cookies.indexOf(userIdentifierCookie);
    if (cookieIndex != -1) {
      let cookieKeyAndValue = cookies.substring(cookieIndex, cookies.length);
      let cookieValue = cookieKeyAndValue.split("=")[1];
      return cookieValue;
    }
    return "";
  }

  private getCommentID(comment: any): number {
    let selfLink = comment.links["self"];
    let linkAsArray = selfLink.split("/");
    return Number(linkAsArray[linkAsArray.length - 2]);
  }

  private getConversationID(conversation: any): number {
    let selfLink = conversation.links["self"];
    return Number(selfLink[selfLink.length - 2]);
  }

  private getRandomCommentUrl(comment: any) {
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
