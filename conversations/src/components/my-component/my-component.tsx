import { Component, Prop, h } from "@stencil/core";
import { Element } from "@stencil/core";

@Component({
  tag: "ej-conversation",
  styleUrl: "my-component.css",
  shadow: true
})
export class EjConversation {
  /**
   * The first name
   */
  @Element() el: HTMLElement;

  @Prop() conversation: any = {};

  /**
   * The middle name
   */
  @Prop() comment: any = {};

  @Prop() newCommentContent: string = "";

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

  private displayNewCommentCard() {
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment-content"
    );
    let commentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".comment-container"
    );
    let voteOptionsContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".vote-options-container"
    );
    let addCommentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#add-comment-container"
    );

    commentContainer.style.display = "none";
    voteOptionsContainer.style.display = "none";
    addCommentContainer.style.display = "none";
    newCommentCard.style.display = "block";
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

  private async createComment(event: any) {}

  private async getCommentContent(event: any) {
    this.newCommentContent = event.target.value;
  }

  render() {
    return (
      <div class="card">
        <div class="card-content">
          <div class="conversation-title-container">
            <div>
              {this.conversation && (
                <div id="conversation-title">{this.conversation.title}</div>
              )}
            </div>
          </div>
          <div
            class="
            comment-container"
          >
            <div>
              {this.comment && (
                <div id="comment-content">{this.comment.content}</div>
              )}
            </div>
          </div>
          <div class="vote-options-container">
            <div class="vote-options">
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
          <div
            id="add-comment-container"
            onClick={this.displayNewCommentCard.bind(this)}
          >
            <div id="add-comment">Adicionar Comentario</div>
          </div>
        </div>
        <div class="new-comment-content">
          <div id="new-comment-advise">
            Inclua um novo comentário e evite opiniões similares. Você pode
            postar apenas um comentário.
          </div>
          <div id="new-comment-input">
            <input
              type="text"
              onChange={(event: UIEvent) => this.getCommentContent(event)}
            />
          </div>
          <div onClick={this.createComment.bind(this)}>Submit</div>
        </div>
      </div>
    );
  }
}
