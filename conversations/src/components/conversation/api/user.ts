export class UserMetaData {
  mautic_id: number;
  analytics_id: string;
}

export class User {
  name: string;
  email: string;
  password1: string;
  password2: string;
  displayName: string;
  stats: any;
  token?: string;
  metadata: UserMetaData;

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

  save() {
    let data: any = {
      name: this.name,
      email: this.email,
      displayName: this.displayName,
      token: this.token,
      stats: this.stats,
    };
    localStorage.setItem("user", JSON.stringify(data));
  }

  static tokenIsInValid() {
    return !User.tokenIsValid();
  }

  static tokenIsValid() {
    let me = User.get();
    return me && me.token ? me.token : "";
  }

  static get() {
    let user: User = new User();
    let userData = { ...JSON.parse(localStorage.getItem("user")) };
    user.displayName = userData.displayName;
    user.email = userData.email;
    user.token = userData.token;
    user.name = userData.name;
    user.metadata = { ...userData.metadata };
    return user;
  }
}
