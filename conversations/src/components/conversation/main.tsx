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
  @Prop() minimalVotesGroups: number = 500;
  @Prop() user: User = new User();
  @Prop() theme: string = "icd";
  @Prop() showBoardComponent: boolean = true;
  @Prop() ejQueryParams: any = null;
  @Prop() authenticateWith: string = "register";
  @Prop() conversation: any = {};
  @State() commentsComponentFocused: boolean = true;
  @State() groupComponentFocused: boolean = false;
  @Event() tokenExists: EventEmitter;

  async registerHandler(event?: any) {
    console.log(event);
    location.reload();
  }

  async boardHandler() {
    location.reload();
  }

  async componentWillLoad() {
    if (this.userAgreeWithLGPD()) {
      this.ejQueryParams = this.getEJQueryParams(document.location.search);
      this.api = this.newAPI();
      let user = User.get();
      try {
        if (!user.token) {
          await this.api.authenticate();
        }
        let { response } = await this.api.getConversation();
        this.conversation = response;
      } catch (error) {
        console.log(error.message);
      }
    }
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

  private async authenticateWithCookieAsync() {
    setTimeout(
      async function () {
        try {
          this.user = { ...(await this.api.authenticate()) };
          this.conversation = { ...(await this.api.getConversation()) };
        } catch (error) {
          this.api.authMethod = "register";
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

  showCommentsComponent(event: any) {
    this.commentsComponentFocused = true;
    this.groupComponentFocused = false;
    this.animateFocus(event);
  }

  showGroupComponent(event: any) {
    this.groupComponentFocused = true;
    this.commentsComponentFocused = false;
    this.animateFocus(event);
  }

  animateFocus(event: any) {
    if (event.target.classList.value.indexOf("unfocused-title") >= 0) {
      let focusedNav = this.el.shadowRoot.querySelector(".focused-title");
      console.log(focusedNav);
      focusedNav.classList.remove("focused-title");
      focusedNav.classList.add("unfocused-title");
      event.target.classList.remove("unfocused-title");
      event.target.classList.add("focused-title");
    }
  }

  userAgreeWithLGPD() {
    let userSawBoard = localStorage.getItem("userSawBoard") == "yes";
    let userAgree = localStorage.getItem("lgpd") == "agree";
    return userSawBoard && userAgree;
  }

  render() {
    if (!this.userAgreeWithLGPD()) {
      return this.registerComponent();
    }
    if (User.tokenIsInValid()) {
      if (this.authenticateWith == "register") {
        return this.registerComponent();
      }
      this.authenticateWithCookieAsync();
      return this.spinnerComponent();
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
            <div onClick={this.showCommentsComponent.bind(this)} class="title">
              <h2 class="focused-title">Comentários</h2>
            </div>
            <div onClick={this.showGroupComponent.bind(this)} class="title">
              <h2 class="unfocused-title">Grupos</h2>
            </div>
          </nav>
          {this.commentsComponentFocused && (
            <ej-conversation-comments
              conversation={this.conversation}
              host={this.host}
              user={this.user}
              theme={this.theme}
              ejQueryParams={this.ejQueryParams}
              api={this.api}
            ></ej-conversation-comments>
          )}
          {this.groupComponentFocused && (
            <ej-conversation-groups
              conversation={this.conversation}
              api={this.api}
              theme={this.theme}
              host={this.host}
              minimal-votes-groups={this.minimalVotesGroups}
            ></ej-conversation-groups>
          )}
        </div>
      </div>
    );
  }
}
