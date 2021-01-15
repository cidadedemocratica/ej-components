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
  @Prop() currentContainer: number = 0;
  @Prop() currentStep: number = 0;
  @Prop() theme: string;
  @Event({
    bubbles: true,
    composed: true,
  })
  closeBoard: EventEmitter;
  themeOptions: any = {
    osf: {
      h1: "todos importam na luta contra a corrupção",
      lgpdText:
        "Essa consulta tem o objetivo de coletar opiniões para melhorar o ambiente escolar. Nós utilizamos os cookies do google analytics e mautic para fazer a sua autenticação e para melhorar a eficiência desta ferramenta ao combinar os dados de opinião com as informações comportamentais que você nos fornece ao navegar pelo nosso domínio. Caso você tenha nos fornecido ou forneça no futuro, diretamente, alguma informação pessoal (email, telefone etc) usaremos os cookies para te identificar. Caso contrário sua autenticação será anônima. Não fornecemos suas informações pessoais para nenhum meio externo e caso queira que seus dados sejam excluídos por favor clique na opção opt-out. Para obter mais detalhes de nossa política de privacidade, por favor acesse-a diretamente no link abaixo",
      privacyPolitic:
        "http://privacidade.transparenciainternacional.org.br/unidos-contra-a-corrupcao/",
    },
    votorantim: {
      h1: "AGENTES DA CIDADANIA",
      lgpdText:
        "Essa consulta tem o objetivo de coletar opiniões para melhorar o ambiente escolar. Nós utilizamos os cookies do google analytics e mautic para fazer a sua autenticação e para melhorar a eficiência desta ferramenta ao combinar os dados de opinião com as informações comportamentais que você nos fornece ao navegar pelo nosso domínio. Caso você tenha nos fornecido ou forneça no futuro, diretamente, alguma informação pessoal (email, telefone etc) usaremos os cookies para te identificar. Caso contrário sua autenticação será anônima. Não fornecemos suas informações pessoais para nenhum meio externo e caso queira que seus dados sejam excluídos por favor clique na opção opt-out. Para obter mais detalhes de nossa política de privacidade, por favor acesse-a diretamente no link abaixo",
      privacyPolitic: "https://www.ejparticipe.org/usage/",
    },
    icd: {
      h1: "INSTITUTO CIDADE DEMOCRÁTICA",
      lgpdText:
        "Essa consulta tem o objetivo de coletar opiniões para melhorar o ambiente escolar. Nós utilizamos os cookies do google analytics e mautic para fazer a sua autenticação e para melhorar a eficiência desta ferramenta ao combinar os dados de opinião com as informações comportamentais que você nos fornece ao navegar pelo nosso domínio. Caso você tenha nos fornecido ou forneça no futuro, diretamente, alguma informação pessoal (email, telefone etc) usaremos os cookies para te identificar. Caso contrário sua autenticação será anônima. Não fornecemos suas informações pessoais para nenhum meio externo e caso queira que seus dados sejam excluídos por favor clique na opção opt-out. Para obter mais detalhes de nossa política de privacidade, por favor acesse-a diretamente no link abaixo",
      privacyPolitic: "https://www.ejparticipe.org/usage/",
    },
  };

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
                <h1>{this.themeOptions[this.theme].h1}</h1>
                <div class="lgpd">
                  <span>
                    <i>
                      {this.themeOptions[this.theme].lgpdText}&nbsp;
                      <a
                        target="_blank"
                        href={this.themeOptions[this.theme].privacyPolitic}
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
                    <button
                      class={"lgpd-card-btn " + `card-btn-${this.theme}`}
                      onClick={this.lgpdAgree.bind(this)}
                    >
                      aceito e vou responder
                    </button>
                  </div>
                  <div>
                    <button
                      class={
                        "lgpd-card-btn-unfocused " +
                        `card-btn-unfocused-${this.theme}`
                      }
                      onClick={this.lgpdDisagree.bind(this)}
                    >
                      não estou de acordo
                    </button>
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
                <h1>{this.themeOptions[this.theme].h1}</h1>
              </div>
              <div class="engage-modal">
                <div>
                  <button
                    onClick={this.nextBoard.bind(this)}
                    class={"card-btn " + `card-btn-${this.theme}`}
                  >
                    veja como participar
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.skip.bind(this)}
                    class={"skip-card " + `skip-card-${this.theme}`}
                  >
                    pular apresentação
                  </button>
                </div>
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
                <div>
                  <button
                    onClick={this.previousBoard.bind(this)}
                    class={"card-btn " + `card-btn-${this.theme}`}
                  >
                    anterior
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.nextBoard.bind(this)}
                    class={"card-btn " + `card-btn-${this.theme}`}
                  >
                    proximo
                  </button>
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
                <div>
                  <button
                    onClick={this.previousBoard.bind(this)}
                    class={"card-btn " + `card-btn-${this.theme}`}
                  >
                    anterior
                  </button>
                </div>
                <div>
                  <button
                    onClick={this.nextBoard.bind(this)}
                    class={"card-btn " + `card-btn-${this.theme}`}
                  >
                    fechar
                  </button>
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
