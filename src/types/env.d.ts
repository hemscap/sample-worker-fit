// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      JWT_SECRET: string;

      SESSION_SECRET: string;

      DB_PATH?: string;

      DEFAULT_USER: string;
      DEFAULT_PASS: string;

      NODE_ENV?: "development" | "production";

      ACCESS_TOKEN_EXECUTE: string;
      ACCESS_TOKEN_MODIFY: string;
      API_GET_MY_EXERCISES: string;
      API_REDIRECT_CREATE_EXERCISE: string;
      API_REDIRECT_EXECUTE_EXERCISE: string;
      API_REDIRECT_MODIFY_EXERCISE: string;
      API_GET_EXERCISE_VIDEO: string;

    }
  }
}

export {};
