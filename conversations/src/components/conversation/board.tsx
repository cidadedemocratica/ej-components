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
import "@polymer/paper-button/paper-button.js";

@Component({
  tag: "ej-conversation-board",
})
export class EjConversationBoard {
  // Indicate that name should be a public property on the component
  @Element() el!: HTMLStencilElement;
  @Prop() currentContainer: number = 0;
  @Prop() currentStep: number = 0;
  @Prop() theme: string;
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

  lgpdAgree() {
    localStorage.setItem("lgpd", "agree");
    this.nextBoard();
  }

  lgpdDisagree() {
    localStorage.setItem("lgpd", "disagree");
    this.skip();
    this.closeBoard.emit({ blockedByLGPD: true });
  }

  render() {
    if (this.showBoard()) {
      return (
        <div class="board">
          <div class="background"></div>
          <div class="modal">
            <div id="container0">
              <div class={"board-header " + `board-header-${this.theme}`}>
                <div class="img">
                  <img
                    src={getAssetPath(
                      `./assets/icons/board-logo-${this.theme}.png`
                    )}
                    alt=""
                  />
                </div>
                <h1>todos importam na luta contra a corrupção.</h1>
                <div class="lgpd">
                  <span>
                    <i>
                      Ao participar desta seção, você nos ajuda a entender sua
                      opinião sobre a luta anticorrupção e como percebe
                      determinadas afirmações. Usaremos estes dados apenas para
                      melhorar a comunicação da Unidos Contra a Corrupção com
                      você e outras pessoas, conforme descrito em nossa{" "}
                      <a
                        target="_blank"
                        href="http://privacidade.transparenciainternacional.org.br/unidos-contra-a-corrupcao/"
                      >
                        Política de Privacidade
                      </a>
                      . Ao clicar no botão abaixo, entenderemos que está de
                      acordo com estes termos e aceita nos ajudar a melhorar
                      nossa comunicação.
                    </i>
                  </span>
                </div>
                <div class="lgpd-modal">
                  <div>
                    <paper-button
                      class={"lgpd-card-btn " + `lgpd-card-btn-${this.theme}`}
                      onClick={this.lgpdAgree.bind(this)}
                    >
                      aceito e vou responder
                    </paper-button>
                  </div>
                  <div>
                    <paper-button
                      class={
                        "lgpd-card-btn-unfocused " +
                        `lgpd-card-btn-${this.theme}`
                      }
                      onClick={this.lgpdDisagree.bind(this)}
                    >
                      não estou de acordo
                    </paper-button>
                  </div>
                </div>
              </div>
            </div>
            <div id="container1">
              <div class={"board-header " + `board-header-${this.theme}`}>
                <div class="img">
                  <img
                    src={getAssetPath(
                      `./assets/icons/board-logo-${this.theme}.png`
                    )}
                    alt=""
                  />
                </div>
                <h1>todos importam na luta contra a corrupção.</h1>
              </div>
              <div class={"card-btn " + `card-btn-${this.theme}`}>
                <div onClick={this.nextBoard.bind(this)}>
                  veja como participar
                </div>
              </div>
              <div
                class={"skip-modal " + `skip-modal-${this.theme}`}
                onClick={this.skip.bind(this)}
              >
                <span>pular apresentação</span>
              </div>
            </div>
            <div id="container2">
              <div class={"board-header " + `board-header-${this.theme}`}>
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
                <div
                  class={"card-btn " + `card-btn-${this.theme}`}
                  onClick={this.previousBoard.bind(this)}
                >
                  <div>anterior</div>
                </div>
                <div
                  class={"card-btn " + `card-btn-${this.theme}`}
                  onClick={this.nextBoard.bind(this)}
                >
                  {" "}
                  <div>proximo</div>{" "}
                </div>
              </div>
            </div>
            <div id="container3">
              <div class={"board-header " + `board-header-${this.theme}`}>
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
                  Além de votar, você também pode incluir comentários. Tudo isso
                  é feito na plataforma&nbsp;
                  <a target="_blank" href="https://www.ejparticipe.org/start/">
                    EJ
                  </a>
                  , um software livre brasileiro para coleta de opiniões.
                </h2>
              </div>
              <div class="control-modal">
                <div
                  class={"card-btn " + `card-btn-${this.theme}`}
                  onClick={this.previousBoard.bind(this)}
                >
                  <div>anterior</div>
                </div>
                <div
                  class={"card-btn " + `card-btn-${this.theme}`}
                  onClick={this.nextBoard.bind(this)}
                >
                  {" "}
                  <div>fechar</div>{" "}
                </div>
              </div>
            </div>
            <div class="steps">
              <div id="step0">
                <div class="circle"></div>
              </div>
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
