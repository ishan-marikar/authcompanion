// @ts-nocheck
import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";
import { isEmail } from "../helpers/validations.ts";
import config from "../config.ts";

export const registration = async (ctx: any) => {
  try {
    //Check if the request includes a body
    if (!ctx.request.hasBody) {
      log.warning("No body");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    const body = await ctx.request.body();
    const bodyValue = await body.value;

    //Check if the request body has Content-Type = application/json
    if (body.type !== "json") {
      log.warning("Body not JSON");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    const emailValidate = () =>
      superstruct.define("email", (value: any) => isEmail(value));

    const registrationSchema = superstruct.object({
      name: superstruct.string(),
      email: emailValidate(),
      password: superstruct.string(),
    });

    //Validate the request against a schmea
    superstruct.assert(bodyValue, registrationSchema);

    const { name, email, password } = bodyValue;

    const emailResult = db.query(
      `SELECT email FROM users WHERE email = $1;`,
      [email],
    );

    //Check if the user exists in the database, before creating a new user
    if (emailResult.length) {
      log.warning("User already exists");
      ctx.throw(
        Status.BadRequest,
        "Bad Request",
      );
    }

    const hashpassword = await hash(password);
    const uuid = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();

    //Create the new user in the database
    const result = db.queryEntries(
      `INSERT INTO users (uuid, name, email, password, active, refresh_token, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE) RETURNING uuid, name, email, refresh_token, created_at, updated_at;`,
      [uuid, name, email, hashpassword, "1", refreshToken],
    );

    const user = result[0];

    const userAccesstoken = await makeAccesstoken(user);
    const userRefreshtoken = await makeRefreshtoken(user);

    ctx.response.status = Status.Created;
    ctx.response.headers.set(
      "x-authc-client-origin",
      `${config.CLIENTORIGIN}`,
    );

    ctx.cookies.set("refreshToken", userRefreshtoken, {
      httpOnly: true,
      expires: new Date("2022-01-01T00:00:00+00:00"),
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
        type: "Register",
        attributes: userAttributes,
      },
    };

    db.close();
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
