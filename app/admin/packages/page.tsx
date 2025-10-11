import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminPackagesTable } from "@/components/admin/packages-table"

export default async function AdminPackagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "administrator") {
    redirect("/dashboard")
  }

  const { data: packages } = await supabase
    .from("subscription_packages")
    .select("*")
    .order("price", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#551c22]">Subscription Packages</h1>
          <p className="text-sm text-gray-600">Manage subscription plans and features</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AdminPackagesTable packages={packages || []} />
      </div>
    </div>
  )
}
