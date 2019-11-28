import { Component, Prop, h } from "@stencil/core";

@Component({
  tag: "ej-conversation",
  styleUrl: "my-component.css",
  shadow: true
})
export class EjConversation {
  /**
   * The first name
   */
  @Prop() conversation: any = {};

  /**
   * The middle name
   */
  @Prop() comment: any = {};

  async connectedCallback() {
    let tokenPromise = this.getAuthToken();
    await tokenPromise;
    this.getConversation();
  }

  private async getAuthToken() {
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

  private async getConversation() {
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
    this.conversation = bodyResponse.results[0];
    this.getConversationNextComment(this.conversation.links["random-comment"]);
  }

  private async getConversationNextComment(commentUrl: string) {
    const response = await fetch(commentUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      }
    });
    if (response.ok) {
      let bodyResponse = await response.json();
      this.setCommentState(bodyResponse);
    } else {
      this.setCommentState();
    }
  }

  private getUserToken() {
    return localStorage.getItem("ejToken");
  }

  private setCommentState(comment?: any) {
    if (!comment) {
      this.comment = {
        content: "Você respondeu todos os comentários disponíveis"
      };
    } else {
      this.comment = comment;
    }
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

  private getCommentID(): number {
    let selfLink = this.comment.links["self"];
    return Number(selfLink[selfLink.length - 2]);
  }

  private async computeDisagreeVote() {
    await fetch("http://localhost:8000/api/v1/votes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(), choice: -1 })
    });
    this.getConversationNextComment(this.conversation.links["random-comment"]);
  }

  private async computeSkipVote() {
    await fetch("http://localhost:8000/api/v1/votes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(), choice: 0 })
    });
    this.getConversationNextComment(this.conversation.links["random-comment"]);
  }

  private async computeAgreeVote() {
    await fetch("http://localhost:8000/api/v1/votes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.getUserToken()}`
      },
      body: JSON.stringify({ comment: this.getCommentID(), choice: 1 })
    });
    this.getConversationNextComment(this.conversation.links["random-comment"]);
  }

  render() {
    return (
      <div class="card">
        <div class="card-content">
          <div class="conversation-data">
            <div>
              {this.conversation && (
                <div id="conversation-title">{this.conversation.title}</div>
              )}
            </div>
          </div>
          <div
            class="
            comment-data"
          >
            <div>
              {this.comment && (
                <div id="comment-content">{this.comment.content}</div>
              )}
            </div>
          </div>
          <div class="vote-options">
            <div class="vote-options-container">
              <div
                class="disagree"
                onClick={this.computeDisagreeVote.bind(this)}
              >
                DISAGREE
              </div>
              <div class="skip" onClick={this.computeSkipVote.bind(this)}>
                SKIP
              </div>
              <div class="agree" onClick={this.computeAgreeVote.bind(this)}>
                AGREE
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
