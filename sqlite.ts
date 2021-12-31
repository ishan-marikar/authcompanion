import { DB } from "https://deno.land/x/sqlite@v3.2.0/mod.ts";

// const DB_URL = new URL("./test.db", import.meta.url);
// console.log(DB_URL);

// Open a database
const db = new DB("./db/users.db");
// db.query(`
// CREATE TABLE users (
//     id INTEGER PRIMARY KEY,
//     uuid TEXT NOT NULL,
//     name TEXT NOT NULL,
//     email TEXT NOT NULL UNIQUE,
//     password TEXT NOT NULL,
//     refresh_token TEXT NOT NULL,
//     active INTEGER NOT NULL,
//     created_at TEXT NOT NULL,
//     updated_at TEXT NOT NULL
// )
// `);

// const names = ["Peter Parker", "Clark Kent", "Bruce Wayne"];

 //Create the new user in the database
 let result = db.queryEntries(
  `INSERT INTO users (uuid, name, email, password, active, refresh_token, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE) RETURNING uuid, name, email, refresh_token, created_at, updated_at;`,
  ["123", "name", "email", "hashpassword", "1", "refreshToken"],
);
if (result) {
  console.log("is empty");
}

//     let user = userObj.rows[0];

let user = result[0]; 
const {uuid} = user

console.log(user.name);
console.log(user);


// // Run a simple query
// for (const name of names) {
//   db.query("INSERT INTO people (name) VALUES (?)", [name]);
// }

// // Print out data in table
// for (const [name] of db.query("SELECT name FROM people")) {
//   console.log(name);
// }

// Close connection
db.close();
