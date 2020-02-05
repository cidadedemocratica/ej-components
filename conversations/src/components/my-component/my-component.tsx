import { Component, Prop, h, Element } from "@stencil/core";
import { API } from "./api";

@Component({
  tag: "ej-conversation",
  styleUrl: "my-component.css",
  shadow: true
})
export class EjConversation {
  @Element() el: HTMLElement;
  @Prop() conversation: any = {};
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() api: API;

  async connectedCallback() {
    let host: string = document.querySelector("ej-conversation").attributes[
      "host"
    ].value;
    let conversation_id: string = document.querySelector("ej-conversation")
      .attributes["id"].value;

    this.api = new API(host, conversation_id);
    await this.api.authenticate();
    this.conversation = await this.api.getConversation();
    this.comment = await this.api.getConversationNextComment(this.conversation);
    this.setCommentState();
  }

  async componentDidLoad() {}

  private setCommentState() {
    if (!this.comment.content) {
      this.comment = {
        content: "Obrigado por participar!"
      };
    }
  }

  private displayNewCommentCard() {
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment-content"
    );
    let commentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".comment-container"
    );
    let voteOptionsContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".vote-options-container"
    );
    let addCommentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#add-comment-container"
    );
    commentContainer.style.display = "none";
    voteOptionsContainer.style.display = "none";
    addCommentContainer.style.display = "none";
    newCommentCard.style.display = "block";
  }

  private hideNewCommentCard() {
    let newCommentCard: HTMLElement = this.el.shadowRoot.querySelector(
      ".new-comment-content"
    );
    let commentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".comment-container"
    );
    let voteOptionsContainer: HTMLElement = this.el.shadowRoot.querySelector(
      ".vote-options-container"
    );
    let addCommentContainer: HTMLElement = this.el.shadowRoot.querySelector(
      "#add-comment-container"
    );
    commentContainer.style.display = "block";
    voteOptionsContainer.style.display = "block";
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

  render() {
    return (
      <div class="card">
        <div class="card-content">
          <div class="conversation-title-container">
            <div>
              {this.conversation && (
                <div id="conversation-title">{this.conversation.text}</div>
              )}
            </div>
          </div>
          <div
            class="
            comment-container"
          >
            <div>
              {this.comment && (
                <div id="comment-content">{this.comment.content}</div>
              )}
            </div>
          </div>
          <div class="vote-options-container">
            <div class="vote-options">
              <div class="disagree" onClick={this.voteOnDisagree.bind(this)}>
                DISAGREE
              </div>
              <div class="skip" onClick={this.voteOnSkip.bind(this)}>
                SKIP
              </div>
              <div class="agree" onClick={this.voteOnAgree.bind(this)}>
                AGREE
              </div>
            </div>
          </div>
          <div
            id="add-comment-container"
            onClick={this.displayNewCommentCard.bind(this)}
          >
            <div id="add-comment">Adicionar Comentario</div>
          </div>
        </div>
        <div class="new-comment-content">
          <div id="new-comment-advise">
            Inclua um novo comentário e evite opiniões similares. Você pode
            postar apenas um comentário.
          </div>
          <div id="new-comment-input">
            <input
              type="text"
              onChange={(event: UIEvent) => this.setCommentContent(event)}
            />
          </div>
          <div onClick={this.addComment.bind(this)}>Submit</div>
          <div onClick={this.hideNewCommentCard.bind(this)}>Fechar</div>
        </div>
      </div>
    );
  }
}
