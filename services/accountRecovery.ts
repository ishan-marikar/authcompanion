import {
  ConnectConfigWithAuthentication,
  Context,
  SmtpClient,
  Status,
  superstruct,
} from "../deps.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { User } from "../models/User.ts";
import { AppContext, RequestContext } from "../helpers/context.ts";

const connectConfig: ConnectConfigWithAuthentication = {
  hostname: config.SMTPHOSTNAME ? config.SMTPHOSTNAME : "",
  port: Number(config.SMTPPORT),
  username: config.SMTPUSER ? config.SMTPUSER : "",
  password: config.SMTPPASSWORD ? config.SMTPPASSWORD : "",
};

export const accountRecovery = async (
  ctx: Context<RequestContext, AppContext>,
) => {
  const recoverySchema = superstruct.object({
    email: superstruct.string(),
  });

  //Validate request body against a schmea
  superstruct.assert(ctx.state.bodyValue, recoverySchema);

  const { email } = ctx.state.bodyValue;

  //Fetch the user from the database
  const result = ctx.app.state.db.queryEntries<User>(
    `SELECT uuid, name, email, password, active, created_at, updated_at FROM users WHERE email = $1;`,
    [email],
  );

  //Check if the user exists in the database, before issuing recovery token
  if (!result.length) {
    log.warning(
      "User does not exist in database for recovery token generation",
    );
    throw new Error("Server Error");
  }

  const user = result[0];

  const client = new SmtpClient();

  await client.connect(connectConfig);

  const recoveryToken = await ctx.app.state.jwt.makeRecoverytoken(user);

  await client.send({
    from: config.FROMADDRESS ?? "no-reply@example.com",
    to: <string> user.email,
    subject: "Account Recovery",
    content: `Hello </br></br>
          You recently requested a password reset for your account.</br>
          Please use the following link to login again. This password reset is only valid for the next 35 minutes: </br>
          <a href="${config.RECOVERYURL}?token=${recoveryToken.token}">Reset your password</a>`,
  });

  await client.close();

  ctx.response.status = Status.OK;
  ctx.response.headers.set("x-authc-client-origin", `${config.CLIENTORIGIN}`);
  ctx.response.body = {
    data: {
      type: "Recover User",
      detail:
        "An email containing a recovery link has been sent to the email address provided",
    },
  };
};
