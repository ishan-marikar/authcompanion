import { Router } from "../deps.ts";

import { login } from "../client/services/login.ts";
import { registration } from "../client/services/registration.ts";
import { profile } from "../client/services/profile.ts";
import { accountRecovery } from "../client/services/accountRecovery.ts";
import { home } from "../client/services/home.ts";

//Client Path
const pathPrefix = "/client/v1/";

const router = new Router({ prefix: pathPrefix });

//Client Routes
router
  .get("login", login)
  .get("register", registration)
  .get("profile", profile)
  .get("recovery", accountRecovery)
  .get("home", home);

export default router;
