import { Context, hash, Status, superstruct } from "../deps.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { isEmail } from "../helpers/validations.ts";
import { User } from "../models/User.ts";
import { AppContext, RequestContext } from "../helpers/context.ts";

export const userProfile = async (ctx: Context<RequestContext, AppContext>) => {
  const emailValidate = () =>
    superstruct.define("email", (value: string) => isEmail(value));

  const updateSchema = superstruct.object({
    name: superstruct.string(),
    email: emailValidate(),
    password: superstruct.optional(superstruct.string()),
  });

  //Validate request body against a schmea
  superstruct.assert(ctx.state.bodyValue, updateSchema);

  const { name, email, password } = ctx.state.bodyValue;

  //Fetch the user from the database
  const result = ctx.app.state.db.queryEntries<User>(
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

    const userObj = ctx.app.state.db.queryEntries<User>(
      `UPDATE users SET name = $1, email = $2, password = $3, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $4 RETURNING uuid, name, email, password, active, created_at, updated_at;`,
      [name, email, hashpassword, ctx.state.JWTclaims.id],
    );

    const user = userObj[0];

    const userAccesstoken = await ctx.app.state.jwt.makeAccesstoken(user);
    const userRefreshtoken = await ctx.app.state.jwt.makeRefreshtoken(
      ctx.app.state.db,
      user,
    );

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
    const userObj = ctx.state.db.queryEntries<User>(
      `UPDATE users SET name = $1, email = $2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $3 RETURNING uuid, name, email, password, active, created_at, updated_at;`,
      [name, email, ctx.state.JWTclaims.id],
    );

    const user = userObj[0];

    const userAccesstoken = await ctx.app.state.jwt.makeAccesstoken(user);
    const userRefreshtoken = await ctx.app.state.jwt.makeRefreshtoken(
      ctx.app.state.db,
      user,
    );

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
};
