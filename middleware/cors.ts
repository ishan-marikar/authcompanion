import { Context } from "../deps.ts";
import config from "../config.ts";

export const cors = (ctx: Context, next: () => Promise<unknown>) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", config.ORIGIN ?? "*");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-type,Authorization,Cookie",
  );

  return next();
};
