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
    db_uri: `${cwd}/authcompanion_users.db`,
    key_path: `${cwd}/keyfile`,
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
    message:
      `Welcome to AuthCompanion first time setup!  We will help you get started setting up a fresh install.  
If you are new just go with the defaults for now and consult the documentation if you have any questions.
proceed?`,
    default: true,
  });

  if (!start) {
    Deno.exit();
  }

  const keyfile = await Input.prompt({
    message: "Generating secret key at:",
    default: `${cwd}/keyfile`,
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
    message: `Create new config file at ${cwd}/.env ?`,
    default: true,
  });

  if (createEnv) {
    const mode = await Select.prompt({
      message: "Is this for?",
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
      "AuthCompanion setup complete!  The env file has been generated with default values, double check them and then run `./authcompanion` to start the server.",
    );
  }
}
