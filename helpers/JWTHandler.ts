import {
  base64,
  create,
  getNumericDate,
  Header,
  Payload,
  verify,
} from "../deps.ts";
import { db } from "../db/db.ts";
import log from "./log.ts";
import config from "../config.ts";

const { KEYPATH } = config;

interface JWTUser {
  uuid: string;
  name: string;
  email: string;
}

export interface ACPayload extends Payload {
  id: string;
  name: string;
  email: string;
}

export class JWTHandler {
  private static instance: JWTHandler;

  constructor(private cryptoKey: CryptoKey) {}

  static async getInstance(): Promise<JWTHandler> {
    if (!JWTHandler.instance) {
      if (KEYPATH) {
        const cryptoKey = await JWTHandler.importKey(KEYPATH);
        JWTHandler.instance = new JWTHandler(cryptoKey);
      } else {
        throw new Error("No crypto key path defined");
      }
    }
    return JWTHandler.instance;
  }

  static async importKey(path: string): Promise<CryptoKey> {
    try {
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
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        throw new Error("Key file not found");
      }
      throw new Error("Failed to import key");
    }
  }

  async makeAccesstoken(user: JWTUser) {
    const date = new Date();
    date.setHours(date.getHours() + 4);

    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: ACPayload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      exp: getNumericDate(date),
    };

    const resultingToken = await create(jwtheader, jwtpayload, this.cryptoKey);

    const responseObj = {
      token: resultingToken,
      expiration: jwtpayload.exp,
    };

    return responseObj;
  }

  async makeRefreshtoken(user: JWTUser) {
    const date = new Date();
    date.setDate(date.getDate() + 30 * 2);
    // const user = result.rows[0];

    const newjtiClaim = crypto.randomUUID();

    db.query(
      `UPDATE users SET jwt_id = $1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE uuid = $2 RETURNING *;`,
      [newjtiClaim, user.uuid],
    );

    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: ACPayload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      jti: newjtiClaim,
      exp: getNumericDate(date),
    };

    return await create(jwtheader, jwtpayload, this.cryptoKey);
  }

  async validateJWT(refreshToken: string): Promise<ACPayload> {
    try {
      //verify the jwt (includes signature validation) otherwise throw error
      const payload = await verify(refreshToken, this.cryptoKey);
      if (
        typeof payload.id === "string" &&
        typeof payload.name === "string" &&
        typeof payload.email === "string"
      ) {
        return {
          ...payload,
          id: payload.id,
          name: payload.name,
          email: payload.email,
        };
      }
      throw new Error("invalid jwt - missing payload");
    } catch (err) {
      log.warning(err.message);
      throw new Error("Token is Invalid");
    }
  }

  async makeRecoverytoken(
    user: JWTUser,
  ): Promise<{ token: string; expiration: number }> {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 35);

    const jwtheader: Header = { alg: "HS512", typ: "JWT" };
    const jwtpayload: Payload = {
      id: user.uuid,
      name: user.name,
      email: user.email,
      exp: getNumericDate(date),
    };

    const resultingToken = await create(jwtheader, jwtpayload, this.cryptoKey);

    return {
      token: resultingToken,
      expiration: jwtpayload.exp || 0,
    };
  }
}
