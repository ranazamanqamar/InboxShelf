import { connection } from "next/server";
import { credentialFlags } from "@/lib/server/integrations";
import { jsonOk } from "@/lib/server/http";

export async function GET() {
  await connection();
  return jsonOk(credentialFlags());
}
