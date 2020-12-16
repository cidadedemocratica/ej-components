import { newSpecPage } from "@stencil/core/testing";
import { EjConversation } from "../main";
import { API } from "../api/api";

it("should render register component", async () => {
  const page = await newSpecPage({
    components: [EjConversation],
    html: `<ej-conversation host="" cid="" authenticate-with="register"></ej-conversation>`,
  });
  expect(page.root).toEqualHtml(`
     <ej-conversation authenticate-with="register" cid="" host="">
       <mock:shadow-root>
       <div>
        <ej-conversation-board theme="icd"></ej-conversation-board>
        <ej-conversation-register
          host=""
          theme="icd"
        ></ej-conversation-register>
        </div>
       </mock:shadow-root>
     </ej-conversation>
  `);
});

it("should render comments component", async () => {
  jest.mock("../api/api");
  API.prototype.authTokenExists = jest.fn().mockReturnValue(true);
  const page = await newSpecPage({
    components: [EjConversation],
    html: `<ej-conversation host="" cid="" authenticate-with="register"></ej-conversation>`,
  });
  expect(page.root).toEqualHtml(`
     <ej-conversation authenticate-with="register" cid="" host="">
       <mock:shadow-root>
         <div>
          <div id="user-prop"></div>
           <ej-conversation-board theme="icd"></ej-conversation-board>
           <ej-conversation-header theme="icd"></ej-conversation-header>
           <div>
           <nav>
           <div class="title">
           <h2 class="focused-title">
             Comentários
           </h2>
           </div>
           <div class="title">
           <h2 class="unfocused-title">
             Grupos
           </h2>
           </div>
           </nav>
           <ej-conversation-comments
            host=""
            theme="icd"
          ></ej-conversation-comments>
         </div>
       </mock:shadow-root>
     </ej-conversation>
  `);
});

it("should read ej params from url", () => {
  let search: string =
    "?utm_medium=direct&utm_campaign=primconv&cid=1&comment_id=28&choice=agree";
  const component = new EjConversation();
  let ejQueryParams: any = component.getEJQueryParams(search);
  expect(ejQueryParams).toStrictEqual({
    cid: "1",
    commentId: "28",
    choice: "agree",
  });
});

it("should read ej params from url with random order", () => {
  let search: string =
    "?cid=1&utm_medium=direct&comment_id=28&choice=agree&utm_campaign=primconv";
  const component = new EjConversation();
  let ejQueryParams: any = component.getEJQueryParams(search);
  expect(ejQueryParams).toStrictEqual({
    cid: "1",
    commentId: "28",
    choice: "agree",
  });
});

it("should return empty object from url with no ej params", () => {
  let search: string = "?utm_medium=direct&utm_campaign=primconv";
  const component = new EjConversation();
  let ejQueryParams: any = component.getEJQueryParams(search);
  expect(ejQueryParams).toStrictEqual({
    cid: "",
    commentId: "",
    choice: "",
  });
});
