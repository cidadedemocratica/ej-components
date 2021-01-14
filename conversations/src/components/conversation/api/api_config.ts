export class APIConfig {
  HOST: string = "";
  API_URL: string = "";
  CONVERSATIONS_ROUTE: string = "";
  VOTES_ROUTE: string = "";
  COMMENTS_ROUTE: string = "";
  REGISTRATION_ROUTE: string = "";
  COMMENT_ROUTE: string = "";
  USER_STATISTICS_ROUTE: string = "";
  USER_COMMENTS_ROUTE: string = "";
  USER_PENDING_COMMENTS_ROUTE: string = "";
  VOTE_CHOICES: any = { skip: 0, agree: 1, disagree: -1 };
  COOKIES_MAP: any = {
    analytics: "_ga",
    mautic: "mtc_id",
  };

  constructor(host: string, conversationID: string, commentID?: string) {
    this.HOST = host;
    this.API_URL = `${this.HOST}/api/v1`;
    this.CONVERSATIONS_ROUTE = `${this.API_URL}/conversations/${conversationID}/`;
    this.VOTES_ROUTE = `${this.API_URL}/votes/`;
    this.COMMENTS_ROUTE = `${this.API_URL}/comments/`;
    if (commentID) {
      this.COMMENT_ROUTE = `${this.API_URL}/comments/${commentID}/`;
    }
    this.REGISTRATION_ROUTE = `${this.HOST}/rest-auth/registration/`;
    this.USER_STATISTICS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-statistics/`;
    this.USER_COMMENTS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-comments/`;
    this.USER_PENDING_COMMENTS_ROUTE = `${this.API_URL}/conversations/${conversationID}/user-pending-comments/`;
  }
}
