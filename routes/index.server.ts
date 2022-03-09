import { Router } from "../deps.ts";

import { login } from "../services/login.ts";
import { refresh } from "../services/refresh.ts";
import { registration } from "../services/registration.ts";
import { userProfile } from "../services/userProfile.ts";
import { accountRecovery } from "../services/accountRecovery.ts";
import { recoverToken } from "../services/recoverytoken.ts";
import { logout } from "../services/logout.ts";
import { authorize } from "../middleware/authorize.ts";

//API Server Path
const pathPrefix = "/api/v1/";

const router = new Router({ prefix: pathPrefix });

//API Server Routes
router
  .post("auth/register", registration)
  .post("auth/login", login)
  .post("auth/refresh", refresh)
  .post("auth/recovery", accountRecovery)
  .post("auth/recovery/token", recoverToken)
  .post("auth/users/me", authorize, userProfile)
  .get("auth/logout", authorize, logout);

export default router;
