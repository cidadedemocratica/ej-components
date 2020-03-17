import { Component, h } from "@stencil/core";

@Component({
  tag: "ej-conversation-spinner"
})
export class EjConversationSpinner {
  render() {
    return (
      <div>
        <div class="background">
          <div class="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }
}
