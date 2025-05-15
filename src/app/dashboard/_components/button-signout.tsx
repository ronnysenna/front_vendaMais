"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function ButtonSignOut() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
        },
        onError: (err) => {
          console.error("Erro ao deslogar:", err);
        }
      }
    });
  }

  return (
    <Button className=" bg-emerald-700 hover:bg-emerald-900 "onClick={signOut}>
      Sair da conta
    </Button>
  );
}
