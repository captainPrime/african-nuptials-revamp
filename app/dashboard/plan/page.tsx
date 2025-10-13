"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Crown, Loader2, Calendar, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function PlanPage() {
    const [loading, setLoading] = useState(true)
    const [currentSubscription, setCurrentSubscription] = useState<any>(null)
    const [billingHistory, setBillingHistory] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()
                if (!user) {
                    router.push("/")
                    return
                }

                // Load current subscription
                const { data: subscription } = await supabase
                    .from("user_subscriptions")
                    .select(
                        `
            *,
            package:subscription_packages(*)
          `,
                    )
                    .eq("user_id", user.id)
                    .eq("is_active", true)
                    .single()

                setCurrentSubscription(subscription)

                // Load billing history
                const { data: history } = await supabase
                    .from("user_subscriptions")
                    .select(
                        `
            *,
            package:subscription_packages(display_name)
          `,
                    )
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })

                setBillingHistory(history || [])

                // Load available packages
                const { data: pkgs } = await supabase
                    .from("subscription_packages")
                    .select("*")
                    .eq("is_active", true)
                    .order("price")

                setPackages(pkgs || [])
            } catch (error) {
                console.error("Error loading plan data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    async function handleUpgrade() {
        if (!selectedPackage) return

        setLoading(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const pkg = packages.find((p) => p.id === selectedPackage)
            if (!pkg) throw new Error("Package not found")

            // Deactivate current subscription
            if (currentSubscription) {
                await supabase.from("user_subscriptions").update({ is_active: false }).eq("id", currentSubscription.id)
            }

            // Create new subscription
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + pkg.duration_months)

            const { error } = await supabase.from("user_subscriptions").insert({
                user_id: user.id,
                package_id: pkg.id,
                end_date: endDate.toISOString(),
                is_active: true,
                amount_paid: pkg.price,
                payment_status: pkg.price === 0 ? "completed" : "pending",
                payment_method: pkg.price === 0 ? "free" : "pending",
            })

            if (error) throw error

            toast({
                title: "Plan updated",
                description: "Your subscription has been updated successfully",
            })

            setShowUpgradeDialog(false)
            router.refresh()
            window.location.reload()
        } catch (error: any) {
            console.error("Error upgrading plan:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to upgrade plan",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const daysRemaining = currentSubscription
        ? Math.ceil((new Date(currentSubscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0

    return (
        <div className="container mx-auto max-w-6xl space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-bold">My Plan</h1>
                <p className="text-gray-600">Manage your subscription and billing</p>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {currentSubscription?.package?.display_name || "Basic Plan"}
                                {currentSubscription?.package?.name === "premium" && <Crown className="h-5 w-5 text-yellow-500" />}
                            </CardTitle>
                            <CardDescription>Your current subscription plan</CardDescription>
                        </div>
                        <Badge variant={daysRemaining > 7 ? "default" : "destructive"}>
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Renewal Date</p>
                                <p className="font-semibold">
                                    {currentSubscription
                                        ? new Date(currentSubscription.end_date).toLocaleDateString()
                                        : "No active subscription"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-semibold">
                                    {currentSubscription?.package?.price === 0
                                        ? "Free"
                                        : `$${currentSubscription?.package?.price || 0}/${currentSubscription?.package?.duration_months || 1}mo`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => setShowUpgradeDialog(true)} className="w-full md:w-auto">
                        Upgrade Plan
                    </Button>
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
                <h2 className="mb-4 text-2xl font-bold">Available Plans</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className={currentSubscription?.package_id === pkg.id ? "border-2 border-primary" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {pkg.display_name}
                                    {currentSubscription?.package_id === pkg.id && <Badge>Current</Badge>}
                                </CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                                <div className="pt-4">
                                    <span className="text-3xl font-bold">${pkg.price}</span>
                                    <span className="text-gray-600">/{pkg.duration_months}mo</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    {pkg.unlimited_messaging && (
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Unlimited messaging</span>
                                        </div>
                                    )}
                                    {pkg.advanced_search_filters && (
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Advanced search filters</span>
                                        </div>
                                    )}
                                    {pkg.profile_verification_badge && (
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Verification badge</span>
                                        </div>
                                    )}
                                    {pkg.video_chat_feature && (
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Video chat</span>
                                        </div>
                                    )}
                                </div>
                                {currentSubscription?.package_id !== pkg.id && (
                                    <Button
                                        onClick={() => {
                                            setSelectedPackage(pkg.id)
                                            setShowUpgradeDialog(true)
                                        }}
                                        className="w-full"
                                        variant={pkg.name === "premium" ? "default" : "outline"}
                                    >
                                        {pkg.price === 0 ? "Downgrade" : "Upgrade"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>Your past transactions and subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valid Until</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billingHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        No billing history yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                billingHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.package?.display_name}</TableCell>
                                        <TableCell>${item.amount_paid || 0}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.payment_status === "completed"
                                                        ? "default"
                                                        : item.payment_status === "pending"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {item.payment_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(item.end_date).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Upgrade Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upgrade Plan</DialogTitle>
                        <DialogDescription>
                            {selectedPackage
                                ? `Upgrade to ${packages.find((p) => p.id === selectedPackage)?.display_name}`
                                : "Select a plan to upgrade"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Your current subscription will be deactivated and replaced with the new plan.
                        </p>
                        {selectedPackage && packages.find((p) => p.id === selectedPackage)?.price > 0 && (
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <p className="text-sm text-yellow-800">
                                    Payment integration is coming soon. For now, the plan will be activated immediately.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpgrade} disabled={!selectedPackage || loading}>
                            {loading ? "Processing..." : "Confirm Upgrade"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
