import {
  Component,
  Prop,
  Event,
  EventEmitter,
  h,
  Element
} from "@stencil/core";
import { API, User } from "./api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation-register"
})
export class EjConversationRegister {
  // Indicate that name should be a public property on the component
  @Element() el: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() api: API;
  @Prop() user: User = new User();
  @Event() register: EventEmitter;

  async componentDidLoad() {
    this.api = new API(this.host, "");
  }

  private async setUserName(event: any) {
    this.user = { ...this.user, name: event.target.value };
  }

  private async setUserEmail(event: any) {
    this.user = { ...this.user, email: event.target.value };
  }

  private async registerUser() {
    try {
      let response = await this.api.createUser(this.user);
      this.api.setUserTokenOnLocalStorage(response.key);
      this.register.emit(this.user);
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <div class="card">
        <div class="logo"></div>
        <div class="register">
          <div id="register-name">
            <input
              onChange={(event: UIEvent) => this.setUserName(event)}
              placeholder="Seu Nome"
              type="text"
              id="name"
            />
          </div>
          <div id="register-email">
            <input
              onChange={(event: UIEvent) => this.setUserEmail(event)}
              placeholder="Seu Email"
              type="text"
              id="mail"
            />
          </div>
          <button onClick={() => this.registerUser()}>Participar</button>
        </div>
      </div>
    );
  }
}
