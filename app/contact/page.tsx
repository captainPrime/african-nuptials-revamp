"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ContactPage() {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Message sent!",
                    description: "We'll get back to you soon.",
                })
                setFormData({ name: "", email: "", phone: "", message: "" })
            } else {
                throw new Error("Failed to send message")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-[#f5e6e8] py-20">
                    {/* Decorative leaf */}
                    <div className="absolute left-8 top-12 h-32 w-32 opacity-30">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 50C20 50 30 30 50 20C70 10 80 30 80 30" stroke="#551c22" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-serif text-5xl font-bold text-[#551c22] lg:text-6xl">Contact us</h1>
                        <p className="mt-4 text-lg text-[#551c22]/70">
                            Lorem Ipsum is simply dummy text of the printing and typesetting.
                        </p>
                    </div>
                </section>

                {/* Info Cards Section */}
                <section className="container mx-auto px-4 py-16">
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="border-none bg-white p-8 shadow-lg">
                            <h3 className="mb-4 font-bold text-[#551c22]">OUR OFFICE</h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Most Trusted and premium Matrimony Service in the World.
                            </p>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-[#551c22]">📍</span>
                                    <span>+ng (88)00 18 - Bahia</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[#551c22]">📧</span>
                                    <span>help@company.com</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-[#551c22]">📍</span>
                                    <span>office Global Lake Road, Suite 56 Farmington Hills, USA</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-none bg-white p-8 text-center shadow-lg">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                                <span className="text-5xl">🏅</span>
                            </div>
                            <h3 className="mb-2 font-bold text-[#551c22]">Most trusted</h3>
                            <p className="mb-4 text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
                            <Button variant="outline" className="border-[#551c22] text-[#551c22] bg-transparent">
                                Get Support
                            </Button>
                        </Card>

                        <Card className="border-none bg-white p-8 text-center shadow-lg">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                                <span className="text-5xl">💬</span>
                            </div>
                            <h3 className="mb-2 font-bold text-[#551c22]">Whatsapp support</h3>
                            <p className="mb-4 text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
                            <Button variant="outline" className="border-[#551c22] text-[#551c22] bg-transparent">
                                Talk to sales
                            </Button>
                        </Card>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="container mx-auto px-4 py-16">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Left Side - Illustration */}
                        <div className="relative rounded-3xl bg-[#f5e6e8] p-12">
                            <div className="mb-8">
                                <h2 className="mb-2 text-sm font-medium text-[#551c22]">Now</h2>
                                <h3 className="mb-2 font-serif text-4xl font-bold text-[#551c22]">Contact to us</h3>
                                <p className="text-lg text-[#551c22]/70">Easy and fast.</p>
                            </div>

                            <div className="relative">
                                <div className="mx-auto h-64 w-64 overflow-hidden rounded-full bg-[#f9d689]">
                                    <img
                                        src="/african-couple-illustration.jpg"
                                        alt="Couple illustration"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="mt-8">
                                    <img src="/diverse-people-illustration.jpg" alt="People" className="w-full" />
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div>
                            <div className="mb-8">
                                <h3 className="mb-2 text-sm font-medium text-[#551c22]">Let's Talk</h3>
                                <h2 className="font-serif text-3xl font-bold text-[#551c22]">Send your enquiry now</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#551c22]">Name:</label>
                                    <Input
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#551c22]">Email:</label>
                                    <Input
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#551c22]">Phone:</label>
                                    <Input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#551c22]">Message:</label>
                                    <Textarea
                                        placeholder="Enter message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows={5}
                                        className="border-gray-300"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-[#551c22] hover:bg-[#551c22]/90">
                                    {loading ? "Sending..." : "Talk to sales"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="container mx-auto px-4 py-16">
                    <div className="mb-12">
                        <p className="mb-2 text-sm font-medium text-[#551c22]">— FAQ</p>
                        <h2 className="font-serif text-4xl font-bold text-[#551c22] lg:text-5xl">Frequently Asked Questions</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AccordionItem value="item-1" className="rounded-lg border bg-white px-6">
                            <AccordionTrigger className="text-left font-medium text-[#551c22] hover:no-underline">
                                <span className="mr-4 text-[#c9a5a5]">01</span>
                                How can I upgrade.
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Check out membership page, choose the membership package that is ideal for you.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="rounded-lg border bg-white px-6">
                            <AccordionTrigger className="text-left font-medium text-[#551c22] hover:no-underline">
                                <span className="mr-4 text-[#c9a5a5]">02</span>
                                Can I register multiple with same email ID.
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                No, each email address can only be used for one account registration.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="rounded-lg border bg-white px-6">
                            <AccordionTrigger className="text-left font-medium text-[#551c22] hover:no-underline">
                                <span className="mr-4 text-[#c9a5a5]">03</span>
                                How can I contact customer care.
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                You can reach us through this form or email admin@africannuptials.com
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="rounded-lg border bg-white px-6">
                            <AccordionTrigger className="text-left font-medium text-[#551c22] hover:no-underline">
                                <span className="mr-4 text-[#c9a5a5]">04</span>
                                Can I change DOB & Gender.
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                Date of birth and gender cannot be changed once set during registration.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </section>
            </main>

            <Footer />
        </div>
    )
}
