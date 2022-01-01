import { Status } from "../deps.ts";
import { validateJWT } from "../helpers/jwtutils.ts";
import log from "../helpers/log.ts";

// deno-lint-ignore no-explicit-any
export default async (ctx: any, next: any) => {
  try {
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

    const payload = await validateJWT(userJWT);

    ctx.state.JWTclaims = payload;

    await next();
  } catch (err) {
    log.error(err);
    ctx.response.status = err.status | 400;
    ctx.response.type = "json";
    ctx.response.body = {
      errors: [{
        title: "Server Error",
        detail: err.message,
      }],
    };
  }
};
