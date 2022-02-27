import { DB } from "../deps.ts";
import { copy } from "https://deno.land/std@0.126.0/fs/mod.ts";
import log from "../helpers/log.ts";

try {
  await copy("./db/users.db", "./db/prod/users.db"); // returns a promise
  log.info("created a new users.db database");
} catch (error) {
  log.info("existing users.db database is available");
}
// Open sqlite users database
const db = new DB("./db/prod/users.db", { mode: "write" });

export { db };
