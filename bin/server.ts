// @ts-nocheck
import app from "../app.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";

const PORT = Number(config.AUTHPORT ?? 3002);
const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  log.debug(`HTTPS is ${secure ? "on" : "off"}`);
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  log.info(`
  ################################################
  🚀  API Server on: http://localhost:${port}/api/v1/auth/
  🖥️   UI Client on: http://localhost:${port}/client/v1/login
  ################################################
  `);
  log.info("Use CTRL-C to shutdown AuthCompanion");
});

const serverlisten = app.listen({ port: PORT, signal });

const sigIntHandler = () => {
  controller.abort();
  console.log();
  log.info(`AuthCompanion has exited, Good bye 👋`);
  Deno.exit();
};

Deno.addSignalListener("SIGINT", sigIntHandler);

Deno.addSignalListener("SIGTERM", sigIntHandler);

await serverlisten;
