import { Context, Status } from "../deps.ts";
import log from "../helpers/log.ts";
import { User } from "../models/User.ts";
import { AppContext, RequestContext } from "../helpers/context.ts";

export const logout = (ctx: Context<RequestContext, AppContext>) => {
  //Fetch the user from the database
  const result = ctx.app.state.db.queryEntries(
    `SELECT uuid, name, email, active, created_at, updated_at FROM users WHERE uuid = $1;`,
    [ctx.state.JWTclaims.id],
  );

  //Check if the user exists in the database
  if (!result.length) {
    log.warning("User was not found in database");
    ctx.throw(
      Status.BadRequest,
      "Unable to process request, please try again",
    );
  }

  //Logout user by removing his refresh token in database
  const userObj = ctx.app.state.db.queryEntries<User>(
    `UPDATE users SET jwt_id = '', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $1 RETURNING uuid, name, email;`,
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
};
