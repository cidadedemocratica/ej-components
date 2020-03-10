import { API } from "../api";

it("should check user token", () => {
  const api = new API("http://localhost", "1");
  localStorage.setItem("ejToken", "sometoken");
  expect(api.authTokenExists()).toBe(true);
});

it("should get user token", () => {
  const api = new API("http://localhost", "1");
  localStorage.setItem("ejToken", "sometoken");
  expect(api.getUserToken()).toBe("sometoken");
});

it("should set token on localstorage", () => {
  const api = new API("http://localhost", "1");
  api.setUserTokenOnLocalStorage("sometoken2");
  expect(api.getUserToken()).toBe("sometoken2");
});

it("should return user when token exists", () => {
  const api = new API("http://localhost", "1");
  api.setUserTokenOnLocalStorage("sometoken2");
  expect(api.getUser().name).toBe("sometoken2");
});

it("should return user when cookie exists", () => {
  const api = new API("http://localhost", "1");
  api.setUserTokenOnLocalStorage("sometoken2");
  api.getUserIdentifierCookie = jest.fn().mockReturnValue("12345678");
  expect(api.getUser().name).toBe("12345678-mautic");
});

it("should return mautic cookie from a list of cookies", () => {
  const api = new API("http://localhost", "1");
  let cookies: string =
    "wp-settings-time-1=1582866339; mtc_id=9015; mtc_sid=t55crwrfus0r5eblxotzvzg; mautic_device_id=t55crwrfus0r5eblxotzvzg";
  let cookie: string = api.getUserIdentifierCookie(cookies);
  expect(cookie).toBe("9015");
});

it("should return empty string from a list of cookies", () => {
  const api = new API("http://localhost", "1");
  let cookies: string =
    "wp-settings-time-1=1582866339; mtc_sid=t55crwrfus0r5eblxotzvzg; mautic_device_id=t55crwrfus0r5eblxotzvzg";
  let cookie: string = api.getUserIdentifierCookie(cookies);
  expect(cookie).toBe("");
});

it("should return commentID from EJ data", () => {
  const api = new API("http://localhost", "1");
  let comment: any = {
    links: { self: "http://localhost:8000/api/v1/comments/29/" },
    content: "Um novo comentário interessante",
    status: "approved",
    created: "2020-02-05T20:08:49.749127Z",
    rejection_reason: 0,
    rejection_reason_text: ""
  };
  let commentID: number = api.getCommentID(comment);
  expect(commentID).toBe(29);
});

it("should return conversationID from EJ data", () => {
  const api = new API("http://localhost", "1");
  let conversation: any = {
    links: {
      self: "http://localhost:8000/api/v1/conversations/5/",
      "vote-dataset":
        "http://localhost:8000/api/v1/conversations/5/vote-dataset/",
      "user-statistics":
        "http://localhost:8000/api/v1/conversations/5/user-statistics/",
      "approved-comments":
        "http://localhost:8000/api/v1/conversations/5/approved-comments/",
      "random-comment":
        "http://localhost:8000/api/v1/conversations/5/random-comment/",
      clusterization: null,
      author: "http://localhost:8000/api/v1/users/6/"
    },
    title: "participação",
    text: "O componente permite a participação do usuário?",
    author: "admin@mail.com",
    slug: "participacao",
    created: "2020-02-05T18:56:59.377152Z",
    statistics: {
      votes: { agree: 1, disagree: 2, skip: 0, total: 3 },
      comments: { approved: 9, rejected: 0, pending: 0, total: 9 },
      participants: { voters: 1, commenters: 3 }
    }
  };
  let conversationID: number = api.getConversationID(conversation);
  expect(conversationID).toBe(5);
});

it("should return comment url from EJ data", () => {
  const api = new API("http://localhost", "1");
  let conversation: any = {
    links: {
      self: "http://localhost:8000/api/v1/conversations/5/",
      "vote-dataset":
        "http://localhost:8000/api/v1/conversations/5/vote-dataset/",
      "user-statistics":
        "http://localhost:8000/api/v1/conversations/5/user-statistics/",
      "approved-comments":
        "http://localhost:8000/api/v1/conversations/5/approved-comments/",
      "random-comment":
        "http://localhost:8000/api/v1/conversations/5/random-comment/",
      clusterization: null,
      author: "http://localhost:8000/api/v1/users/6/"
    },
    title: "participação",
    text: "O componente permite a participação do usuário?",
    author: "admin@mail.com",
    slug: "participacao",
    created: "2020-02-05T18:56:59.377152Z",
    statistics: {
      votes: { agree: 1, disagree: 2, skip: 0, total: 3 },
      comments: { approved: 9, rejected: 0, pending: 0, total: 9 },
      participants: { voters: 1, commenters: 3 }
    }
  };
  let commentURL: number = api.getRandomCommentUrl(conversation);
  expect(commentURL).toBe(
    "http://localhost:8000/api/v1/conversations/5/random-comment/"
  );
});

it("should return comment url with https from EJ data", () => {
  const api = new API("https://localhost", "1");
  let conversation: any = {
    links: {
      self: "http://localhost:8000/api/v1/conversations/5/",
      "vote-dataset":
        "http://localhost:8000/api/v1/conversations/5/vote-dataset/",
      "user-statistics":
        "http://localhost:8000/api/v1/conversations/5/user-statistics/",
      "approved-comments":
        "http://localhost:8000/api/v1/conversations/5/approved-comments/",
      "random-comment":
        "http://localhost:8000/api/v1/conversations/5/random-comment/",
      clusterization: null,
      author: "http://localhost:8000/api/v1/users/6/"
    },
    title: "participação",
    text: "O componente permite a participação do usuário?",
    author: "admin@mail.com",
    slug: "participacao",
    created: "2020-02-05T18:56:59.377152Z",
    statistics: {
      votes: { agree: 1, disagree: 2, skip: 0, total: 3 },
      comments: { approved: 9, rejected: 0, pending: 0, total: 9 },
      participants: { voters: 1, commenters: 3 }
    }
  };
  let commentURL: number = api.getRandomCommentUrl(conversation);
  expect(commentURL).toBe(
    "https://localhost:8000/api/v1/conversations/5/random-comment/"
  );
});
