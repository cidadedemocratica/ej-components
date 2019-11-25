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

  private async getAuthToken() {
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
      email: "davidcarlos11@gmail.com",
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

  render() {
    return (
      <div>
        <button onClick={this.getAuthToken.bind(this)}>Request Token</button>
        <button onClick={this.getConversation.bind(this)}>
          Request Conversations
        </button>
        <div>{this.conversation && <h1>{this.conversation.title}</h1>}</div>
        <div>{this.comment && <h1>{this.comment.content}</h1>}</div>
      </div>
    );
  }
}
