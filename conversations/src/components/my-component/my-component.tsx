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
    if (localStorage.getItem("ejToken")) {
      return;
    }
    const user = this.getUserData();
    const response = await fetch(
      "http://localhost:8000/rest-auth/registration/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      }
    );
    let bodyResponse = await response.json();
    console.log(bodyResponse);
    this.setUserTokenOnLocalStorage(bodyResponse.key);
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
    let bodyResponse = await response.json();
    this.setCommentState(bodyResponse);
  }

  private getUserToken() {
    return localStorage.getItem("ejToken");
  }

  private setCommentState(comment: any) {
    this.comment = comment;
  }

  private setUserTokenOnLocalStorage(token: string) {
    localStorage.setItem("ejToken", token);
  }

  private getUserData(): any {
    let identifier = this.getUserIdentifier();
    return {
      username: identifier,
      email: "davidcarlos13@gmail.com",
      password1: "12345678david9",
      password2: "12345678david9"
    };
  }

  /*
   * This method will retrieve a mautic cookie and use it as
   * username on EJ
   */
  private getUserIdentifier(): string {
    return "sometokenfrommautic";
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
