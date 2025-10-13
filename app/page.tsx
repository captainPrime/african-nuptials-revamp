"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignupModal } from "@/components/auth/signup-modal"
import { LoginModal } from "@/components/auth/login-modal"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"
import { HeroSearch } from "@/components/hero-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Heart, Users, Shield, Check, ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FAQSection } from "@/components/faq-section"

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true)
    window.addEventListener("show-login-modal", handleShowLogin)
    fetchData()
    return () => window.removeEventListener("show-login-modal", handleShowLogin)
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: packagesData } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("price")
      .limit(3)

    if (packagesData) setPackages(packagesData)

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, date_of_birth, city, country, profile_photo, is_verified, last_active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(5)

    if (profilesData) {
      // Calculate age on the client side
      const profilesWithAge = profilesData.map((profile) => ({
        ...profile,
        age: profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null,
      }))
      setFeaturedProfiles(profilesWithAge)
    }

    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (testimonialsData) setTestimonials(testimonialsData)
  }

  const handleForgotPassword = () => {
    setShowLogin(false)
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setShowLogin(true)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Newsletter subscription logic here
  }

  const nextFeaturedProfile = () => {
    setCurrentFeaturedIndex((prev) => (prev + 3 >= featuredProfiles.length ? 0 : prev + 3))
  }

  const prevFeaturedProfile = () => {
    setCurrentFeaturedIndex((prev) => (prev - 3 < 0 ? Math.max(0, featuredProfiles.length - 3) : prev - 3))
  }

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 3 >= testimonials.length ? 0 : prev + 3))
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 3 < 0 ? Math.max(0, testimonials.length - 3) : prev - 3))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1ED]">
      <Header onSignUpClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />

      <main className="flex-1">
        <section id="hero" className="relative overflow-hidden py-20 text-white">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/happy-african-couple.jpg"
              alt="Hero background"
              className="h-full w-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5C2E2E]/90 via-[#7D4E4E]/85 to-[#5C2E2E]/90"></div>
          </div>

          {/* Content */}
          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-4 font-serif text-5xl font-bold leading-tight lg:text-6xl">Find Your Perfect Match</h1>
              <p className="mb-8 text-lg text-white/90">
                Join thousands of African singles finding love and meaningful connections
              </p>
              <HeroSearch />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 z-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 z-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        </section>

        <section id="about" className="relative overflow-hidden bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left Content - Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src="happy-african-couple-embracing.jpg"
                    alt="Happy couple"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-sm text-[#C4A57B]">
                  <span className="h-8 w-px bg-[#C4A57B]"></span>
                  Connecting Hearts, Celebrating Love ❤️
                </div>

                <h2 className="font-serif text-4xl font-bold leading-tight text-[#5C2E2E] lg:text-5xl">
                  Where Love Finds its Forever Home
                </h2>

                <p className="text-lg leading-relaxed text-[#6B5B5B]">
                  African Nuptials is the first exclusively African matrimony website worldwide. Our platform is more
                  than just a matrimony platform; it's a journey that begins with a shared smile and leads to a lifetime
                  of happiness. We understand the significance of finding the perfect life partner, and we are here to
                  make that journey memorable, exciting, and seamless.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#5C2E2E]">
                      <Shield className="h-6 w-6 text-[#5C2E2E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5C2E2E]">100% Verified</p>
                      <p className="text-sm text-[#6B5B5B]">Profile</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#5C2E2E]">
                      <Users className="h-6 w-6 text-[#5C2E2E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5C2E2E]">Connect with Like</p>
                      <p className="text-sm text-[#6B5B5B]">Minded Profiles</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#5C2E2E]">
                      <Heart className="h-6 w-6 text-[#5C2E2E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#5C2E2E]">Attractive packages</p>
                      <p className="text-sm text-[#6B5B5B]">for your profile</p>
                    </div>
                  </div>
                </div>

                <Button className="bg-[#5C2E2E] text-white hover:bg-[#5C2E2E]/90">
                  <Search className="mr-2 h-4 w-4" />
                  Start your Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#F5F1ED] py-20">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="space-y-8">
                <h2 className="font-serif text-4xl font-bold text-[#5C2E2E]">Discover Your Perfect Match</h2>
                <p className="text-lg text-[#6B5B5B]">
                  Embark on a journey to find your special someone with our innovative matchmaking platform. Explore
                  meaningful connections and potential lifelong partnerships as you navigate the path to discovering the
                  perfect match tailored just for you.
                </p>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F4D4D4]">
                      <svg className="h-8 w-8 text-[#5C2E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="mb-2 inline-block rounded-full bg-[#C4A57B]/20 px-3 py-1 text-sm text-[#C4A57B]">
                        01
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-[#5C2E2E]">Sign up</h3>
                      <p className="text-[#6B5B5B]">
                        Register for free, showcase your matrimony profile and take the first step towards lasting
                        connections.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#D4E4E4]">
                      <Users className="h-8 w-8 text-[#5C2E2E]" />
                    </div>
                    <div>
                      <div className="mb-2 inline-block rounded-full bg-[#C4A57B]/20 px-3 py-1 text-sm text-[#C4A57B]">
                        02
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-[#5C2E2E]">Connect</h3>
                      <p className="text-[#6B5B5B]">
                        Explore curated matches, effortlessly connecting with potential life partners for a journey of
                        everlasting companionship.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#D4F4D4]">
                      <svg className="h-8 w-8 text-[#5C2E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="mb-2 inline-block rounded-full bg-[#C4A57B]/20 px-3 py-1 text-sm text-[#C4A57B]">
                        03
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-[#5C2E2E]">Interact</h3>
                      <p className="text-[#6B5B5B]">
                        Engage in meaningful conversations, fostering connections that extend into a lifetime of shared
                        joy and understanding.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="bg-[#5C2E2E] text-white hover:bg-[#5C2E2E]/90">
                  <Search className="mr-2 h-4 w-4" />
                  Start your Search
                </Button>
              </div>

              {/* Right Content - Image */}
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="/happy-african-couple.jpg"
                  alt="How it works"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {featuredProfiles.length > 0 && (
          <section id="featured-profiles" className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-serif text-4xl font-bold text-[#5C2E2E]">Featured Profiles</h2>
                <p className="mx-auto max-w-2xl text-[#6B5B5B]">
                  Handpicked for their uniqueness and compatibility, these profiles stand out in the crowd, offering a
                  glimpse into the potential for remarkable connections.
                </p>
              </div>

              <div className="relative">
                <div className="grid gap-8 md:grid-cols-3">
                  {featuredProfiles.slice(currentFeaturedIndex, currentFeaturedIndex + 3).map((profile) => (
                    <div key={profile.id} className="text-center">
                      <div className="mb-4 flex justify-center">
                        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
                          <img
                            src={profile.profile_photo || "/placeholder.svg?height=128&width=128"}
                            alt={profile.first_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <h3 className="mb-1 font-serif text-xl font-bold text-[#5C2E2E]">{profile.first_name}</h3>
                      <p className="mb-3 text-sm text-[#6B5B5B]">
                        Active {formatDistanceToNow(new Date(profile.last_active || new Date()), { addSuffix: true })}
                      </p>
                      <Link href={`/profile/${profile.id}`}>
                        <Button className="bg-[#5C2E2E] text-white hover:bg-[#5C2E2E]/90">See Profile</Button>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={prevFeaturedProfile}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5C2E2E] text-[#5C2E2E] hover:bg-[#5C2E2E] hover:text-white"
                    disabled={currentFeaturedIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextFeaturedProfile}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#5C2E2E] text-[#5C2E2E] hover:bg-[#5C2E2E] hover:text-white"
                    disabled={currentFeaturedIndex + 3 >= featuredProfiles.length}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {packages.length > 0 && (
          <section id="packages" className="bg-gradient-to-b from-white to-[#FAF8F5] py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-serif text-4xl font-bold text-[#5C2E2E]">Elevate Your Membership</h2>
                <p className="mx-auto max-w-2xl text-[#6B5B5B]">
                  Unlock exclusive features, premium benefits, and a personalized approach to make your experience truly
                  exceptional. Embark on a new chapter of enriched connections and lasting relationships.
                </p>
              </div>

              <div className="relative mx-auto max-w-5xl">
                <div className="grid gap-8 md:grid-cols-3">
                  {packages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-3xl border-2 bg-white p-8 text-center ${index === 1 ? "border-[#5C2E2E] shadow-xl" : "border-[#E5D5C5]"
                        }`}
                    >
                      {index === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-[#5C2E2E] px-4 py-1 text-sm text-white">Most popular</span>
                        </div>
                      )}

                      <h3 className="mb-4 font-serif text-2xl font-bold text-[#5C2E2E]">{pkg.name}</h3>

                      <div className="mb-6">
                        <span className="font-serif text-5xl font-bold text-[#5C2E2E]">${pkg.price}</span>
                        <span className="text-[#6B5B5B]">/Monthly</span>
                      </div>

                      <ul className="mb-8 space-y-3 text-left">
                        {Object.entries(pkg.features || {})
                          .slice(0, 4)
                          .map(([key, value]: [string, any]) => (
                            <li key={key} className="flex items-center gap-2 text-[#6B5B5B]">
                              <Check className="h-5 w-5 flex-shrink-0 text-[#5C2E2E]" />
                              <span className="text-sm">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </li>
                          ))}
                      </ul>

                      <Link href="/dashboard/plan">
                        <Button
                          className={`w-full ${index === 1
                            ? "bg-[#5C2E2E] text-white hover:bg-[#5C2E2E]/90"
                            : "bg-[#C4A57B] text-white hover:bg-[#C4A57B]/90"
                            }`}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link href="/dashboard/plan">
                    <Button
                      variant="outline"
                      className="border-[#5C2E2E] text-[#5C2E2E] hover:bg-[#5C2E2E]/10 bg-transparent"
                    >
                      Find out more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {testimonials.length > 0 && (
          <section id="success-stories" className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <div className="mb-2 text-sm text-[#C4A57B]">
                  <span className="inline-block h-px w-12 bg-[#C4A57B]"></span> Matrimonial Platform with Countless
                  Stories of Successful Unions
                </div>
                <h2 className="font-serif text-4xl font-bold text-[#5C2E2E]">
                  Love Found: <span className="text-[#C4A57B]">Millions Success Stories Unveiled.</span>
                </h2>
              </div>

              <div className="relative">
                <div className="grid gap-6 md:grid-cols-3">
                  {testimonials.slice(currentTestimonialIndex, currentTestimonialIndex + 3).map((testimonial) => (
                    <Card
                      key={testimonial.id}
                      className="overflow-hidden border-none bg-gradient-to-br from-[#5C2E2E] to-[#7D4E4E] text-white"
                    >
                      <CardContent className="p-8">
                        <div className="mb-6 text-6xl font-serif opacity-50">"</div>
                        <p className="mb-6 text-sm leading-relaxed">{testimonial.story}</p>
                        <div className="flex items-center gap-3">
                          {testimonial.image && (
                            <img
                              src={testimonial.image || "/placeholder.svg"}
                              alt={testimonial.partner_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{testimonial.partner_name}</p>
                            {testimonial.location && <p className="text-xs opacity-80">{testimonial.location}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2E2E] text-white shadow-lg hover:bg-[#5C2E2E]/90"
                    disabled={currentTestimonialIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2E2E] text-white shadow-lg hover:bg-[#5C2E2E]/90"
                    disabled={currentTestimonialIndex + 3 >= testimonials.length}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>

                {/* Pagination dots */}
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonialIndex(index * 3)}
                      className={`h-2 rounded-full transition-all ${currentTestimonialIndex === index * 3 ? "w-8 bg-[#5C2E2E]" : "w-2 bg-[#C4A57B]/30"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="faq" className="bg-[#F5F1ED] py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-4 text-center text-sm text-[#C4A57B]">
              <span className="inline-block h-px w-12 bg-[#C4A57B]"></span> FAQ
            </div>
            <FAQSection />
          </div>
        </section>

        <section id="newsletter" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm text-[#C4A57B]">Instant notifications</p>
              <h2 className="mb-4 font-serif text-4xl font-bold text-[#5C2E2E]">
                Subscribe To Our Newsletter To Always Be In The Loop
              </h2>
              <form onSubmit={handleNewsletterSubmit} className="mt-8 flex gap-0">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-r-none border-2 border-r-0 border-[#5C2E2E] bg-white text-[#5C2E2E] placeholder:text-[#6B5B5B]"
                  required
                />
                <Button type="submit" className="rounded-l-none bg-[#5C2E2E] px-8 text-white hover:bg-[#5C2E2E]/90">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#F5F1ED] py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold text-[#5C2E2E] md:text-4xl">Get In Touch</h2>
              <p className="mb-8 text-[#6B5B5B]">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-[#E5D5C5] bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2E2E]/10">
                        <svg className="h-6 w-6 text-[#5C2E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#5C2E2E]">Email</h3>
                    <p className="text-sm text-[#6B5B5B]">sales@africannuptials.com</p>
                  </CardContent>
                </Card>

                <Card className="border-[#E5D5C5] bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2E2E]/10">
                        <svg className="h-6 w-6 text-[#5C2E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#5C2E2E]">Phone</h3>
                    <p className="text-sm text-[#6B5B5B]">+(8) 123-56 7890</p>
                  </CardContent>
                </Card>

                <Card className="border-[#E5D5C5] bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2E2E]/10">
                        <svg className="h-6 w-6 text-[#5C2E2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mb-1 font-semibold text-[#5C2E2E]">Support</h3>
                    <p className="text-sm text-[#6B5B5B]">Toll Free Worldwide</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onForgotPassword={handleForgotPassword} />}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} onBack={handleBackToLogin} />
      )}
    </div>
  )
}
