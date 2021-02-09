import { Component, Prop, h, Element } from "@stencil/core";
import { API } from "./api/api";
import { HTMLStencilElement } from "@stencil/core/internal";


@Component({
  tag: "ej-conversation-groups",
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
  @Prop() theme: string;
  @Prop() host: string;
  @Prop() minimalVotesGroups: number;
  clustersIsReady: boolean = false;

  async componentDidRender() {
    this.prepareToLoad();
  }

  fixClusterizationLinkWithHttp(link: string) {
    if (this.host.includes("https")) {
      return link.replace("http", "https");
    }
    return link;
  }

  async prepareToLoad() {
    let clusterizationLink = this.fixClusterizationLinkWithHttp(
      this.conversation.links.clusterization
    );
    this.clusters = await this.api.getConversationClusters(clusterizationLink);
    this.selectedCluster = this.clusters[0];
    this.showClusters();
  }

  showClusters() {
    let loading: HTMLElement = this.el.shadowRoot.querySelector(".groups-loading");
    loading.style.display = "none";
    this.clustersIsReady = true;
  }

  showClusterData(clusterName: any, event: any) {
    let previousCluster = this.el.shadowRoot.querySelector(".active-cluster");
    previousCluster.classList.remove("active-cluster");
    event.target.classList.add("active-cluster");
    this.selectedCluster = this.clusters.filter(
      (cluster: any) => cluster.name == clusterName
    )[0];
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
          <div class="groups-loading">
            <ej-conversation-spinner background="no-background"></ej-conversation-spinner>
          </div>
          {this.clustersIsReady && this.conversation.statistics.votes.total >= this.minimalVotesGroups && (
            <div class="clusters">
              <nav>
                <i class="fa fa-chevron-left"></i>
                {this.clusters &&
                  this.clusters.map((cluster: any, index: number) =>
                    index == 0 ? (
                      <div
                        class="active-cluster"
                        onClick={this.showClusterData.bind(this, cluster.name)}
                      >
                        {cluster.name}
                      </div>
                    ) : (
                      <div
                        onClick={this.showClusterData.bind(this, cluster.name)}
                      >
                        {cluster.name}
                      </div>
                    )
                  )}
                <i class="fa fa-chevron-right"></i>
              </nav>
              <span class="clusters-message">
                Comentários típicos do grupo <b>{this.selectedCluster.name}</b>
              </span>
              <div class="details">
                {this.selectedCluster && (
                  <div>
                    <div
                      onClick={this.animateComments.bind(this, "positive")}
                      class="comments-label"
                    >
                      {this.selectedCluster.positive_comments.length > 0 && (
                        <i class={`fa fa-plus add-comment-${this.theme}`}></i>
                      )}
                      <span class={`add-comment-${this.theme}`}>
                        Comentários Positivos
                      </span>
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
                        {this.selectedCluster.positive_comments.length == 0 && (
                          <span>Nenhum comentário negativo no grupo</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div
                        onClick={this.animateComments.bind(this, "negative")}
                        class="comments-label"
                      >
                        {this.selectedCluster.negative_comments.length > 0 && (
                          <i class={`fa fa-plus add-comment-${this.theme}`}></i>
                        )}
                        <span class={`add-comment-${this.theme}`}>
                          Comentários Negativos
                        </span>
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
                      {this.selectedCluster.negative_comments.length == 0 && (
                        <span class="no-comments">
                          Nenhum comentário negativo no grupo
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {this.conversation.statistics.votes.total < this.minimalVotesGroups && (
            <div class="no-groups">
              <h2>
                Ainda não há dados suficientes para apresentar os grupos de
                opinião.
              </h2>
              Os grupos de opinião são formados a partir dos votos dos
              participantes da coleta. Um número baixo de votos pode gerar
              grupos que não condizem com a realidade. As informações sobre os
              grupos de opinião são apresentadas apenas se houver um número de
              votos superior a <b>{this.minimalVotesGroups}</b>. O número atual de
              votos computados é{" "}
              <b>{this.conversation.statistics.votes.total}</b>.
            </div>
          )}
        </div>
      </div>
    );
  }
}
