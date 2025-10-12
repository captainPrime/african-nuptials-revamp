import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function AboutPage() {
  const supabase = await createClient()

  // Fetch testimonials
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*, user_id(full_name, profile_photo)")
    .eq("is_approved", true)
    .order("display_order", { ascending: true })
    .limit(6)

  // Fetch stats
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: menCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("gender", "male")

  const { count: womenCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("gender", "female")

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
              <path d="M50 20C50 20 55 40 50 50C45 60 35 65 35 65" stroke="#551c22" strokeWidth="2" />
            </svg>
          </div>

          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-5xl font-bold text-[#551c22] lg:text-6xl">About us</h1>
            <p className="mt-4 text-lg text-[#551c22]/70">Most Trusted and premium Matrimony Service in the World</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                <span className="text-6xl">🏆</span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#551c22]">Genuine profiles</h3>
              <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
            </Card>

            <Card className="border-none bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                <span className="text-6xl">🏅</span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#551c22]">Most trusted</h3>
              <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
            </Card>

            <Card className="border-none bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                <span className="text-6xl">💍</span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#551c22]">200+ weddings</h3>
              <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
            </Card>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <img
                src="/african-wedding-couple-hands-with-rings.jpg"
                alt="Wedding couple"
                className="h-auto w-full rounded-3xl object-cover shadow-xl"
              />
              {/* Decorative elements */}
              <div className="absolute -bottom-8 -right-8 h-32 w-32 opacity-20">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#551c22" />
                </svg>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-medium text-[#551c22]">— Our love story</p>
              <h2 className="font-serif text-4xl font-bold text-[#551c22] lg:text-5xl">Welcome to Africa Nuptials</h2>
              <p className="leading-relaxed text-muted-foreground">
                We are a tapestry of diverse cultures woven together in the fabric of love, creating a vibrant mosaic of
                connections that transcend geographical boundaries. Our platform is not just a place to find a life
                partner; it's a vibrant tapestry where individuals from diverse cultures intertwine, creating a
                kaleidoscope of unique love stories.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Join us on this exhilarating journey where every click, every connection, and every shared moment is a
                step closer to your happily ever after.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#551c22]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M2 3C2 2.44772 2.44772 2 3 2H5.15287C5.64171 2 6.0589 2.35341 6.13927 2.8356L6.87858 7.27147M6.87858 7.27147L7.89425 13.7144C7.97462 14.1966 8.39181 14.55 8.88065 14.55H16.1221C16.6109 14.55 17.0281 14.1966 17.1085 13.7144L18.1241 7.27147H6.87858Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="17" r="1" fill="currentColor" />
                      <circle cx="15" cy="17" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#551c22]">Toll free worldwide</p>
                    <p className="text-sm text-muted-foreground">+(8) 123-456 7890</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#551c22]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M3 4L9 9L15 4M3 4H17M3 4V16H17V4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#551c22]">We support</p>
                    <p className="text-sm text-muted-foreground">info@africannuptials.com</p>
                  </div>
                </div>
              </div>

              <Button asChild className="bg-[#551c22] hover:bg-[#551c22]/90">
                <Link href="/search">Start your Search</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#551c22]"
                  >
                    <path
                      d="M16 4C16 4 12 8 12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12C20 8 16 4 16 4Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-[#551c22]">2K</p>
                <p className="text-sm text-muted-foreground">EXPERIENCED</p>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#551c22]"
                  >
                    <circle cx="16" cy="10" r="4" fill="currentColor" />
                    <path
                      d="M8 24C8 20.6863 10.6863 18 14 18H18C21.3137 18 24 20.6863 24 24V26H8V24Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-[#551c22]">{usersCount || 5000}+</p>
                <p className="text-sm text-muted-foreground">REGISTERED USERS</p>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#551c22]"
                  >
                    <circle cx="16" cy="10" r="4" fill="currentColor" />
                    <path
                      d="M8 24C8 20.6863 10.6863 18 14 18H18C21.3137 18 24 20.6863 24 24V26H8V24Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-[#551c22]">{menCount || 1600}+</p>
                <p className="text-sm text-muted-foreground">MEN</p>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#551c22]"
                  >
                    <circle cx="16" cy="10" r="4" fill="currentColor" />
                    <path
                      d="M8 24C8 20.6863 10.6863 18 14 18H18C21.3137 18 24 20.6863 24 24V26H8V24Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-[#551c22]">{womenCount || 2000}+</p>
                <p className="text-sm text-muted-foreground">WOMEN</p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <p className="mb-2 text-sm font-medium text-[#551c22]">
              — Matrimonial Platform with Countless Stories of Successful Unions
            </p>
            <h2 className="font-serif text-4xl font-bold text-[#551c22] lg:text-5xl">
              Love Found: Millions Success Stories Unveiled.
            </h2>
          </div>

          <div className="relative">
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials && testimonials.length > 0 ? (
                testimonials.slice(0, 3).map((testimonial: any) => (
                  <Card
                    key={testimonial.id}
                    className="border-none p-6 shadow-lg"
                    style={{ backgroundColor: ["#6b4c4c", "#c9a5a5", "#6b4c4c"][Math.floor(Math.random() * 3)] }}
                  >
                    <p className="mb-4 text-sm leading-relaxed text-white">{testimonial.story}</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.user_id?.profile_photo || "/placeholder.svg?height=40&width=40"}
                        alt={testimonial.partner_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">{testimonial.partner_name}</p>
                        <p className="text-xs text-white/80">{testimonial.location}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="border-none bg-[#6b4c4c] p-6 shadow-lg">
                    <p className="mb-4 text-sm leading-relaxed text-white">
                      "We both had registered with AN after on and got Elite Service."
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Joseph and Caitlyn"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">Joseph and Caitlyn</p>
                        <p className="text-xs text-white/80">Lagos, Nigeria</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none bg-[#c9a5a5] p-6 shadow-lg">
                    <p className="mb-4 text-sm leading-relaxed text-white">
                      "Efficiently build orthogonal convergence without multimedia based scenarios."
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="John and Olivia"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">John and Olivia</p>
                        <p className="text-xs text-white/80">Accra, Ghana</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none bg-[#6b4c4c] p-6 shadow-lg">
                    <p className="mb-4 text-sm leading-relaxed text-white">
                      "Efficiently build orthogonal convergence without multimedia based scenarios."
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Samuel and Ayo"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">Samuel and Ayo</p>
                        <p className="text-xs text-white/80">Nairobi, Kenya</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
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
                Check out membership page, choose the membership package that is ideal for you. We recommend packages of
                1 year validity effort to get the maximum out of website.
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
                You can reach our customer care team through the contact page or email us at info@africannuptials.com
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="rounded-lg border bg-white px-6">
              <AccordionTrigger className="text-left font-medium text-[#551c22] hover:no-underline">
                <span className="mr-4 text-[#c9a5a5]">04</span>
                Can I change DOB & Gender.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Date of birth and gender are permanent fields and cannot be changed once set during registration.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <Footer />
    </div>
  )
}
