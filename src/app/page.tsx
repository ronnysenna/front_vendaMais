import { getOptionalSession } from "@/lib/get-optional-session";
import { HomeContent } from "./_components/home-content";
import dynamic from 'next/dynamic';

// Importar o componente de verificação de versão dinamicamente para evitar problemas com SSR
const VersionChecker = dynamic(
  () => import('@/components/version-checker'),
  { ssr: false }
);

export default async function Home() {
  const session = await getOptionalSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <HomeContent isLoggedIn={isLoggedIn} />
      <VersionChecker />
    </>
  );
}
