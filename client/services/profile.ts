import { Context, Status } from "../../deps.ts";
import { JWTHandler } from "../../helpers/JWTHandler.ts";
import log from "../../helpers/log.ts";

const jwtHandler = await JWTHandler.getInstance();

export const profile = async (ctx: Context) => {
  try {
    const recoveryToken = ctx.request.url.searchParams.get("token");

    if (recoveryToken) {
      await jwtHandler.validateJWT(recoveryToken);
    }

    const body = await Deno.readTextFile(
      Deno.cwd() + "/client/profile_page.html",
    );

    ctx.response.status = Status.OK;
    ctx.response.body = body;
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
