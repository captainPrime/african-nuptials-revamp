"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
    {
        question: "How can I upgrade?",
        answer:
            "Check out membership page, choose the membership package that is ideal for you. We recommend packages of 1 year validity effort to get the maximum out of website.",
    },
    {
        question: "Can I register multiple with same email ID?",
        answer:
            "No, each email address can only be associated with one account. This helps us maintain the integrity and security of our platform.",
    },
    {
        question: "How can I contact customer care?",
        answer:
            "You can reach our customer care team through the Contact Us page, via email at admin@africannuptials.com, or call us at +(8) 123-56 7890.",
    },
    {
        question: "Can I change DOB & Gender?",
        answer:
            "Date of birth and gender are critical profile information and cannot be changed once set. Please ensure you enter the correct information during registration.",
    },
    {
        question: "How does the matching algorithm work?",
        answer:
            "Our True Match Algorithm uses AI to analyze your profile preferences, interests, location, and behavior to suggest highly compatible matches based on multiple compatibility factors.",
    },
    {
        question: "Is my information secure?",
        answer:
            "Yes, we take privacy and security very seriously. All your personal information is encrypted and protected. You can also control your privacy settings to manage who can view your profile.",
    },
    {
        question: "How do I report inappropriate behavior?",
        answer:
            "If you encounter any inappropriate behavior, you can block the user and report them through their profile page. Our team will review all reports promptly.",
    },
    {
        question: "Can I cancel my subscription?",
        answer:
            "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
    },
]

export default function FAQPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header onSignUpClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1">
                <section className="bg-primary py-20 text-primary-foreground">
                    <div className="container mx-auto px-4 text-center">
                        <p className="mb-4 text-sm uppercase tracking-wider">FAQ</p>
                        <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
                    </div>
                </section>

                <section className="bg-background py-20">
                    <div className="container mx-auto max-w-3xl px-4">
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border bg-card px-6">
                                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                                        <span className="mr-4 text-muted-foreground">0{index + 1}</span>
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-12 text-muted-foreground">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
