// @ts-nocheck
import { Status } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

export const logout = (ctx: any) => {
  try {

    //Fetch the user from the database
    const result = db.queryEntries(
      `SELECT uuid, name, email, active, created_at, updated_at FROM users WHERE uuid = $1;`,
      [ctx.state.JWTclaims.id],
    );

    //Check if the user exists in the database
    if (!result.length) {
      log.warning("User was not found in database");
      ctx.throw(Status.BadRequest, "Unable to process request, please try again");
    }

    //Logout user by removing his refresh token in database
    const userObj = db.queryEntries(
      `UPDATE users SET refresh_token = '', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $1 RETURNING uuid, name, email;`,
      [ctx.state.JWTclaims.id],
    );

    const user = userObj[0];

    ctx.response.status = Status.OK;
    ctx.response.body = {
      data: {
        id: user.uuid,
        type: "Logout User",
        attributes: {
          name: user.name,
          email: user.email,
        },
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
