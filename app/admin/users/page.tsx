import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminUsersTable } from "@/components/admin/users-table"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "administrator") {
    redirect("/dashboard")
  }

  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#551c22]">User Management</h1>
          <p className="text-sm text-gray-600">Manage all users on the platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AdminUsersTable users={users || []} />
      </div>
    </div>
  )
}
