import {
  Component,
  Prop,
  h,
  Element,
  Event,
  EventEmitter,
  State,
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
  @Prop() theme: string = "icd";
  @Prop() showBoardComponent: boolean = true;
  @Prop() ejQueryParams: any = null;
  @Prop() authenticateWith: string = "register";
  @Prop() conversation: any = {};
  @State() showCommentsComponent: boolean = true;
  @State() showInfoComponent: boolean = false;
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

  async componentWillLoad() {
    this.ejQueryParams = this.getEJQueryParams(document.location.search);
    this.api = this.newAPI();
    await this.api.authenticate();
    let { response } = await this.api.getConversation();
    this.conversation = response;
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

  toogleComments() {
    this.showInfoComponent = false;
    this.showCommentsComponent = true;
  }
  toogleInfo() {
    this.showInfoComponent = true;
    this.showCommentsComponent = false;
  }

  render() {
    if (!this.api.authTokenExists()) {
      if (this.authenticateWith != "register") {
        this.waitUserToken();
        return this.spinnerComponent();
      } else {
        return this.registerComponent();
      }
    }
    return (
      <div>
        <div id="user-prop">{this.user.name}</div>
        {this.showBoardComponent && (
          <ej-conversation-board
            onCloseBoard={() => this.boardHandler()}
            theme={this.theme}
          ></ej-conversation-board>
        )}
        <ej-conversation-header
          conversation={this.conversation}
          theme={this.theme}
        ></ej-conversation-header>
        <div>
          <nav>
            <div onClick={this.toogleComments.bind(this)} class="title">
              <h2>Comentários</h2>
            </div>
            <div onClick={this.toogleInfo.bind(this)} class="title">
              <h2>Informações</h2>
            </div>
          </nav>
          {this.showCommentsComponent && (
            <ej-conversation-comments
              conversation={this.conversation}
              host={this.host}
              user={this.user}
              theme={this.theme}
              ejQueryParams={this.ejQueryParams}
              api={this.api}
            ></ej-conversation-comments>
          )}
          {this.showInfoComponent && (
            <ej-conversation-infos></ej-conversation-infos>
          )}
        </div>
      </div>
    );
  }
}
