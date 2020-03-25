import { Component, h, getAssetPath } from "@stencil/core";
import "@polymer/paper-button/paper-button.js";

@Component({
  tag: "ej-opinion-button",
  styleUrl: "my-component.css",
  shadow: true,
  assetsDir: "./assets",
})
export class EjOpinionButton {
  redirectToPage() {
    window.location.href = "/opiniao";
  }
  render() {
    return (
      <div class="box">
        <paper-button class="button" onClick={this.redirectToPage.bind(this)}>
          <img
            src={getAssetPath(`./assets/icons/icone-branco-comentarios.png`)}
          />
          dê sua opinião
        </paper-button>
      </div>
    );
  }
}
