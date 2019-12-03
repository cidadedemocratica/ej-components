class Api {
  constructor() {}

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

  private async createUserFromData(data: any) {
    const response = await fetch(
      "http://localhost:8000/rest-auth/registration/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  private authTokenExists() {
    if (localStorage.getItem("ejToken")) {
      return true;
    }
    return false;
  }

  async getConversation() {
    const response = await fetch(
      "http://localhost:8000/api/v1/conversations/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    let bodyResponse = await response.json();
    return bodyResponse.results[0];
  }

  async getConversationNextComment(conversation: any) {
    let commentUrl = conversation.links["random-comment"];
    const response = await fetch(commentUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      }
    });
    if (response.ok) {
      let bodyResponse = await response.json();
      return bodyResponse;
    } else {
      return {};
    }
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
    return Number(selfLink[selfLink.length - 2]);
  }

  private getConversationID(conversation: any): number {
    let selfLink = conversation.links["self"];
    return Number(selfLink[selfLink.length - 2]);
  }

  async computeDisagreeVote(comment: any) {
    await fetch("http://localhost:8000/api/v1/votes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(comment), choice: -1 })
    });
  }

  async computeSkipVote(comment: any) {
    await fetch("http://localhost:8000/api/v1/votes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(comment), choice: 0 })
    });
  }

  async computeAgreeVote(comment: any) {
    await fetch("http://localhost:8000/api/v1/votes/", {
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
    await fetch("http://localhost:8000/api/v1/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify(data)
    });
  }
}

export const API = new Api();
