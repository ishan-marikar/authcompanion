import { cyan, green, red, Request, Response, yellow } from "../deps.ts";
import { format } from "../deps.ts";
const X_RESPONSE_TIME = "X-Response-Time";
const USER_AGENT = "User-Agent";

/** The standard logging function that processes and logs requests. */
export const logger = async (
  { response, request }: { response: Response; request: Request },
  next: () => Promise<unknown>,
) => {
  await next();
  const responseTime = response.headers.get(X_RESPONSE_TIME);
  const User = request.headers.get(USER_AGENT);
  const status: number = response.status;
  const logString = `[${
    format(new Date(Date.now()), "MM-dd-yyyy hh:mm:ss.SSS")
  }  authC::logger] ${request.ip} "${request.method} ${request.url.pathname}" ${
    String(status)
  } ${User} ${responseTime}`;
  status >= 500
    ? console.log(`${red(logString)}`) // red
    : status >= 400
    ? console.log(`${yellow(logString)}`) // yellow
    : status >= 300
    ? console.log(`${cyan(logString)}`) // cyan
    : status >= 200
    ? console.log(`${green(logString)}`) // green
    : console.log(`${red(logString)}`);
};

/** Response time calculator that also adds response time header. */
export const responseTime = async (
  { response }: { response: Response },
  next: () => Promise<unknown>,
) => {
  const start = Date.now();
  await next();
  const ms: number = Date.now() - start;
  response.headers.set(X_RESPONSE_TIME, `${ms}ms`);
};
