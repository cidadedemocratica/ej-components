import { User } from "../api/user";
import { API } from "../api/api";

const user: string = JSON.stringify({
  token: "sometoken2",
  name: "teste",
  email: "teste@mail.com",
  password1: "teste1234",
  password2: "teste1234",
});

it("should get user from localStorage", () => {
  const api = new API("http://localhost", "1", "register");
  localStorage.setItem("user", user);
  expect(User.get().email).toBe("teste@mail.com");
});
