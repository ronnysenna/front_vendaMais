import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

console.log("Better Auth handler ativado");

export const { GET, POST } = toNextJsHandler(auth);
