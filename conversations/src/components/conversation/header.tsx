import { Component, Prop, h, getAssetPath } from "@stencil/core";

@Component({
  tag: "ej-conversation-header",
  styleUrls: ["main.css", "assets/css/all.css"],
  shadow: true,
  assetsDir: "./assets",
})
export class EjConversationHeader {
  @Prop() conversation: any = {};
  @Prop() theme: string;

  render() {
    return (
      <div>
        <div class="box">
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
      </div>
    );
  }
}
