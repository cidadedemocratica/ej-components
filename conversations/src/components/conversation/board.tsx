import {
  Component,
  Event,
  EventEmitter,
  Prop,
  h,
  Element,
  getAssetPath,
} from "@stencil/core";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation-board",
})
export class EjConversationBoard {
  // Indicate that name should be a public property on the component
  @Element() el!: HTMLStencilElement;
  @Prop() currentContainer: number = 1;
  @Prop() currentStep: number = 1;
  @Event() closeBoard: EventEmitter;

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
    this.nextStep();
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
    this.previousStep();
  }

  previousStep() {
    let hideStepNum = this.currentStep;
    this.currentStep = this.currentStep - 1;
    let hideStep: HTMLElement = this.el.querySelector(
      `#step${hideStepNum} .circle`
    );
    let currentStep: HTMLElement = this.el.querySelector(
      `#step${this.currentStep} .circle`
    );
    currentStep.style.backgroundColor = "white";
    hideStep.style.backgroundColor = "#909090";
  }

  nextStep() {
    let previousStepNum = this.currentStep;
    this.currentStep = this.currentStep + 1;
    let previousStep: HTMLElement = this.el.querySelector(
      `#step${previousStepNum} .circle`
    );
    let nextStep: HTMLElement = this.el.querySelector(
      `#step${this.currentStep} .circle`
    );
    previousStep.style.backgroundColor = "#909090";
    nextStep.style.backgroundColor = "white";
  }

  skip() {
    let board: HTMLElement = this.el.querySelector(".board");
    board.style.display = "none";
    this.userCheckedBoard();
    this.closeBoard.emit();
  }

  userCheckedBoard() {
    localStorage.setItem("userSawBoard", "yes");
  }

  showBoard() {
    if (localStorage.getItem("userSawBoard")) {
      return false;
    }
    return true;
  }

  render() {
    if (this.showBoard()) {
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
                <h2>
                  Vote nos comentários dos participantes indicando se você
                  concorda ou discorda. Se não quiser comentar em um comentário
                  específico basta pular.
                </h2>
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
                <h2>
                  Inclua o seu comentário, o que você pensa é muito importante
                  para nós.
                </h2>
              </div>
              <div class="control-modal">
                <div class="card-btn" onClick={this.previousBoard.bind(this)}>
                  <div>anterior</div>
                </div>
                <div class="card-btn" onClick={this.nextBoard.bind(this)}>
                  {" "}
                  <div>fechar</div>{" "}
                </div>
              </div>
            </div>
            <div class="steps">
              <div id="step1">
                <div class="circle"></div>
              </div>
              <div id="step2">
                <div class="circle"></div>
              </div>
              <div id="step3">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return;
  }
}
