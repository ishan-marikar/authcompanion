import { Context, Status } from "../deps.ts";
import { JWTHandler } from "../helpers/JWTHandler.ts";
import log from "../helpers/log.ts";

const jwtHandler = await JWTHandler.getInstance();

export const authorize = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("authorization");

  if (!authHeader) {
    log.debug("Missing auth header");
    ctx.throw(Status.Unauthorized, "Unauthorized");
  }

  const userJWT = authHeader.split(" ")[1];

  if (!userJWT) {
    log.debug("Missing access token in header");
    ctx.throw(Status.Unauthorized, "Unauthorized");
  }

  const payload = await jwtHandler.validateJWT(userJWT);

  ctx.state.JWTclaims = payload;

  return next();
};
