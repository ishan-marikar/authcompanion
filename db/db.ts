import { DB } from "../deps.ts";

// Open sqlite users database
const db = new DB("./db/users.db", { mode: "write" });

export { db };
