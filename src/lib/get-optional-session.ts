import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getOptionalSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session; // pode ser null ou um objeto com user
}
