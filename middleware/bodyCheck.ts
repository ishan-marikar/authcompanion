import { Context, Status } from "../deps.ts";
import log from "../helpers/log.ts";
import { AppContext } from "../helpers/context.ts";

export const bodyCheck = async (
  ctx: Context<AppContext>,
  next: () => Promise<unknown>,
) => {
  //Check if the request includes a body
  if (!ctx.request.hasBody) {
    log.warning("No request body in request");
    ctx.throw(Status.BadRequest, "Bad Request, No Request Body");
  }

  const body = ctx.request.body();

  //Check if the request body has Content-Type = application/json
  if (body.type !== "json") {
    log.warning("Request body does not have Content-Type = application/json");
    ctx.throw(
      Status.BadRequest,
      "Bad Request, content-type must be application/json",
    );
  }

  try {
    ctx.state.bodyValue = await body.value;
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      log.warning("Request body has invalid JSON");
      ctx.throw(
        Status.BadRequest,
        "Bad Request, invalid JSON",
      );
    }
    throw err;
  }
  return next();
};
