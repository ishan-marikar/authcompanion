import { compare, Context, Status, superstruct } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { User } from "../models/User.ts";
import { AppContext } from "../helpers/context.ts";

export const login = async (ctx: Context<AppContext>) => {
  const loginSchema = superstruct.object({
    email: superstruct.string(),
    password: superstruct.string(),
  });

  //Validate request body against a schmea
  superstruct.assert(ctx.state.bodyValue, loginSchema);

  const { email, password } = ctx.state.bodyValue;

  //Fetch the user from the database
  const result = db.queryEntries<User>(
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
  if (await compare(password, user.password)) {
    const userAccesstoken = await ctx.state.jwt.makeAccesstoken(user);
    const userRefreshtoken = await ctx.state.jwt.makeRefreshtoken(user);

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
      access_token: userAccesstoken.token,
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
};
