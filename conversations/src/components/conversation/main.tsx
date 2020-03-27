import {
  Component,
  Prop,
  Listen,
  h,
  Element,
  getAssetPath,
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
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() user: User = new User();
  @Prop() newCommentMode: boolean = false;
  @Prop() showRegisterComponent: boolean = false;

  @Listen("register")
  async registerHandler(event: any) {
    try {
      this.showRegisterComponent = false;
      this.user = { ...event.detail };
      let queryParams: any = this.readQueryParams();
      if (queryParams) {
        this.api = new API(this.host, queryParams.cid, queryParams.commentId);
      } else {
        this.api = new API(this.host, this.cid);
      }
      await this.api.authenticate();
      this.conversation = await this.api.getConversation();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
      this.setCommentState();
      this.voteUsingQueryParams(queryParams);
    } catch (error) {
      console.error(error);
      console.error("could not render component");
    }
  }

  @Listen("closeBoard")
  async onCloseBoard() {
    this.setCommentState();
    this.setUserStatsState();
  }

  async componentWillLoad() {
    this.prepareComponentToRender();
  }

  async prepareComponentToRender() {
    try {
      let queryParams: any = this.readQueryParams();
      if (queryParams) {
        this.api = new API(this.host, queryParams.cid, queryParams.commentId);
      } else {
        this.api = new API(this.host, this.cid);
      }
      this.user = { ...(await this.api.authenticate()) };
      this.conversation = { ...(await this.api.getConversation()) };
      this.comment = {
        ...(await this.api.getConversationNextComment(this.conversation)),
      };
      this.setUserStatsState();
      this.setCommentState();
      this.voteUsingQueryParams(queryParams);
    } catch (err) {
      console.log(err);
    }
  }

  private voteUsingQueryParams(queryParams: any) {
    if (queryParams) {
      if (queryParams.choice == "agree") {
        this.voteOnAgree();
      }
      if (queryParams.choice == "disagree") {
        this.voteOnDisagree();
      }
      if (queryParams.choice == "skip") {
        this.voteOnSkip();
      }
    }
    //from here component will use this.api.COMMENTS_ROUTE.
    this.api.COMMENT_ROUTE = "";
  }

  private setCommentState() {
    if (!this.comment.content) {
      this.comment = {
        content: "Obrigado por participar!",
      };
    }
    if (
      this.comment.content &&
      this.comment.content == "Obrigado por participar!"
    ) {
      let choices: HTMLElement = this.el.shadowRoot.querySelector("#choices");
      choices.style.display = "none";
    }

    if (this.user.stats.createdComments == 2) {
      let addCommentLink: HTMLElement = this.el.shadowRoot.querySelector(
        ".add-comment"
      );
      addCommentLink.style.display = "none";
    }
  }

  private async setUserStatsState() {
    let voteStatsData: any = {
      ...(await this.api.getUserConversationStatistics()),
    };
    let commentStatsData: any = {
      ...(await this.api.getUserCommentsStatistics()),
    };
    let userWithStats: User = { ...this.user };
    userWithStats.stats = { ...voteStatsData, ...commentStatsData };
    this.user = { ...userWithStats };
  }

  private toggleCommentCard() {
    let commentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".comment-card"
    );
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment-card"
    );
    if (this.newCommentMode) {
      commentCard.style.display = "block";
      newCommentCard.style.display = "none";
      this.newCommentMode = false;
    } else {
      commentCard.style.display = "none";
      newCommentCard.style.display = "block";
      this.newCommentMode = true;
    }
  }

  private async setCommentContent(event: any) {
    this.newCommentContent = event.target.value;
  }

  private async addComment() {
    let userCanAdd: Boolean = await this.api.userCanAddNewComment();
    if (userCanAdd) {
      await this.api.createComment(this.newCommentContent, this.conversation);
      this.toggleCommentCard();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
      this.setCommentState();
      this.setUserStatsState();
    }
  }

  private deckTransition() {
    let root: HTMLElement = this.el.shadowRoot.querySelector(
      ".card-transition"
    );
    let cloneCard: any = this.el.shadowRoot
      .querySelector(".comment-card")
      .cloneNode(true);
    cloneCard.classList.add("deck-transition");
    root.appendChild(cloneCard);
    setTimeout(
      function () {
        cloneCard.style.transform = "translate(100vw) translate(0, 30px)";
        cloneCard.style.opacity = "0.5";
      }.bind(this),
      1000
    );
    setTimeout(
      function () {
        cloneCard.parentNode.removeChild(cloneCard);
      }.bind(this),
      2000
    );
  }

  private async voteOnDisagree() {
    await this.api.computeDisagreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.deckTransition();
    this.setCommentState();
    this.setUserStatsState();
  }

  private async voteOnAgree() {
    await this.api.computeAgreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.deckTransition();
    this.setCommentState();
    this.setUserStatsState();
  }

  private async voteOnSkip() {
    await this.api.computeSkipVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.deckTransition();
    this.setCommentState();
    this.setUserStatsState();
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

  private async checkToken() {
    setTimeout(
      async function () {
        let user = this.api.getUser();
        if (user) {
          this.prepareComponentToRender();
        } else {
          this.showRegisterComponent = true;
          console.log("No token found to create EJ user");
        }
      }.bind(this),
      5000
    );
  }

  render() {
    if (!this.api.authTokenExists() && !this.showRegisterComponent) {
      this.checkToken();
      return (
        <div>
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
        <ej-conversation-board></ej-conversation-board>
        <div class="box">
          <div id="user-prop">{this.user.name}</div>
          <div id="user-prop">{this.showRegisterComponent}</div>
          <div class="header">
            <h1> {this.conversation && this.conversation.text}</h1>
            <div class="stats">
              <div>
                <img
                  src={getAssetPath(
                    `./assets/icons/icone-branco-comentarios.png`
                  )}
                  alt=""
                />
                {(this.conversation.statistics &&
                  this.conversation.statistics.comments.approved) ||
                  0}{" "}
                comentarios
              </div>
              <div>
                <img
                  src={getAssetPath(`./assets/icons/icone-branco-votos.png`)}
                  alt=""
                />
                {(this.conversation.statistics &&
                  this.conversation.statistics.votes.total) ||
                  0}{" "}
                votos
              </div>
              <div id="seta">
                <img
                  src={getAssetPath(
                    `./assets/icons/seta-branca-para-fundo-azul.png`
                  )}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div class="comment">
            <div id="comment-header">
              <h2>comentários</h2>
            </div>
            <div class="card-transition">
              <div class="card comment-card">
                <div class="comment-owner">
                  <div>
                    <img
                      src={getAssetPath(`./assets/icons/simbolo-ucc-m.png`)}
                      alt=""
                    />
                    <span>{this.user.displayName || "Participante"}</span>
                  </div>
                </div>
                <div class="comment-title">
                  {this.comment && <div>{this.comment.content}</div>}
                </div>
                <div id="choices">
                  <div class="choice">
                    <paper-button
                      class="green"
                      onClick={this.voteOnAgree.bind(this)}
                    >
                      <i class="fa fa-check"></i>
                    </paper-button>
                    <div class="agree">Concordar</div>
                  </div>
                  <div class="choice">
                    <paper-button
                      class="pink"
                      onClick={this.voteOnSkip.bind(this)}
                    >
                      <i class="fa fa-arrow-right"></i>
                    </paper-button>
                    <div class="skip">Pular</div>
                  </div>
                  <div class="choice">
                    <paper-button
                      class="red"
                      onClick={this.voteOnDisagree.bind(this)}
                    >
                      <i class="fa fa-times"></i>
                    </paper-button>
                    <div class="disagree">Discordar</div>
                  </div>
                </div>
                <div class="remaining-votes">
                  {(this.user.stats && this.user.stats.votes) || 0}/
                  {(this.user.stats &&
                    this.user.stats.missing_votes + this.user.stats.votes) ||
                    0}
                </div>
                <div id="deck-1"></div>
                <div id="deck-2"></div>
              </div>
            </div>
            <div class="card new-comment-card">
              <div class="advise">Deixe o seu comentário.</div>
              <div class="advise remaining-comments">
                Você ainda tem {Math.abs(this.user.stats.createdComments)}{" "}
                comentários disponíveis
              </div>
              <textarea
                onChange={(event: UIEvent) => this.setCommentContent(event)}
              />
              <paper-button
                class="card-btn"
                onClick={this.addComment.bind(this)}
              >
                <div>enviar comentario</div>
              </paper-button>
            </div>
            {this.user.stats.createdComments < 2 && (
              <div
                class="add-comment"
                onClick={this.toggleCommentCard.bind(this)}
              >
                <div>
                  {!this.newCommentMode && (
                    <img
                      src={getAssetPath(`./assets/icons/icone-mais.png`)}
                      alt=""
                    />
                  )}
                  {this.newCommentMode && (
                    <img
                      src={getAssetPath(`./assets/icons/icone-fechar.png`)}
                      alt=""
                    />
                  )}
                  <span>Criar Comentario</span>
                </div>
              </div>
            )}
          </div>
          <div class="my-comments">
            {this.user.stats.createdComments}/2 comentários
          </div>
          <div class="my-comments">
            {this.user.stats.pendingComments || 0} aguardando moderação
          </div>
          <div class="author">
            <span>Feito por: </span>
            <img src={getAssetPath(`./assets/icons/logo-ej-mini.png`)} alt="" />
          </div>
        </div>
      </div>
    );
  }
}
