export class User {
  name: string;
  email: string;
  password1: string;
  password2: string;
  displayName: string;
  stats: any;
  token?: string;

  constructor(
    name?: string,
    email?: string,
    password1?: string,
    password2?: string
  ) {
    this.name = name || "";
    this.email = email || "";
    this.password1 = password1 || email;
    this.password2 = password2 || email;
    this.displayName = "";
    this.stats = {};
  }

  setPassword() {
    this.password1 = this.email;
    this.password2 = this.email;
  }

  saveOnLocalStorage() {
    let data: any = {
      name: this.name,
      email: this.email,
      displayName: this.displayName,
      token: this.token,
      stats: this.stats,
    };
    localStorage.setItem("user", JSON.stringify(data));
  }

  static get() {
    let user: User = new User();
    user = { ...JSON.parse(localStorage.getItem("user")) };
    return user;
  }
}
