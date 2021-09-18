import {
  base64,
  create,
  decode,
  getNumericDate,
  Header,
  Payload,
  v4,
  verify,
} from "../deps.ts";

import { db } from "../db/db.ts";
import log from "./log.ts";
import config from "../config.ts";

const { KEYPATH } = config;

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

export async function makeAccesstoken(result: any) {
  var date = new Date();
  date.setHours(date.getHours() + 4);

  const key = cryptoKey;
  if (key != undefined) {
    const user = result.rows[0];

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

export async function makeRefreshtoken(result: any) {
  const date = new Date();
  date.setDate(date.getDate() + 30 * 2);

  if (cryptoKey != undefined) {
    const user = result.rows[0];

    const newjtiClaim = v4.generate();

    await db.queryObject(
      "UPDATE users SET refresh_token = $1 WHERE refresh_token = $2 RETURNING *;",
      newjtiClaim,
      user.refresh_token,
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

export async function validateRefreshToken(jwt: any) {
  try {
    if (cryptoKey != undefined) {
      //verify the jwt (includes signature validation) otherwise throw error
      const payload = await verify(jwt, cryptoKey);

      decode(jwt);

      return payload;
    }
    throw new Error();
  } catch (err) {
    log.warning(err.message);
    throw new Error("Refresh Token is Invalid");
  }
}

export async function validateJWT(jwt: any) {
  try {
    if (cryptoKey != undefined) {
      //verify the jwt (includes signature validation) otherwise throw error
      const payload = await verify(jwt, cryptoKey);

      //decode the jwt (without signature verfication) otherwise throw error
      await decode(jwt);

      return payload;
    }
    throw new Error();
  } catch (err) {
    log.warning(err.message);
    throw new Error("Access Token is Invalid");
  }
}

export async function makeRecoverytoken(result: any) {
  var date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  if (cryptoKey != undefined) {
    const user = result.rows[0];

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
