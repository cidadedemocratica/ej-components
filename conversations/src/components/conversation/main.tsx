import {
  Component,
  Prop,
  Listen,
  h,
  Element,
  getAssetPath
} from "@stencil/core";
import { API, User } from "./api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation",
  styleUrls: ["main.css", "assets/css/all.css"],
  shadow: true,
  assetsDir: "./assets"
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
  @Prop() newCommentMode: Boolean = false;

  @Listen("register")
  async registerHandler(event: any) {
    try {
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

  async componentWillLoad() {
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
        ...(await this.api.getConversationNextComment(this.conversation))
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
        content: "Obrigado por participar!"
      };
    }
  }

  private async setUserStatsState() {
    let statsData: any = {
      ...(await this.api.getUserConversationStatistics())
    };
    let userWithStats: User = { ...this.user };
    userWithStats.stats = { ...statsData };
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
    await this.api.createComment(this.newCommentContent, this.conversation);
    this.toggleCommentCard();
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
  }

  private async voteOnDisagree() {
    await this.api.computeDisagreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
    this.setUserStatsState();
  }

  private async voteOnAgree() {
    await this.api.computeAgreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
    this.setUserStatsState();
  }

  private async voteOnSkip() {
    await this.api.computeSkipVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
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

  render() {
    if (this.api.authTokenExists()) {
      return (
        <div class="box">
          <div id="user-prop">{this.user.name}</div>
          <div class="header">
            <div class="title">
              {this.conversation && this.conversation.text}
            </div>
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
          <div class="comment">
            <div id="comment-header">
              <div>COMENTÁRIOS</div>
            </div>
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
                  <button onClick={this.voteOnAgree.bind(this)}>
                    <div class="choice-btn green">
                      <i class="fa fa-check"></i>
                    </div>
                    <div class="agree">Concordar</div>
                  </button>
                </div>
                <div class="choice">
                  <button onClick={this.voteOnSkip.bind(this)}>
                    <div class="choice-btn red">
                      <i class="fa fa-arrow-right"></i>
                    </div>
                    <div class="skip">Pular</div>
                  </button>
                </div>
                <div class="choice">
                  <button onClick={this.voteOnDisagree.bind(this)}>
                    <div class="choice-btn pink">
                      <i class="fa fa-times"></i>
                    </div>
                    <div class="disagree">Discordar</div>
                  </button>
                </div>
              </div>
              <div class="remaining-votes">
                {(this.user.stats && this.user.stats.votes) || 0}/
                {(this.user.stats &&
                  this.user.stats.missing_votes + this.user.stats.votes) ||
                  0}
              </div>
            </div>
            <div class="card new-comment-card">
              <div id="advise">Deixe o seu comentário.</div>
              <div id="input">
                <textarea
                  onChange={(event: UIEvent) => this.setCommentContent(event)}
                />
              </div>
              <div id="footer">
                <div onClick={this.addComment.bind(this)}>
                  enviar comentario
                </div>
              </div>
            </div>
          </div>
          <div class="add-comment" onClick={this.toggleCommentCard.bind(this)}>
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
          <div class="author">
            <span>Feito por: </span>
            <img src={getAssetPath(`./assets/icons/logo-ej-mini.png`)} alt="" />
          </div>
        </div>
      );
    } else {
      return (
        <ej-conversation-register
          host={this.host}
          user={this.user}
        ></ej-conversation-register>
      );
    }
  }
}
