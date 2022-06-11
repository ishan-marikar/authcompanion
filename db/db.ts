import { DB, SqliteError } from "../deps.ts";
import config from "../config.ts";
import log from "../helpers/log.ts";

// Migrate DB to latest version
const setupDB = (db: DB) => {
  try {
    const sql = Deno.readTextFileSync("./db/1__users.sql");
    sql.split(";").forEach((stmt) => {
      if (stmt !== "") {
        db.query(`${stmt};`);
      }
    });
  } catch (err) {
    log.error("Unable to migrate DB to latest version");
    log.error(err);
    throw err;
  }
};

export const connectDB = (): DB => {
  // Check version of the DB
  const db = new DB(config.DB_URI);
  try {
    const version = db.queryEntries("SELECT version from authc_version");
    if (version[0].version !== 1) {
      throw new Error("DB is unexpected version");
    }
  } catch (err) {
    if (err instanceof SqliteError) {
      if (err.message.includes("no such table")) {
        setupDB(db);
      } else {
        log.error("Error setting up DB");
        log.error(err);
        throw err;
      }
    }
  }
  return db;
};
