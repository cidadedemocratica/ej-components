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
  tag: "ej-conversation-comments",
  styleUrls: ["main.css", "assets/css/all.css"],
  shadow: true,
  assetsDir: "./assets",
})
export class EjConversationComments {
  @Prop() api: API;
  @Element() el!: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() user: User;
  @Prop() newCommentMode: boolean = false;
  @Prop() showRegisterComponent: boolean = false;
  @Prop() queryParams: any;

  @Listen("closeBoard", { target: "window" })
  async onCloseBoard() {
    console.log("Board visualizado");
    this.setUICommentState();
    this.setUserStats();
  }

  async componentWillLoad() {
    this.prepareComponentToRender();
  }

  async prepareComponentToRender() {
    try {
      let queryParams: any = this.queryParams;
      this.api = this.newAPI(queryParams);
      this.conversation = { ...(await this.api.getConversation()) };
      this.comment = {
        ...(await this.api.getConversationNextComment(this.conversation)),
      };
      this.setUserStats();
      this.setUICommentState();
      this.voteUsingQueryParams(queryParams);
    } catch (err) {
      console.log(err);
    }
  }

  private newAPI(queryParams: any) {
    if (queryParams) {
      return new API(this.host, queryParams.cid, queryParams.commentId);
    }
    return new API(this.host, this.cid);
  }

  private voteUsingQueryParams(queryParams: any) {
    if (queryParams) {
      this.vote(queryParams.choice);
    }
    //from here component will use this.api.COMMENTS_ROUTE.
    this.api.COMMENT_ROUTE = "";
  }

  private setUICommentState() {
    if (!this.comment.content) {
      this.comment = {
        content: "Obrigado por participar!",
      };
    }
    this.hideChoices();
    this.toogleAddCommentButton();
  }

  private hideChoices() {
    if (
      this.comment.content &&
      this.comment.content == "Obrigado por participar!"
    ) {
      let choices: HTMLElement = this.el.shadowRoot.querySelector("#choices");
      choices.style.display = "none";
    }
  }

  private toogleAddCommentButton() {
    if (this.user.stats.createdComments == 2) {
      let addCommentLink: HTMLElement = this.el.shadowRoot.querySelector(
        ".add-comment"
      );
      addCommentLink.style.display = "none";
    }
  }

  private async setUserStats() {
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
    event.target.value = "";
  }

  private async addComment() {
    let userCanAdd: Boolean = await this.api.userCanAddNewComment();
    if (userCanAdd) {
      await this.api.createComment(this.newCommentContent, this.conversation);
      this.toggleCommentCard();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
      this.setUICommentState();
      this.setUserStats();
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

  private async vote(choice: string) {
    await this.api.computeVote(this.comment, choice);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.deckTransition();
    this.setUICommentState();
    this.setUserStats();
  }

  render() {
    return (
      <div>
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
                      onClick={() => this.vote("agree")}
                    >
                      <img
                        src={getAssetPath(`./assets/icons/icone-concorda.png`)}
                        alt=""
                      />
                    </paper-button>
                    <div class="agree">Concordar</div>
                  </div>
                  <div class="choice">
                    <paper-button
                      class="pink"
                      onClick={() => this.vote("skip")}
                    >
                      <img
                        src={getAssetPath(`./assets/icons/icone-pular.png`)}
                        alt=""
                      />
                    </paper-button>
                    <div class="skip">Pular</div>
                  </div>
                  <div class="choice">
                    <paper-button
                      class="red"
                      onClick={() => this.vote("disagree")}
                    >
                      <img
                        src={getAssetPath(`./assets/icons/icone-discordo.png`)}
                        alt=""
                      />
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
                Você ainda tem {Math.abs(this.user.stats.createdComments - 2)}{" "}
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
