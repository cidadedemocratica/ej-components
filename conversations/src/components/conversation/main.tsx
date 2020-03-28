import {
  Component,
  Prop,
  Listen,
  h,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { API, User } from "./api";
import { HTMLStencilElement } from "@stencil/core/internal";
import "@polymer/paper-button/paper-button.js";

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
  @Prop() showRegisterComponent: boolean = false;
  @Prop() queryParams: any = null;
  @Event() closeBoard: EventEmitter;
  @Event() tokenExists: EventEmitter;

  @Listen("register")
  async registerHandler(event: any) {
    this.user = { ...(await this.api.authenticate()) };
    this.showRegisterComponent = false;
  }

  componentWillLoad() {
    this.api = new API(this.host, this.cid);
    this.queryParams = this.readQueryParams();
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

  private readQueryParams() {
    let pathname: string = document.location.search;
    if (pathname != "/" && pathname != "") {
      let params: any = pathname.slice(1).split("&");
      let cid: string = params[0].split("=")[1];
      let commentId: string = params[1].split("=")[1];
      let choice: string = params[2].split("=")[1];
      return { cid: cid, commentId: commentId, choice: choice };
    } else {
      return false;
    }
  }

  render() {
    if (!this.api.authTokenExists() && !this.showRegisterComponent) {
      this.checkToken();
      return (
        <div>
          <div id="user-prop">{this.user.name}</div>
          <ej-conversation-spinner></ej-conversation-spinner>
        </div>
      );
    }
    if (this.showRegisterComponent) {
      return (
        <ej-conversation-register
          host={this.host}
          user={this.user}
        ></ej-conversation-register>
      );
    }
    return (
      <div>
        <div id="user-prop">{this.user.name}</div>
        <ej-conversation-board></ej-conversation-board>
        <ej-conversation-comments
          cid={this.cid}
          host={this.host}
          user={this.user}
          queryParams={this.queryParams}
        ></ej-conversation-comments>
      </div>
    );
  }
}
