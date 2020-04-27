import {
  Component,
  Prop,
  Listen,
  h,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { API, User } from "./api/api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation",
  styleUrls: ["main.css", "assets/css/all.css"],
  shadow: true,
  assetsDir: "./assets",
})
export class EjConversation {
  @Prop() api: API;
  @Element() el!: HTMLStencilElement;
  @Prop() host: string;
  //cid == conversation_id
  @Prop() cid: string;
  @Prop() user: User = new User();
  @Prop() theme: string = "osf";
  @Prop() showRegisterComponent: boolean = false;
  @Prop() showBoardComponent: boolean = true;
  @Prop() ejQueryParams: any = null;
  @Event() tokenExists: EventEmitter;

  @Listen("register")
  async registerHandler() {
    this.user = { ...(await this.api.authenticate()) };
    this.showRegisterComponent = false;
    location.reload();
  }

  componentWillLoad() {
    this.api = new API(this.host, this.cid);
    this.ejQueryParams = this.getEJQueryParams(document.location.search);
  }

  private async checkToken() {
    setTimeout(
      async function () {
        let user = this.api.getUser();
        if (user) {
          this.user = { ...(await this.api.authenticate()) };
        } else {
          this.showRegisterComponent = true;
          console.log("No token found to create EJ user");
        }
      }.bind(this),
      5000
    );
  }

  getEJQueryParams(search: string) {
    let cid: string = "";
    let commentId: string = "";
    let choice: string = "";
    if (search != "/" && search != "") {
      let params: any = search.split("&");
      for (let param of params) {
        if (param.match(/^cid/)) {
          cid = param.split("=")[1];
        }
        if (param.match(/^comment_id/)) {
          commentId = param.split("=")[1];
        }
        if (param.match(/^choice/)) {
          choice = param.split("=")[1];
        }
      }
    }
    return { cid: cid, commentId: commentId, choice: choice };
  }

  render() {
    if (!this.api.authTokenExists() && !this.showRegisterComponent) {
      this.checkToken();
      return (
        <div>
          <div id="user-prop">{this.user.name}</div>
          <ej-conversation-spinner background="background"></ej-conversation-spinner>
        </div>
      );
    }
    if (this.showRegisterComponent) {
      return (
        <div>
          {this.showBoardComponent && (
            <ej-conversation-board theme={this.theme}></ej-conversation-board>
          )}
          <ej-conversation-register
            host={this.host}
            user={this.user}
            theme={this.theme}
          ></ej-conversation-register>
        </div>
      );
    }
    return (
      <div>
        <div id="user-prop">{this.user.name}</div>
        {this.showBoardComponent && (
          <ej-conversation-board theme={this.theme}></ej-conversation-board>
        )}
        <ej-conversation-comments
          cid={this.cid}
          host={this.host}
          user={this.user}
          theme={this.theme}
          ejQueryParams={this.ejQueryParams}
        ></ej-conversation-comments>
      </div>
    );
  }
}
