import { EjConversationBoard } from "../board";
import { API } from "../api/api";
import { newSpecPage } from "@stencil/core/testing";

it("should set lgpd on localStorage", async () => {
  const board = await newSpecPage({
    components: [EjConversationBoard],
    html: `<ej-conversation-board current-container='3' theme="osf"></ej-conversation-board>`,
  });
  board.rootInstance.userCheckedBoard();
  expect(localStorage.getItem("userSawBoard")).toBe("yes");
});

it("should show lgpd board if user not saw it", async () => {
  const board = await newSpecPage({
    components: [EjConversationBoard],
    html: `<ej-conversation-board current-container='3' theme="osf"></ej-conversation-board>`,
  });
  expect(board.rootInstance.showBoard()).toBe(true);
});

it("should agree with lgpd", async () => {
  const board = await newSpecPage({
    components: [EjConversationBoard],
    html: `<ej-conversation-board current-container='3' theme="osf"></ej-conversation-board>`,
  });
  board.rootInstance.lgpdAgree();
  expect(localStorage.getItem("lgpd")).toBe("agree");
});

it("should disagree with lgpd", async () => {
  const board = await newSpecPage({
    components: [EjConversationBoard],
    html: `<ej-conversation-board current-container='3' theme="osf"></ej-conversation-board>`,
  });
  board.rootInstance.lgpdDisagree();
  expect(localStorage.getItem("lgpd")).toBe("disagree");
});
