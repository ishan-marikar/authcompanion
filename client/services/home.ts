import { Status } from "../../deps.ts";
import log from "../../helpers/log.ts";

// deno-lint-ignore no-explicit-any
export const home = async (ctx: any) => {
  try {
    const body = await Deno.readTextFile(
      Deno.cwd() + "/client/home_page.html",
    );

    ctx.response.status = Status.OK;
    ctx.response.body = body;
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
