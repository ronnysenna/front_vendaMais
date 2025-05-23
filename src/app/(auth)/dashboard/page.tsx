import { getProtectedSession } from "@/lib/get-protected-session"

export default async function Dashboard() {
  const session = await getProtectedSession()

  return (
    <div className="w-full flex items-center justify-center mt-12">
      <h1 className="text-[#fba931] text-4xl font-bold">Página Dashboard</h1>
    </div>
  )
}
