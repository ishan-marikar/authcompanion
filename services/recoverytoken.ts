// @ts-nocheck
import { Status } from "../deps.ts";
import {
  makeAccesstoken,
  makeRefreshtoken,
  validateJWT,
} from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";
import config from "../config.ts";

export const recoverToken = async (ctx: any) => {
  try {
    //Check if the request includes a body
    if (!ctx.request.hasBody) {
      log.warning("No request body in request");
      ctx.throw(Status.BadRequest, "Bad Request, No Request Body");
    }

    const body = await ctx.request.body();
    const bodyValue = await body.value;

    //Check if the request body has Content-Type = application/json
    if (body.type !== "json") {
      log.warning("Request body does not have Content-Type = application/json");
      ctx.throw(
        Status.BadRequest,
        "Bad Request, content-type must be application/json",
      );
    }

    const recoverytokenSchema = superstruct.object({
      token: superstruct.string(),
    });

    //Validate request body against a schmea
    superstruct.assert(bodyValue, recoverytokenSchema);

    const { token } = bodyValue;

    //Validate Recovery
    const validatedtoken = await validateJWT(token);

    //Fetch the user from the database
    const result = db.queryEntries(
      `SELECT uuid, name, email, password, active, created_at, updated_at FROM users WHERE email = $1;`,
      [validatedtoken.email],
    );

    //Check if the user exists in the database, before issuing new access token
    if (!result.length) {
      log.warning("User does not exist in database");
      ctx.throw(
        Status.BadRequest,
        "Recovery token is invalid",
      );
    }

    const user = result[0];

    const userAccesstoken = await makeAccesstoken(user);
    const userRefreshtoken = await makeRefreshtoken(user);

    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // TODO: Make configurable now, set to 7 days

    ctx.response.status = Status.OK;
    ctx.cookies.set("refreshToken", userRefreshtoken, {
      httpOnly: true,
      expires: date,
      secure: config.SECURE?.toLowerCase() !== "false",
      sameSite: "none",
    });

    const userAttributes = {
      name: user.name,
      email: user.email,
      created: user.created_at,
      // deno-lint-ignore camelcase
      access_token: userAccesstoken.token,
      // deno-lint-ignore camelcase
      access_token_expiry: userAccesstoken.expiration,
    };

    ctx.response.body = {
      data: {
        id: user.uuid,
        type: "Recovery Login",
        attributes: userAttributes,
      },
    };
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
