import { Context, hash, Status, superstruct } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { isEmail } from "../helpers/validations.ts";
import config from "../config.ts";
import { jwtHandler } from "./mod.ts";
import { User } from "../models/User.ts";

export const registration = async (ctx: Context) => {
  const emailValidate = () =>
    superstruct.define("email", (value: string) => isEmail(value));

  const registrationSchema = superstruct.object({
    name: superstruct.string(),
    email: emailValidate(),
    password: superstruct.string(),
  });

  //Validate the request against a schmea
  superstruct.assert(ctx.state.bodyValue, registrationSchema);

  const { name, email, password } = ctx.state.bodyValue;

  const emailResult = db.query(`SELECT email FROM users WHERE email = $1;`, [
    email,
  ]);

  //Check if the user exists in the database, before creating a new user
  if (emailResult.length) {
    log.warning("User already exists in database");
    ctx.throw(Status.BadRequest, "Bad Request");
  }

  const hashpassword = await hash(password);
  const uuid = crypto.randomUUID();
  const jwtid = crypto.randomUUID();

  //Create the new user in the database
  const result = db.queryEntries<User>(
    `INSERT INTO users (uuid, name, email, password, active, jwt_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now')) RETURNING uuid, name, email, jwt_id, created_at, updated_at;`,
    [uuid, name, email, hashpassword, "1", jwtid],
  );

  const user = result[0];

  const userAccesstoken = await jwtHandler.makeAccesstoken(user);
  const userRefreshtoken = await jwtHandler.makeRefreshtoken(user);

  const date = new Date();
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // TODO: Make configurable now, set to 7 days

  ctx.response.status = Status.Created;
  ctx.response.headers.set("x-authc-client-origin", `${config.CLIENTORIGIN}`);

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
    access_token: userAccesstoken.token,
    access_token_expiry: userAccesstoken.expiration,
  };

  ctx.response.body = {
    data: {
      id: user.uuid,
      type: "Register",
      attributes: userAttributes,
    },
  };
};
