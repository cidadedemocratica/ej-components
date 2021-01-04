import { Component, Prop, h, Element, getAssetPath } from "@stencil/core";
import { API } from "./api/api";
import { HTMLStencilElement } from "@stencil/core/internal";

@Component({
  tag: "ej-conversation-infos",
  styleUrls: ["main.css", "assets/css/all.css"],
  shadow: true,
  assetsDir: "./assets",
})
export class EjConversationInfos {
  @Prop() api: API;
  @Element() el!: HTMLStencilElement;
  @Prop() conversation: any = {};
  @Prop() clusters: Array<any>;

  async componentWillLoad() {
    this.prepareToLoad();
  }

  async prepareToLoad() {
    this.clusters = await this.api.getConversationClusters();
  }

  render() {
    return (
      <div>
        <div class="box">
          <div class="stats infos-component">
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
            <div id="seta">
              <img
                src={getAssetPath(
                  `./assets/icons/seta-branca-para-fundo-azul.png`
                )}
                alt=""
              />
            </div>
          </div>
          <div class="clusters">
            <nav>
              {this.clusters &&
                this.clusters.map((cluster: any) => <div>{cluster.name}</div>)}
            </nav>
          </div>
        </div>
      </div>
    );
  }
}
