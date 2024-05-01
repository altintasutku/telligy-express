declare namespace Express {
  export interface Request {
    userId?: string;
    user: {
      sub: string;
      email: string;
      phone: string;
      app_metadata: {
        provider: string;
        providers: string[];
      };
      user_metadata: {
        email: string;
        email_verified: boolean;
        phone_verified: boolean;
        sub: string;
      };
    };
  }
}
