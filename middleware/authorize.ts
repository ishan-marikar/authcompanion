import { Context, Status } from "../deps.ts";
import { JWTHandler } from "../helpers/JWTHandler.ts";
import log from "../helpers/log.ts";

const jwtHandler = await JWTHandler.getInstance();

export default async (ctx: Context, next: () => Promise<unknown>) => {
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

    const payload = await jwtHandler.validateJWT(userJWT);

    ctx.state.JWTclaims = payload;

    await next();
  } catch (err) {
    log.error(err);
    ctx.response.status = err.status | 400;
    ctx.response.type = "json";
    ctx.response.body = {
      errors: [
        {
          title: "Server Error",
          detail: err.message,
        },
      ],
    };
  }
};
