import { Component, Prop, h, Element, getAssetPath } from "@stencil/core";
import { API } from "./api/api";
import { User } from "./api/user";
import { HTMLStencilElement } from "@stencil/core/internal";

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
  @Prop() ejQueryParams: any;
  @Prop() theme: string;
  @Prop() LGPDDenied: boolean = false;
  @Prop() commentsError: any = { name: "" };

  async componentWillLoad() {
    this.prepareToLoad();
  }

  componentDidRender() {
    this.setUICommentState();
  }

  async prepareToLoad() {
    try {
      this.conversation = { ...(await this.api.getConversation()) };
      this.comment = {
        ...(await this.api.getConversationNextComment(this.conversation)),
      };
      this.setUserStats();
      this.voteUsingejQueryParams(this.ejQueryParams);
    } catch (err) {
      console.log(err);
    }
  }

  private voteUsingejQueryParams(ejQueryParams: any) {
    if (!localStorage.getItem("userSawBoard")) {
      return;
    }
    if (localStorage.getItem("lgpd") != "agree") {
      return;
    }
    if (ejQueryParams.cid && ejQueryParams.commentId && ejQueryParams.choice) {
      this.vote(ejQueryParams.choice);
    }
    //from here component will use this.api.COMMENTS_ROUTE.
    this.api.config.COMMENT_ROUTE = "";
  }

  private setUICommentState(event?: any) {
    if (this.comment && !this.comment.content) {
      this.comment = {
        content: "Obrigado por participar!",
      };
    }
    if (this.lgpdDeniedByUser(event)) {
      this.LGPDDenied = true;
    }
    this.toggleChoices();
    this.toogleAddCommentButton();
  }

  lgpdDeniedByUser(event: any) {
    if (event) {
      return event && event.detail && event.detail.blockedByLGPD;
    }
    return localStorage.getItem("lgpd") == "disagree";
  }

  private toggleChoices() {
    let choices: HTMLElement = this.el.shadowRoot.querySelector("#choices");
    if (
      (this.comment.content &&
        this.comment.content == "Obrigado por participar!") ||
      this.LGPDDenied
    ) {
      choices.style.display = "none";
    } else {
      choices.style.display = "flex";
    }
  }

  private toogleAddCommentButton() {
    if (this.user.stats.createdComments == 2 || this.LGPDDenied) {
      let addCommentLink: HTMLElement = this.el.shadowRoot.querySelector(
        ".add-comment"
      );
      if (addCommentLink) {
        addCommentLink.style.display = "none";
      }
    }
  }

  private async setUserStats() {
    let voteStatsData: any = {
      ...(await this.api.getUserConversationStatistics()),
    };
    let commentStatsData: any = {
      ...(await this.api.getUserCommentsStatistics()),
    };
    let userWithStats: User = this.user;
    userWithStats.stats = { ...voteStatsData, ...commentStatsData };
    this.user.stats = userWithStats.stats;
    this.el.forceUpdate();
  }

  private toggleCommentCard() {
    this.commentsError = {};
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
      try {
        await this.api.createComment(this.newCommentContent, this.conversation);
        this.toggleCommentCard();
        this.comment = await this.api.getConversationNextComment(
          this.conversation
        );
        this.setUICommentState();
        this.setUserStats();
      } catch (e) {
        this.commentsError = {
          ...{
            name:
              "Repetido! Esse comentário já existe na conversa. Tente uma redação diferente e envie novamente",
          },
        };
      }
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
    this.showLoading();
    try {
      await this.api.computeVote(this.comment, choice);
    } catch (e) {
      console.log("could not compute vote");
    }
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.hideLoading();
    this.deckTransition();
    this.setUICommentState();
    this.setUserStats();
  }

  private showLoading() {
    let loading: HTMLElement = this.el.shadowRoot.querySelector(".loading");
    loading.style.display = "block";
    let agreeButton: any = this.el.shadowRoot.querySelector(".green");
    let disagreeButton: any = this.el.shadowRoot.querySelector(".red");
    let skipButton: any = this.el.shadowRoot.querySelector(".pink");
    agreeButton.disabled = true;
    disagreeButton.disabled = true;
    skipButton.disabled = true;
  }

  private hideLoading() {
    let loading: HTMLElement = this.el.shadowRoot.querySelector(".loading");
    loading.style.display = "none";
    let agreeButton: any = this.el.shadowRoot.querySelector(".green");
    let disagreeButton: any = this.el.shadowRoot.querySelector(".red");
    let skipButton: any = this.el.shadowRoot.querySelector(".pink");
    agreeButton.disabled = false;
    disagreeButton.disabled = false;
    skipButton.disabled = false;
  }

  resetLGPD() {
    localStorage.removeItem("userSawBoard");
    localStorage.removeItem("lgpd");
    location.reload();
  }

  render() {
    return (
      <div>
        <div class="box">
          <div id="user-prop">{this.user.name}</div>
          <div id="user-prop">{this.showRegisterComponent}</div>
          <div class={"header " + `header-${this.theme}`}>
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
                <div class={"comment-owner " + `comment-owner-${this.theme}`}>
                  <div>
                    <img
                      src={getAssetPath(
                        `./assets/icons/profile-${this.theme}.png`
                      )}
                      alt=""
                    />
                    <span>{this.user.displayName || "Participante"}</span>
                  </div>
                </div>
                <div class="comment-title">
                  {!this.LGPDDenied && this.comment && (
                    <div>{this.comment.content}</div>
                  )}
                  {this.LGPDDenied && (
                    <div>
                      Estamos tristes em não poder contar com a sua opinião.
                      Caso mude de ideia,
                      <div onClick={this.resetLGPD.bind(this)}>
                        <a href="">acesse aqui</a>
                      </div>
                      e concorde com a nossa política de privacidade.
                    </div>
                  )}
                </div>
                <div class="loading">
                  <ej-conversation-spinner background="no-background"></ej-conversation-spinner>
                </div>
                <div id="choices">
                  <div class="choice">
                    <button class="green" onClick={() => this.vote("agree")}>
                      <img
                        src={getAssetPath(`./assets/icons/icone-concorda.png`)}
                        alt=""
                      />
                    </button>
                    <div class="agree">Concordar</div>
                  </div>
                  <div class="choice">
                    <button class="pink" onClick={() => this.vote("skip")}>
                      <img
                        src={getAssetPath(`./assets/icons/icone-pular.png`)}
                        alt=""
                      />
                    </button>
                    <div class="skip">Pular</div>
                  </div>
                  <div class="choice">
                    <button
                      type="button"
                      class="red"
                      onClick={() => this.vote("disagree")}
                    >
                      <img
                        src={getAssetPath(`./assets/icons/icone-discordo.png`)}
                        alt=""
                      />
                    </button>
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
              <div class="advise">
                Deixe o seu comentário. Ele entrará para votação em até no
                máximo 48 horas de acordo com os{" "}
                <a target="_blank" href="https://www.ejparticipe.org/usage/">
                  termos de uso
                </a>{" "}
                da ferramenta.
              </div>
              <div class="advise remaining-comments">
                Você ainda tem {Math.abs(this.user.stats.createdComments - 2)}{" "}
                comentários disponíveis
              </div>
              <textarea
                onChange={(event: UIEvent) => this.setCommentContent(event)}
              />
              {this.commentsError && (
                <div class="api-error">{this.commentsError.name}</div>
              )}
              <button
                class={"card-btn " + `card-btn-${this.theme}`}
                onClick={this.addComment.bind(this)}
              >
                <div>enviar comentario</div>
              </button>
            </div>
            {this.user.stats.createdComments < 2 && (
              <div
                class={"add-comment " + `add-comment-${this.theme}`}
                onClick={this.toggleCommentCard.bind(this)}
              >
                <div>
                  {!this.newCommentMode && (
                    <img
                      src={getAssetPath(
                        `./assets/icons/icone-mais-${this.theme}.svg`
                      )}
                      alt=""
                      id="open"
                    />
                  )}
                  {this.newCommentMode && (
                    <img
                      src={getAssetPath(
                        `./assets/icons/icone-fechar-${this.theme}.svg`
                      )}
                      alt=""
                      id="close"
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
            <a target="_blank" href="https://www.ejparticipe.org/start/">
              <img
                src={getAssetPath(`./assets/icons/logo-ej-mini.png`)}
                alt=""
              />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
