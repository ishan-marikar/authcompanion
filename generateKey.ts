import { base64 } from "./deps.ts";

export async function generateKey(path: string): Promise<void> {
  const key = await crypto.subtle.generateKey(
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    true,
    ["sign", "verify"],
  );

  const exported = await crypto.subtle.exportKey("raw", key);

  const exportbase64 = base64.encode(exported);

  await Deno.writeTextFile(path, exportbase64);
}
