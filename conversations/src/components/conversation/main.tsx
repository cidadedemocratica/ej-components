import {
  Component,
  Prop,
  h,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { API } from "./api/api";
import { User } from "./api/user";
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
  @Prop() showBoardComponent: boolean = true;
  @Prop() ejQueryParams: any = null;
  @Prop() authenticateWith: string = "register";
  @Event() tokenExists: EventEmitter;

  async registerHandler(event?: any) {
    this.user = await this.api.authenticate();
    this.authenticateWith = "register";
    console.log(event);
    location.reload();
  }

  async boardHandler() {
    location.reload();
  }

  componentWillLoad() {
    this.ejQueryParams = this.getEJQueryParams(document.location.search);
    console.log(this.ejQueryParams);
    this.api = this.newAPI();
  }

  private newAPI() {
    if (
      this.ejQueryParams.cid &&
      this.ejQueryParams.commentId &&
      this.ejQueryParams.choice
    ) {
      return new API(
        this.host,
        this.ejQueryParams.cid,
        this.authenticateWith,
        this.ejQueryParams.commentId
      );
    }
    return new API(this.host, this.cid, this.authenticateWith);
  }

  private async waitUserToken() {
    setTimeout(
      async function () {
        try {
          this.user = { ...(await this.api.authenticate()) };
        } catch (error) {
          this.authenticateWith = "register";
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
        if (param.match(/.*cid.*/)) {
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

  spinnerComponent() {
    return (
      <div>
        <div id="user-prop">{this.user.name}</div>
        <ej-conversation-spinner background="background"></ej-conversation-spinner>
      </div>
    );
  }

  registerComponent() {
    return (
      <div>
        {this.showBoardComponent && (
          <ej-conversation-board
            theme={this.theme}
            onCloseBoard={() => this.boardHandler()}
          ></ej-conversation-board>
        )}
        <ej-conversation-register
          host={this.host}
          user={this.user}
          theme={this.theme}
          api={this.api}
          onUserRegisteredOnEJ={() => this.registerHandler()}
        ></ej-conversation-register>
      </div>
    );
  }

  commentsComponent() {
    return (
      <div>
        <div id="user-prop">{this.user.name}</div>
        {this.showBoardComponent && (
          <ej-conversation-board
            onCloseBoard={() => this.boardHandler()}
            theme={this.theme}
          ></ej-conversation-board>
        )}
        <ej-conversation-comments
          cid={this.cid}
          host={this.host}
          user={this.user}
          theme={this.theme}
          ejQueryParams={this.ejQueryParams}
          api={this.api}
        ></ej-conversation-comments>
      </div>
    );
  }

  render() {
    if (!this.api.authTokenExists()) {
      if (this.authenticateWith == "mautic") {
        this.waitUserToken();
        return this.spinnerComponent();
      } else {
        return this.registerComponent();
      }
    }
    return this.commentsComponent();
  }
}
