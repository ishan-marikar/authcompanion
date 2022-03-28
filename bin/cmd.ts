import { parseFlags } from "../deps.ts";

const result = parseFlags(Deno.args, {
  allowEmpty: true,
  flags: [{
    name: "setup",
    standalone: true,
  }],
});

console.log(result);
