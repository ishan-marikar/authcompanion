// @ts-nocheck
import { Status } from "../deps.ts";
import { compare } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";
import config from "../config.ts";

export const login = async (ctx: any) => {
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

    const loginSchema = superstruct.object({
      email: superstruct.string(),
      password: superstruct.string(),
    });

    //Validate request body against a schmea
    superstruct.assert(bodyValue, loginSchema);

    const { email, password } = bodyValue;

    //Fetch the user from the database
    const result = db.queryEntries(
      `SELECT uuid, name, email, password, active, created_at, updated_at FROM users WHERE email = $1;`,
      [email],
    );

    //Check if the user exists in the database, before issuing access token
    if (!result.length) {
      log.warning("User does not exist in database");
      ctx.throw(
        Status.Forbidden,
        "Username or Password is Invalid, Please Retry Login",
      );
    }

    const user = result[0];

    //Check if the user has an 'active' account
    if (!user.active) {
      log.warning("User record is not active");
      ctx.throw(
        Status.Forbidden,
        "Username or Password is Invalid, Please Retry Login",
      );
    }

    //Check their password is correct, then issue access token
    if (await compare(password, <string> user.password)) {
      const userAccesstoken = await makeAccesstoken(user);
      const userRefreshtoken = await makeRefreshtoken(user);

      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // TODO: Make configurable now, set to 7 days

      ctx.response.status = Status.OK;
      ctx.response.headers.set(
        "x-authc-client-origin",
        `${config.CLIENTORIGIN}`,
      );

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
          type: "Login",
          attributes: userAttributes,
        },
      };
    } else {
      log.warning("User did not provide a matching password");
      ctx.throw(
        Status.BadRequest,
        "Username or Password is Invalid, Please Retry Login",
      );
    }
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
