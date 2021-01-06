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
  @Prop() selectedCluster: any;

  async componentWillLoad() {
    this.prepareToLoad();
  }

  async prepareToLoad() {
    this.clusters = await this.api.getConversationClusters();
    this.selectedCluster = this.clusters[0];
  }

  showClusterData(clusterName: any, _) {
    this.selectedCluster = this.clusters.filter(
      (cluster: any) => cluster.name == clusterName
    )[0];
    console.log(this.selectedCluster);
  }

  animateComments(type: any, _: string) {
    let children: any = this.el.shadowRoot.querySelector(
      `.comments-box .${type}`
    );
    let target = children.parentElement;
    let computedStyle = getComputedStyle(target);
    target.style.opacity = computedStyle.opacity == "0" ? "1" : "0";
    if (computedStyle.position == "absolute") {
      target.style.position = "unset";
    } else {
      setTimeout(() => {
        target.style.position = "absolute";
      }, 500);
    }
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
              <i class="fa fa-chevron-left"></i>
              {this.clusters &&
                this.clusters.map((cluster: any) => (
                  <div onClick={this.showClusterData.bind(this, cluster.name)}>
                    {cluster.name}
                  </div>
                ))}
              <i class="fa fa-chevron-right"></i>
            </nav>
            <div class="details">
              {this.selectedCluster && (
                <div>
                  <div
                    onClick={this.animateComments.bind(this, "positive")}
                    class="comments-label"
                  >
                    <span>Comentários Positivos</span>
                  </div>
                  <div class="comments-box">
                    <div class="positive">
                      {this.selectedCluster.positive_comments &&
                        this.selectedCluster.positive_comments.map(
                          (comment: any) => (
                            <div class="cluster-comment">
                              <div class="comment-ratio">
                                {(
                                  parseFloat(Object.keys(comment)[0]) * 100
                                ).toFixed(1)}{" "}
                                %
                              </div>
                              <div class="comment-content">
                                {Object.values(comment)[0]}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                  <div>
                    <div
                      onClick={this.animateComments.bind(this, "negative")}
                      class="comments-label"
                    >
                      <span>Comentários Negativos</span>
                    </div>
                    <div class="comments-box">
                      <div class="negative">
                        {this.selectedCluster.negative_comments &&
                          this.selectedCluster.negative_comments.map(
                            (comment: any) => (
                              <div class="cluster-comment">
                                <div class="comment-ratio">
                                  {(
                                    parseFloat(Object.keys(comment)[0]) * 100
                                  ).toFixed(1)}{" "}
                                  %
                                </div>
                                <div class="comment-content">
                                  {Object.values(comment)[0]}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
