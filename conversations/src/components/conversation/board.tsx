import {
  Component,
  Prop,
  Event,
  h,
  Element,
  getAssetPath
} from "@stencil/core";
import { API } from "./api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation-board"
})
export class EjConversationBoard {
  // Indicate that name should be a public property on the component
  @Element() el!: HTMLStencilElement;
  @Prop() currentContainer: number = 1;

  nextBoard() {
    if (this.currentContainer == 3) {
      this.skip();
      return;
    }
    let previousContainerNum = this.currentContainer;
    this.currentContainer = this.currentContainer + 1;
    let previousContainer: HTMLElement = this.el.querySelector(
      `#container${previousContainerNum}`
    );
    let nextContainer: HTMLElement = this.el.querySelector(
      `#container${this.currentContainer}`
    );
    previousContainer.style.display = "none";
    nextContainer.style.display = "block";
  }

  previousBoard() {
    let hideContainerNum = this.currentContainer;
    this.currentContainer = this.currentContainer - 1;
    let hideContainer: HTMLElement = this.el.querySelector(
      `#container${hideContainerNum}`
    );
    let currentContainer: HTMLElement = this.el.querySelector(
      `#container${this.currentContainer}`
    );
    currentContainer.style.display = "block";
    hideContainer.style.display = "none";
  }

  skip() {
    let board: HTMLElement = this.el.querySelector(".board");
    board.style.display = "none";
  }

  render() {
    return (
      <div class="board">
        <div class="background"></div>
        <div class="modal">
          <div id="container1">
            <div class="board-header">
              <div class="img">
                <img
                  src={getAssetPath(`./assets/icons/simbolo-ucc-m.png`)}
                  alt=""
                />
              </div>
              <h1>todos importam na luta contra a corrupção.</h1>
              <h2>
                algum texto aleatorio aqui para termos uma noção de espaçamento.
              </h2>
            </div>
            <div class="card-btn">
              <div onClick={this.nextBoard.bind(this)}>
                veja como participar
              </div>
            </div>
            <div class="skip-modal" onClick={this.skip.bind(this)}>
              <span>pular apresentação</span>
            </div>
          </div>
          <div id="container2">
            <div class="board-header">
              <div class="img">
                <img
                  src={getAssetPath(
                    `./assets/icons/icone-cards-onboarding.png`
                  )}
                  alt=""
                />
              </div>
              <h1>Avalie comentarios</h1>
              <h2>Vote nos comentários dos participantes.</h2>
            </div>
            <div class="control-modal">
              <div class="card-btn" onClick={this.previousBoard.bind(this)}>
                <div>anterior</div>
              </div>
              <div class="card-btn" onClick={this.nextBoard.bind(this)}>
                {" "}
                <div>proximo</div>{" "}
              </div>
            </div>
          </div>
          <div id="container3">
            <div class="board-header">
              <div class="img">
                <img
                  src={getAssetPath(
                    `./assets/icons/icone-adicionar-comentarios-onboarding.png`
                  )}
                  alt=""
                />
              </div>
              <h1>Inclua comentários.</h1>
              <h2>Inclua o seu comentário.</h2>
            </div>
            <div class="control-modal">
              <div class="card-btn" onClick={this.previousBoard.bind(this)}>
                <div>anterior</div>
              </div>
              <div class="card-btn" onClick={this.nextBoard.bind(this)}>
                {" "}
                <div>proximo</div>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
