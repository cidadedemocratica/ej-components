import { Component, Prop, h, Element } from "@stencil/core";
import { API } from "./api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation",
  styleUrl: "my-component.css",
  shadow: true
})
export class EjConversation {
  @Element() el: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() api: API = new API(this.host, this.cid);
  @Prop() user: any = {
    name: "",
    email: "",
    password1: "pass",
    password2: "pass"
  };

  async componentDidLoad() {
    try {
      await this.api.authenticate();
      this.conversation = await this.api.getConversation();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
      this.setCommentState();
    } catch (err) {
      console.log(err);
    }
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

  private async setUserName(event: any) {
    this.user.name = event.target.value;
  }

  private async setUserEmail(event: any) {
    this.user.email = event.target.value;
  }

  private async registerUser() {
    try {
      let response = await this.api.createUserFromData(this.user);
      this.api.setUserTokenOnLocalStorage(response.key);
      this.conversation = await this.api.getConversation();
      this.comment = await this.api.getConversationNextComment(
        this.conversation
      );
      this.setCommentState();
    } catch (error) {
      console.log(error);
    }
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

  render() {
    if (this.api.authTokenExists()) {
      return (
        <div class="card">
          <div id="title">
            <div>
              {this.conversation && (
                <div id="conversation-title">{this.conversation.text}</div>
              )}
            </div>
          </div>
          <div class="card-content">
            <div id="comment">
              <div>
                {this.comment && (
                  <div id="comment-content">{this.comment.content}</div>
                )}
              </div>
            </div>
            <div id="choices">
              <div class="disagree" onClick={this.voteOnDisagree.bind(this)}>
                Descordar
              </div>
              <div class="skip" onClick={this.voteOnSkip.bind(this)}>
                Pular
              </div>
              <div class="agree" onClick={this.voteOnAgree.bind(this)}>
                Concordar
              </div>
            </div>
          </div>
          <div id="add-comment" onClick={this.displayNewCommentCard.bind(this)}>
            <div>Adicionar Comentario</div>
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
        <div class="card">
          <div class="logo"></div>
          <div class="register">
            <div id="register-name">
              <input
                onChange={(event: UIEvent) => this.setUserName(event)}
                placeholder="Seu Nome"
                type="text"
                id="name"
              />
            </div>
            <div id="register-email">
              <input
                onChange={(event: UIEvent) => this.setUserEmail(event)}
                placeholder="Seu Email"
                type="text"
                id="mail"
              />
            </div>
            <button onClick={() => this.registerUser()}>Participar</button>
          </div>
        </div>
      );
    }
  }
}
