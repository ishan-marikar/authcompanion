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
  🚀  Server listening on: ${url} 
  ################################################
  `);
  log.info("Use CTRL-C to shutdown AuthCompanion");
});

const serverlisten = app.listen({ port: PORT, signal });

const sigIntHandler = () => {
  controller.abort();
};

Deno.addSignalListener("SIGINT", sigIntHandler);
Deno.addSignalListener("SIGTERM", sigIntHandler);

await serverlisten;
console.log();

log.info(`AuthCompanion has exited, Good bye 👋`);

Deno.exit();
