import { Component, Prop, h, getAssetPath } from "@stencil/core";

@Component({
  tag: "ej-comments-footer",
})
export class EjCommentsFooter {
  @Prop() stats: any;

  render() {
    return (
      <div>
        <div class="my-comments">
          {this.stats.createdComments}/2 comentários
        </div>
        <div class="my-comments">
          {this.stats.pendingComments || 0} aguardando moderação
        </div>
        <div class="author">
          <span>Feito por: </span>
          <a target="_blank" href="https://www.ejparticipe.org/start/">
            <img
              src={getAssetPath(`./assets/icons/logo-ej-mini.png`)}
              alt=""
              />
          </a>
        </div>
      </div>
    );
  }
}