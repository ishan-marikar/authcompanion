import { Command } from "../deps.ts";
import { setup } from "./setup.ts";
import { startServer } from "./server.ts";
import { generateKey } from "./keys.ts";
import config from "../config.ts";

await new Command()
  .name("authcompanion")
  .version("1.0.0-beta.1")
  .description(
    "An effortless, token-based user management server - well suited for modern web projects.",
  )
  .action(async (): Promise<void> => await startServer())
  .command("setup")
  .description("Setup the authcompanion service")
  .action(async (): Promise<void> => await setup())
  .command("generate-key")
  .description("Generate a new keyfile")
  .action(async (): Promise<void> => {
    let path = `${Deno.cwd()}/keyfile`;
    if (config.KEYPATH != undefined) {
      path = config.KEYPATH;
    }
    return await generateKey(path);
  })
  .parse(Deno.args);
