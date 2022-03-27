import { Context, Status, superstruct } from "../deps.ts";
import { jwtHandler } from "./mod.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { User } from "../models/User.ts";

export const recoverToken = async (ctx: Context) => {
  const recoverytokenSchema = superstruct.object({
    token: superstruct.string(),
  });

  //Validate request body against a schmea
  superstruct.assert(ctx.state.bodyValue, recoverytokenSchema);

  const { token }: { token: string } = ctx.state.bodyValue;

  //Validate Recovery
  const validatedtoken = await jwtHandler.validateJWT(token);

  //Fetch the user from the database
  const result = db.queryEntries<User>(
    `SELECT uuid, name, email, password, active, created_at, updated_at FROM users WHERE email = $1;`,
    [validatedtoken.email],
  );

  //Check if the user exists in the database, before issuing new access token
  if (!result.length) {
    log.warning("User does not exist in database");
    ctx.throw(Status.BadRequest, "Recovery token is invalid");
  }

  const user = result[0];

  const userAccesstoken = await jwtHandler.makeAccesstoken(user);
  const userRefreshtoken = await jwtHandler.makeRefreshtoken(user);

  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // TODO: Make configurable now, set to 7 days

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
};
