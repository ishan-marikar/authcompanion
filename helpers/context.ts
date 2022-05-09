import { ACPayload, JWTHandler } from "./JWTHandler.ts";
import { DB } from "../deps.ts";

// Global state see - https://github.com/oakserver/oak/discussions/305
export interface AppContext {
  jwt: JWTHandler;
  db: DB;
}

// Per request state
export interface RequestContext extends AppContext {
  JWTclaims: ACPayload;
  bodyValue: { email: string; password: string; token: string; name: string };
}
