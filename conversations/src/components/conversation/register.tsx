import {
  Component,
  Prop,
  Event,
  EventEmitter,
  Listen,
  h,
  Element,
  getAssetPath,
} from "@stencil/core";
import { API } from "./api/api";
import { User } from "./api/user";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation-register",
})
export class EjConversationRegister {
  // Indicate that name should be a public property on the component
  @Element() el: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() api: API;
  @Prop() user: User = new User();
  @Event({
    bubbles: true,
    composed: true,
  })
  userRegisteredOnEJ: EventEmitter;
  @Prop() LGPDDenied: boolean = false;
  @Prop() theme: string = "osf";
  @Prop() registerErrors: any = { name: "" };
  errorsTranslation: any = {
    "Error: Ensure this field has at least 5 characters.":
      "Seu nome deve ter no mínimo 5 caracteres.",
  };

  @Listen("closeBoard", { target: "window" })
  async onCloseBoard(event?: any) {
    console.log("Board visualizado");
    if (this.userBlocksDataCollection(event)) {
      this.LGPDDenied = true;
    }
  }

  private userBlocksDataCollection(event?: any) {
    if (event) {
      return event && event.detail && event.detail.blockedByLGPD;
    }
    return localStorage.getItem("lgpd") == "disagree";
  }

  componentDidRender() {
    if (this.userBlocksDataCollection()) {
      this.LGPDDenied = true;
    }
  }

  private resetLGPD() {
    localStorage.removeItem("userSawBoard");
    localStorage.removeItem("lgpd");
    location.reload();
  }

  private async setUserName(event: any) {
    this.user.name = event.target.value;
  }

  private async setUserEmail(event: any) {
    this.user.email = event.target.value;
  }

  private async registerUser() {
    try {
      if (this.user.email && this.user.name) {
        this.user.setPassword();
        let response = await this.api.createUser(this.user);
        this.user.token = response.key;
        this.user.save();
        this.userRegisteredOnEJ.emit();
      }
    } catch (error) {
      this.registerErrors = {
        ...{ name: this.errorsTranslation[error.message] },
      };
    }
  }

  render() {
    return (
      <div class="box">
        <div class={"header " + `header-${this.theme}`}>
          <h1> Registre-se para participar.</h1>
          <div class="stats">
            <div>
              <img
                src={getAssetPath(
                  `./assets/icons/icone-branco-comentarios.png`
                )}
                alt=""
              />
              0 comentarios
            </div>
            <div>
              <img
                src={getAssetPath(`./assets/icons/icone-branco-votos.png`)}
                alt=""
              />
              0 votos
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
        <div class="register-card card">
          <div class="welcome">
            <span>Bem vindo!</span>
          </div>
          <div class="logo"></div>
          {!this.LGPDDenied && (
            <div class="register">
              <div id="register-name">
                <input
                  onChange={(event: UIEvent) => this.setUserName(event)}
                  placeholder="Seu Nome"
                  type="text"
                  id="name"
                />
              </div>
              {this.registerErrors && (
                <div class="api-error">{this.registerErrors.name}</div>
              )}
              <div id="register-email">
                <input
                  onChange={(event: UIEvent) => this.setUserEmail(event)}
                  placeholder="Seu Email"
                  type="text"
                  id="mail"
                />
              </div>
              <button type="button" onClick={() => this.registerUser()}>
                Participar
              </button>
            </div>
          )}
          {this.LGPDDenied && (
            <div class="lgpd-register-denied">
              <i>
                Estamos tristes em não poder contar com a sua opinião. Caso mude
                de ideia,
                <div onClick={this.resetLGPD.bind(this)}>
                  <a href="">acesse aqui</a>
                </div>
                e concorde com a nossa política de privacidade.
              </i>
            </div>
          )}
        </div>
      </div>
    );
  }
}
