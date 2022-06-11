import { Confirm, Input, Select } from "../deps.ts";
import { generateKey } from "./keys.ts";
import { envTemplate } from "./env.ts";

export async function setup(): Promise<void> {
  const cwd = Deno.cwd();

  const defaultDev = {
    port: 3002,
    log_level: "DEBUG",
    log_handler: "console",
    origin: "http://localhost:3001",
    secure: false,
    recovery_redirect_url: "http://localhost:3001/recover/",
    db_uri: `./authcompanion_users.db`,
    key_path: `./keyfile`,
    client_mode: true,
    client_origin: "/client/v1/home",
    smtp: {
      hostname: "mailhog",
      port: 1025,
      username: "",
      password: "",
      from_address: "no_reply@example.com",
    },
  };
  const defaultProd = {
    ...defaultDev,
    secure: true,
    log_level: "INFO",
  };

  const start = await Confirm.prompt({
    message: `Hello 👋 and welcome to AuthCompanion first time setup process. 
    Ready to proceed?`,
    default: true,
  });

  if (!start) {
    Deno.exit();
  }

  const keyfile = await Input.prompt({
    message:
      `First, we'll generate a secret key used by AuthCompanion to sign and verify tokens. Keep this safe!
     Input a location for the key file or continue with the default location:`,
    default: `./keyfile`,
  });

  defaultDev.key_path = keyfile;

  try {
    const f = await Deno.stat(keyfile);
    if (f.isFile) {
      const confirmKeyfile = await Confirm.prompt({
        message:
          `Keyfile already exists at ${keyfile} do you want to overwrite?`,
        default: false,
      });
      if (confirmKeyfile) {
        generateKey(keyfile);
      }
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      generateKey(keyfile);
    }
  }

  const createEnv = await Confirm.prompt({
    message:
      `Next, let's move to create a new configuration file at ${cwd}/.env.
    Proceed?`,
    default: true,
  });

  if (createEnv) {
    const mode = await Select.prompt({
      message:
        "Which environment would you like to generate a configuration for:",
      options: ["Production", "Development"],
    });

    switch (mode) {
      case "Production":
        await Deno.writeTextFile(`${cwd}/.env`, envTemplate(defaultProd));
        break;
      case "Development":
        await Deno.writeTextFile(`${cwd}/.env`, envTemplate(defaultDev));
        break;
    }

    console.log(
      `AuthCompanion server setup is ready!`,
    );
    console.log(
      `Run the command ./authcompanion to start the server. For documenation please reference docs.authcompanion.com`,
    );
  }
}
