import {
  base64,
  create,
  decode,
  getNumericDate,
  Header,
  Payload,
  verify,
} from "../deps.ts";
import { db } from "../db/db.ts";
import log from "./log.ts";
import config from "../config.ts";

const { KEYPATH } = config;

// deno-lint-ignore no-explicit-any
async function importKey(path: any) {
  const readKey = await Deno.readTextFile(path);

  const binaryDer = base64.decode(readKey).buffer;

  const key = await crypto.subtle.importKey(
    "raw",
    binaryDer,
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    true,
    ["sign", "verify"],
  );

  return key;
}

const cryptoKey = await importKey(KEYPATH);

// deno-lint-ignore no-explicit-any
export async function makeAccesstoken(user: any) {
  const date = new Date();
  date.setHours(date.getHours() + 4);

  const key = cryptoKey;
  if (key != undefined) {
    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: Payload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      exp: getNumericDate(date),
    };

    const resultingToken = await create(jwtheader, jwtpayload, key);

    const responseObj = {
      token: resultingToken,
      expiration: jwtpayload.exp,
    };

    return responseObj;
  }
  throw new Error("ACCESSTOKENKEY is invalid");
}

// deno-lint-ignore no-explicit-any
export async function makeRefreshtoken(user: any) {
  const date = new Date();
  date.setDate(date.getDate() + 30 * 2);

  if (cryptoKey != undefined) {
    // const user = result.rows[0];

    const newjtiClaim = crypto.randomUUID();

    db.query(
      `UPDATE users SET jwt_id = $1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $2 RETURNING *;`,
      [newjtiClaim, user.uuid],
    );

    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: Payload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      jti: newjtiClaim,
      exp: getNumericDate(date),
    };

    return await create(jwtheader, jwtpayload, cryptoKey);
  }
  throw new Error("REFRESHTOKENKEY is invalid");
}

// deno-lint-ignore no-explicit-any
export async function validateRefreshToken(refreshToken: any) {
  try {
    if (cryptoKey != undefined) {
      //verify the jwt (includes signature validation) otherwise throw error
      const validatedjwt = await verify(refreshToken, cryptoKey);

      decode(refreshToken);

      return validatedjwt;
    }
    throw new Error();
  } catch (err) {
    log.warning(err.message);
    throw new Error("User Refresh Token is Invalid");
  }
}

// deno-lint-ignore no-explicit-any
export async function validateJWT(jwt: any) {
  try {
    if (cryptoKey != undefined) {
      //verify the jwt (includes signature validation) otherwise throw error
      const jwtpayload = await verify(jwt, cryptoKey);

      //decode the jwt (without signature verfication) otherwise throw error
      decode(jwt);

      return jwtpayload;
    }
    throw new Error();
  } catch (err) {
    log.warning(err.message);
    throw new Error("Token is Invalid");
  }
}

// deno-lint-ignore no-explicit-any
export async function makeRecoverytoken(user: any) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  if (cryptoKey != undefined) {
    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: Payload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      exp: getNumericDate(date),
    };

    const resultingToken = await create(jwtheader, jwtpayload, cryptoKey);

    return {
      token: resultingToken,
      expiration: jwtpayload.exp,
    };
  }
  throw new Error("ACCESSTOKENKEY is invalid");
}
