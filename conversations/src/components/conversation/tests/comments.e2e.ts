import { EjConversationComments } from "../comments";
import { API } from "../api/api";
import { newSpecPage } from "@stencil/core/testing";

it("should block lgpd", async () => {
  let closeBoadEvent = new Event("closeBoard", {
    detail: { blockedByLGPD: true },
  });
  const comments = new EjConversationComments();
  let disableAllInteractions: boolean = comments.userBlocksDataCollect(
    closeBoadEvent
  );
  expect(disableAllInteractions).toBe(true);
});

it("should reset lgpd from localStorage", async () => {
  localStorage.setItem("userSawBoard", "yes");
  localStorage.setItem("lgpd", "agree");
  const comments = new EjConversationComments();
  expect(localStorage.getItem("userSawBoard")).toBe("yes");
  expect(localStorage.getItem("lgpd")).toBe("agree");
  comments.resetLGPD();
  expect(localStorage.getItem("userSawBoard")).toBe(null);
  expect(localStorage.getItem("lgpd")).toBe(null);
});
