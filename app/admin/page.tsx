import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, MessageSquare, Package, UserCheck, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "administrator") {
        redirect("/dashboard")
    }

    // Fetch statistics
    const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalInterests },
        { count: totalMessages },
        { count: totalLikes },
        { data: packages },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("interest_requests").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("likes").select("*", { count: "exact", head: true }),
        supabase.from("subscription_packages").select("*"),
    ])

    const stats = [
        {
            title: "Total Users",
            value: totalUsers || 0,
            icon: Users,
            href: "/admin/users",
            color: "text-blue-600",
        },
        {
            title: "Active Users",
            value: activeUsers || 0,
            icon: UserCheck,
            href: "/admin/users?status=active",
            color: "text-green-600",
        },
        {
            title: "Interest Requests",
            value: totalInterests || 0,
            icon: Heart,
            href: "/admin/interests",
            color: "text-pink-600",
        },
        {
            title: "Messages",
            value: totalMessages || 0,
            icon: MessageSquare,
            href: "/admin/messages",
            color: "text-purple-600",
        },
        {
            title: "Likes",
            value: totalLikes || 0,
            icon: TrendingUp,
            href: "/admin/likes",
            color: "text-orange-600",
        },
        {
            title: "Packages",
            value: packages?.length || 0,
            icon: Package,
            href: "/admin/packages",
            color: "text-indigo-600",
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-[#551c22]">Admin Dashboard</h1>
                    <p className="text-sm text-gray-600">Manage your African Nuptials platform</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 ">
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common administrative tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/admin/users/new">
                                <Button className="w-full justify-start bg-transparent" variant="outline">
                                    <Users className="mr-2 h-4 w-4" />
                                    Add New User
                                </Button>
                            </Link>
                            <Link href="/admin/packages/new">
                                <Button className="w-full justify-start bg-transparent" variant="outline">
                                    <Package className="mr-2 h-4 w-4" />
                                    Create Package
                                </Button>
                            </Link>
                            <Link href="/admin/reports">
                                <Button className="w-full justify-start bg-transparent" variant="outline">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    View Reports
                                </Button>
                            </Link>
                        </CardContent>
                    </Card> */}

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest platform activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Activity feed coming soon...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
