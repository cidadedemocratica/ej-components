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
  @Prop() first: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

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
      <button onClick={this.requestAuthToken.bind(this)}>Request Token</button>
    );
  }
}
