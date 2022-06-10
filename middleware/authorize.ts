import { Context, Status } from "../deps.ts";
import log from "../helpers/log.ts";
import { RequestContext } from "../helpers/context.ts";

export const authorize = async (
  ctx: Context<RequestContext>,
  next: () => Promise<unknown>,
) => {
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

  const payload = await ctx.app.state.jwt.validateJWT(userJWT);

  ctx.state.JWTclaims = payload;

  return next();
};
