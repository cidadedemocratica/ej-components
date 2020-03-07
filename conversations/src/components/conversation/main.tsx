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
  @Element() el!: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() api: API;
  @Prop() user: User = new User();

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

  async componentDidLoad() {
    try {
      let queryParams: any = this.readQueryParams();
      if (queryParams) {
        this.api = new API(this.host, queryParams.cid, queryParams.commentId);
      } else {
        this.api = new API(this.host, this.cid);
      }
      this.user = { ...(await this.api.authenticate()) };
      this.conversation = await this.api.getConversation();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
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

  private displayNewCommentCard() {
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment"
    );
    let commentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#comment"
    );
    let voteOptionsContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#choices"
    );
    let addCommentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#add-comment"
    );
    commentContainer.style.display = "none";
    voteOptionsContainer.style.display = "none";
    addCommentContainer.style.display = "none";
    newCommentCard.style.display = "block";
  }

  private hideNewCommentCard() {
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment"
    );
    let commentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#comment"
    );
    let voteOptionsContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#choices"
    );
    let addCommentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#add-comment"
    );
    commentContainer.style.display = "block";
    voteOptionsContainer.style.display = "flex";
    addCommentContainer.style.display = "block";
    newCommentCard.style.display = "none";
  }

  private async setCommentContent(event: any) {
    this.newCommentContent = event.target.value;
  }

  private async addComment() {
    await this.api.createComment(this.newCommentContent, this.conversation);
    this.hideNewCommentCard();
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
  }

  private async voteOnDisagree() {
    await this.api.computeDisagreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
  }

  private async voteOnAgree() {
    await this.api.computeAgreeVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
  }

  private async voteOnSkip() {
    await this.api.computeSkipVote(this.comment);
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
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
        <div class="card">
          <div id="user-prop">{this.user.name}</div>
          <div class="header">
            <div class="title">
              {this.conversation && (
                <div id="conversation-title">{this.conversation.text}</div>
              )}
            </div>
            <div class="stats">
              <div>
                <img
                  src={getAssetPath(
                    `./assets/icons/icone-branco-comentarios.png`
                  )}
                  alt=""
                />
                32 comentarios
              </div>
              <div>
                <img
                  src={getAssetPath(`./assets/icons/icone-branco-votos.png`)}
                  alt=""
                />
                5245 votos
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
          <div class="content">
            <div id="comment-header">
              <div>COMENTÁRIOS</div>
            </div>
            <div class="content-card">
              <div class="comment-owner">
                <div>
                  <img
                    src={getAssetPath(`./assets/icons/simbolo-ucc-m.png`)}
                    alt=""
                  />
                  <span>ddavidcarlos1392@gmail.com</span>
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
              <div class="remaining-votes">5/11</div>
            </div>
          </div>
          <div
            class="add-comment"
            onClick={this.displayNewCommentCard.bind(this)}
          >
            <div>
              <img src={getAssetPath(`./assets/icons/icone-mais.png`)} alt="" />
              <span>Criar Comentario</span>
            </div>
          </div>
          <div class="new-comment">
            <div id="advise">
              Inclua um novo comentário e evite opiniões similares. Você pode
              postar apenas um comentário.
            </div>
            <div id="input">
              <textarea
                onChange={(event: UIEvent) => this.setCommentContent(event)}
              />
            </div>
            <div id="footer">
              <div>
                <div onClick={this.addComment.bind(this)}>Comentar</div>
                <div onClick={this.hideNewCommentCard.bind(this)}>Fechar</div>
              </div>
            </div>
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
