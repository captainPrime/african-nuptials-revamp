"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Package {
    id: string
    name: string
    price: number
    duration_months: number
    features: Record<string, any>
    is_active: boolean
    display_order: number
}

export default function MembershipPage() {
    const [packages, setPackages] = useState<Package[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("subscription_packages")
            .select("*")
            .eq("is_active", true)
            .order("display_order")

        if (!error && data) {
            setPackages(data)
        }
        setLoading(false)
    }

    const handleGetStarted = (pkg: Package) => {
        router.push("/dashboard")
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header onSignUpClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-primary py-20 text-primary-foreground">
                    <div className="container mx-auto px-4 text-center">
                        <p className="mb-4 text-sm uppercase tracking-wider">Membership</p>
                        <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">Get Started Pick your Plan Now</h1>
                        <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
                            Choose the perfect plan to find your life partner
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="bg-background py-20">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="text-center">Loading packages...</div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {packages.map((pkg, index) => (
                                    <div
                                        key={pkg.id}
                                        className={`relative rounded-3xl border-2 bg-card p-8 shadow-lg transition-transform hover:scale-105 ${index === 1 ? "border-primary" : "border-border"
                                            }`}
                                    >
                                        {index === 1 && (
                                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                                                Most popular
                                            </Badge>
                                        )}

                                        <div className="mb-6 text-center">
                                            <h3 className="mb-2 font-serif text-2xl font-bold">{pkg.name}</h3>
                                            <div className="mb-2">
                                                <span className="font-serif text-5xl font-bold">${pkg.price}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Monthly</p>
                                        </div>

                                        <ul className="mb-8 space-y-3">
                                            {Object.entries(pkg.features).map(([key, value]) => (
                                                <li key={key} className="flex items-start gap-2">
                                                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                                    <span className="text-sm">
                                                        {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                        {typeof value === "number" && value > 0 ? `: ${value}` : ""}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={() => handleGetStarted(pkg)}
                                            className={`w-full ${index === 1
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                                                }`}
                                        >
                                            Get Started
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
