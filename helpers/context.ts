import { ACPayload, JWTHandler } from "./JWTHandler.ts";
export interface AppContext {
  jwt: JWTHandler;
  JWTclaims: ACPayload;
  bodyValue: { email: string; password: string; token: string; name: string };
}
