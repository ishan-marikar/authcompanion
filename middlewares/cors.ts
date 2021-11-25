//configs
import config from "../config.ts";

// deno-lint-ignore no-explicit-any
export default (ctx: any, next: any) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", config.ORIGIN ?? "*");
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-type,Authorization,Cookie",
  );

  return next();
};
