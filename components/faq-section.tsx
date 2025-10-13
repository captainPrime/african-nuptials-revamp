"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How can I upgrade?",
    answer:
      "Check out membership page, choose the membership package that is ideal for you. We recommend packages of 1 year validity to get the maximum out of the website.",
  },
  {
    question: "Can I register multiple accounts with the same email ID?",
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

interface FAQSectionProps {
  title?: string
  description?: string
  className?: string
}

export function FAQSection({ title = "Frequently Asked Questions", description, className = "" }: FAQSectionProps) {
  return (
    <div className={className}>
      <div className="mb-8">
        <h2 className="mb-2 text-left font-serif text-3xl font-bold text-[#5C2E2E] md:text-4xl">{title}</h2>
        {description && <p className="text-left text-[#6B5B5B]">{description}</p>}
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="rounded-lg border border-[#E5D5C5] bg-white px-6"
          >
            <AccordionTrigger className="text-left font-medium hover:no-underline">
              <span className="mr-4 text-[#C4A57B]">0{index + 1}</span>
              <span className="text-[#5C2E2E]">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pl-12 text-[#6B5B5B]">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
