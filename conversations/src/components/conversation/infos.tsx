import { Component, Prop, h, Element } from "@stencil/core";
import { API } from "./api/api";
import { User } from "./api/user";
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
  @Prop() host: string;
  //conversation_id
  @Prop() cid: string;
  @Prop() comment: any = {};
  @Prop() newCommentContent: string = "";
  @Prop() user: User;
  @Prop() newCommentMode: boolean = false;
  @Prop() showRegisterComponent: boolean = false;
  @Prop() ejQueryParams: any;
  @Prop() theme: string;
  @Prop() LGPDDenied: boolean = false;
  @Prop() commentsError: any = { name: "" };

  async componentWillLoad() {
    this.prepareToLoad();
  }

  async prepareToLoad() {}

  render() {
    return (
      <div>
        <div class="box"></div>
      </div>
    );
  }
}
