import { getOptionalSession } from "@/lib/get-optional-session";
import { HomeContent } from "./_components/home-content";

export default async function Home() {
  const session = await getOptionalSession();
  const isLoggedIn = !!session?.user;

  return <HomeContent isLoggedIn={isLoggedIn} />;
}
