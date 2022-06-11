import app from "../app.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { sendTelemetry } from "../helpers/telemetry.ts";
import { JWTHandler } from "../helpers/JWTHandler.ts";
import { connectDB } from "../db/db.ts";

const PORT = Number(config.AUTHPORT ?? 3002);
const controller = new AbortController();
const { signal } = controller;

export async function startServer(): Promise<void> {
  app.addEventListener("listen", ({ secure, hostname, port }) => {
    const protocol = secure ? "https://" : "http://";
    log.debug(`HTTPS is ${secure ? "on" : "off"}`);
    const url = `${protocol}${hostname ?? "localhost"}:${port}`;
    console.log(`
  ################################################
  🖥️   UI Client on: http://localhost:${port}/client/v1/login
  🚀  API Server on: http://localhost:${port}/api/v1/auth/
  ################################################
  `);
    console.log("Use CTRL-C to shutdown AuthCompanion");
  });

  sendTelemetry({ event_name: "open_server_event" });
  app.state.jwt = await JWTHandler.getInstance();
  app.state.db = connectDB();
  const serverlisten = app.listen({ port: PORT, signal });

  const sigIntHandler = () => {
    controller.abort();
    log.info(`AuthCompanion has exited, Good bye 👋`);
    Deno.exit();
  };

  Deno.addSignalListener("SIGINT", sigIntHandler);
  Deno.addSignalListener("SIGTERM", sigIntHandler);

  await serverlisten;
}
