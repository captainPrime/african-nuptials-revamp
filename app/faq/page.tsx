"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq-section"

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header onSignUpClick={() => {}} onLoginClick={() => {}} />

      <main className="flex-1">
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-4 text-sm uppercase tracking-wider">FAQ</p>
            <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <FAQSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
