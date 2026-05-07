import type { User } from "./user";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}
