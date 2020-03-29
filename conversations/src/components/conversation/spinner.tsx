import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "ej-conversation-spinner",
})
export class EjConversationSpinner {
  @Prop() background: string = "";
  render() {
    return (
      <div>
        <div class={this.background}>
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
