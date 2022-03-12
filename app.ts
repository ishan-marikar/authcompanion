import { Application } from "./deps.ts";
import config from "./config.ts";

// app middleware
import { notFound } from "./middleware/notFound.ts";
import { logger, responseTime } from "./middleware/logger.ts";
import { cors } from "./middleware/cors.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

// app routes
import serverIndex from "./routes/index.server.ts";
import clientIndex from "./routes/index.client.ts";

// workaround for https://github.com/dyedgreen/deno-sqlite/issues/174
Deno.flockSync = () => {};
Deno.funlockSync = () => {};

const app = new Application();

app.use(errorHandler);
app.use(logger);
app.use(responseTime);
app.use(cors);

// API Server Routes
app.use(serverIndex.routes());
app.use(serverIndex.allowedMethods());

// Client Routes
if (config.CLIENTMODE?.toLowerCase() !== "false") {
  app.use(clientIndex.routes());
  app.use(clientIndex.allowedMethods());
}

// General 404 Error Page
app.use(notFound);

export default app;
