import { newSpecPage } from "@stencil/core/testing";
import { EjConversation } from "../main";
import { API } from "../api";

it("should render spinner component", async () => {
  const page = await newSpecPage({
    components: [EjConversation],
    html: `<ej-conversation host="" cid=""></ej-conversation>`,
  });
  expect(page.root).toEqualHtml(`
     <ej-conversation cid="" host="">
       <mock:shadow-root>
         <div>
          <div id="user-prop"></div>
           <ej-conversation-spinner background="background"></ej-conversation-spinner>
         </div>
       </mock:shadow-root>
     </ej-conversation>
  `);
});

it("should render register component", async () => {
  const page = await newSpecPage({
    components: [EjConversation],
    html: `<ej-conversation show-register-component="true" host="" cid=""></ej-conversation>`,
  });
  expect(page.root).toEqualHtml(`
     <ej-conversation show-register-component="true" cid="" host="">
       <mock:shadow-root>
        <ej-conversation-register
          host=""
        ></ej-conversation-register>
       </mock:shadow-root>
     </ej-conversation>
  `);
});

it("should render comments component", async () => {
  jest.mock("../api");
  API.prototype.authTokenExists = jest.fn().mockReturnValue(true);
  const page = await newSpecPage({
    components: [EjConversation],
    html: `<ej-conversation host="" cid=""></ej-conversation>`,
  });
  expect(page.root).toEqualHtml(`
     <ej-conversation cid="" host="">
       <mock:shadow-root>
         <div>
          <div id="user-prop"></div>
           <ej-conversation-board></ej-conversation-board>
           <ej-conversation-comments
            cid=""
            host=""
          ></ej-conversation-comments>
         </div>
       </mock:shadow-root>
     </ej-conversation>
  `);
});
