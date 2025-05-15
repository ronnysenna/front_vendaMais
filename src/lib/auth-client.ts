import { createAuthClient } from "better-auth/react";

 
const signIn = async () => {
    const data = await authClient.signIn.social({
        provider: "google"
    })
}

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : "https://vendamais-front.dgohio.easypanel.host",
});
