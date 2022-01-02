// @ts-nocheck
import { Status } from "../deps.ts";
import { makeRecoverytoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { ConnectConfigWithAuthentication, SmtpClient } from "../deps.ts";
import { superstruct } from "../deps.ts";
import config from "../config.ts";

const connectConfig: ConnectConfigWithAuthentication = {
  hostname: config.SMTPHOSTNAME ? config.SMTPHOSTNAME : "",
  port: Number(config.SMTPPORT),
  username: config.SMTPUSER ? config.SMTPUSER : "",
  password: config.SMTPPASSWORD ? config.SMTPPASSWORD : "",
};

export const accountRecovery = async (ctx: any) => {
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

    const recoverySchema = superstruct.object({
      email: superstruct.string(),
    });

    //Validate request body against a schmea
    superstruct.assert(bodyValue, recoverySchema);

    const { email } = bodyValue;

    //Fetch the user from the database
    const result = db.queryEntries(
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

    const recoveryToken = await makeRecoverytoken(user);

    await client.send({
      from: config.FROMADDRESS ?? "no-reply@example.com",
      to: <string> user.email,
      subject: "Account Recovery",
      content: `Hello 👋 </br>
          You are receiving this email because you have attempted to recover your account</br>
          Please use the following link to login again: <a href="${config.RECOVERYURL}?token=${recoveryToken.token}">Click Here</a>`,
    });

    await client.close();

    ctx.response.status = Status.OK;
    ctx.response.headers.set(
      "x-authc-client-origin",
      `${config.CLIENTORIGIN}`,
    );
    ctx.response.body = {
      data: {
        type: "Recover User",
        detail:
          "An email containing a recovery link has been sent to the email address provided",
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
