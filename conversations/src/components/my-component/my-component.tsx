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
  @Prop() title: string;

  /**
   * The middle name
   */
  @Prop() text: string;

  private async requestAuthToken() {
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
    this.setUserTokenOnLocalStorage(bodyResponse.key);
  }

  private async requestConversations() {
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
    this.setConversationState(bodyResponse.results[0]);
  }

  private setConversationState(conversation: any) {
    this.title = conversation.title;
    this.text = conversation.text;
  }

  private setUserTokenOnLocalStorage(token: string) {
    localStorage.setItem("ejToken", token);
  }

  private getUserData(): any {
    return {
      username: "davidcarlos3",
      email: "davidcarlos9@gmail.com",
      password1: "12345678david9",
      password2: "12345678david9"
    };
  }

  render() {
    return (
      <div>
        <button onClick={this.requestAuthToken.bind(this)}>
          Request Token
        </button>
        <button onClick={this.requestConversations.bind(this)}>
          Request Conversations
        </button>
        <div>
          <h1>{this.title}</h1>
          <h1>{this.text}</h1>
        </div>
      </div>
    );
  }
}
