import { Context, hash, Status, superstruct } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { isEmail } from "../helpers/validations.ts";
import { jwtHandler } from "./mod.ts";
import { User } from "../models/User.ts";

export const userProfile = async (ctx: Context) => {
  try {
    //Check if the request includes a body
    if (!ctx.request.hasBody) {
      log.debug("No request body in request");
      ctx.throw(Status.BadRequest, "Bad Request, No Request Body");
    }

    const body = ctx.request.body();
    const bodyValue = await body.value;

    //Check if the request body has Content-Type = application/json
    if (body.type !== "json") {
      log.warning("Request body does not have Content-Type = application/json");
      ctx.throw(
        Status.BadRequest,
        "Bad Request, content-type must be application/json",
      );
    }

    const emailValidate = () =>
      superstruct.define("email", (value: string) => isEmail(value));

    const updateSchema = superstruct.object({
      name: superstruct.string(),
      email: emailValidate(),
      password: superstruct.optional(superstruct.string()),
    });

    //Validate request body against a schmea
    superstruct.assert(bodyValue, updateSchema);

    const { name, email, password } = bodyValue;

    //Fetch the user from the database
    const result = db.queryEntries<User>(
      `SELECT uuid, name, email, active, created_at, updated_at FROM users WHERE uuid = $1;`,
      [ctx.state.JWTclaims.id],
    );

    //Check if the user exists in the database
    if (!result.length) {
      log.warning("User was not found in database");
      ctx.throw(Status.BadRequest, "Invalid Auth Token");
    }

    if (password) {
      const hashpassword = await hash(password);

      const userObj = db.queryEntries<User>(
        `UPDATE users SET name = $1, email = $2, password = $3, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $4 RETURNING uuid, name, email, password, active, created_at, updated_at;`,
        [name, email, hashpassword, ctx.state.JWTclaims.id],
      );

      const user = userObj[0];

      const userAccesstoken = await jwtHandler.makeAccesstoken(user);
      const userRefreshtoken = await jwtHandler.makeRefreshtoken(user);

      const date = new Date();
      date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // TODO: Make configurable now, set to 7 days

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
          type: "Updated User",
          attributes: userAttributes,
        },
      };
    } else {
      // If the user does not provide a password, just update the user's name and email
      const userObj = db.queryEntries<User>(
        `UPDATE users SET name = $1, email = $2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $3 RETURNING uuid, name, email, password, active, created_at, updated_at;`,
        [name, email, ctx.state.JWTclaims.id],
      );

      const user = userObj[0];

      const userAccesstoken = await jwtHandler.makeAccesstoken(user);
      const userRefreshtoken = await jwtHandler.makeRefreshtoken(user);

      const date = new Date();
      date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // TODO: Make configurable now, set to 7 days

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
          type: "Updated User",
          attributes: userAttributes,
        },
      };
    }
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
