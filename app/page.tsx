"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSearch } from "@/components/hero-search"
import { SignupModal } from "@/components/auth/signup-modal"
import { LoginModal } from "@/components/auth/login-modal"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Heart, Users, Shield, Check, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])

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
      .order("display_order")
      .limit(3)

    if (packagesData) setPackages(packagesData)

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, age, city, country, profile_photo, is_verified")
      .eq("is_featured", true)
      .order("featured_order")
      .limit(6)

    if (profilesData) setFeaturedProfiles(profilesData)

    const { data: articlesData } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)

    if (articlesData) setArticles(articlesData)

    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("display_order")
      .limit(3)

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSignUpClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-accent/20 py-20">
          {/* Decorative leaf elements */}
          <div className="absolute left-0 top-0 h-64 w-64 opacity-20">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 100C50 100 70 60 100 50C130 40 150 60 150 60"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
              />
              <path
                d="M100 50C100 50 110 80 100 100C90 120 70 130 70 130"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
              />
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 h-96 w-96 opacity-20">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M150 100C150 100 130 140 100 150C70 160 50 140 50 140"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
              />
              <path
                d="M100 150C100 150 90 120 100 100C110 80 130 70 130 70"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
              />
            </svg>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  Discover Your Forever Love
                </div>

                <h1 className="font-serif text-5xl font-bold leading-tight text-primary lg:text-6xl">
                  Welcome to African Nuptials, Where Love Stories Begin
                </h1>

                <p className="text-lg leading-relaxed text-muted-foreground">
                  Embark on a journey of love with us. Your dream wedding is just a click away - because every "I do"
                  starts with the perfect connection.
                </p>

                <HeroSearch />
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                  <img
                    src="/happy-african-couple-embracing.jpg"
                    alt="Happy couple"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Floating profile cards */}
                <div className="absolute -right-4 top-12 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl">
                  <img src="/smiling-african-woman.jpg" alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -left-4 bottom-32 h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-xl">
                  <img src="/happy-african-couple.jpg" alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div className="absolute right-12 top-1/3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary shadow-xl">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-foreground"
                  >
                    <path
                      d="M16 4C16 4 12 8 12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12C20 8 16 4 16 4Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 16C8 16 4 20 4 24C4 26.2091 5.79086 28 8 28C10.2091 28 12 26.2091 12 24C12 20 8 16 8 16Z"
                      fill="currentColor"
                    />
                    <path
                      d="M24 16C24 16 20 20 20 24C20 26.2091 21.7909 28 24 28C26.2091 28 28 26.2091 28 24C28 20 24 16 24 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">About Us</p>
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Most Trusted and Premium Matrimony Service in the World
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold">Genuine profiles</h3>
                  <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold">Most trusted</h3>
                  <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Heart className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold">200+ weddings</h3>
                  <p className="text-sm text-muted-foreground">The most trusted wedding matrimony brand</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-secondary/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">How It Works</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Finding your perfect match is easy with our simple 4-step process
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Create Profile",
                  desc: "Sign up and complete your profile with your preferences",
                },
                {
                  step: "02",
                  title: "Find Matches",
                  desc: "Browse through compatible profiles matched by our AI algorithm",
                },
                { step: "03", title: "Connect", desc: "Send interest requests and start conversations with matches" },
                {
                  step: "04",
                  title: "Meet & Marry",
                  desc: "Take your relationship forward and find your life partner",
                },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {index < 3 && <ArrowRight className="absolute right-0 top-8 hidden h-6 w-6 text-primary md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {featuredProfiles.length > 0 && (
          <section className="bg-background py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Featured Profiles</h2>
                  <p className="text-muted-foreground">Discover verified and premium members</p>
                </div>
                <Link href="/search">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProfiles.map((profile) => (
                  <Link key={profile.id} href={`/profile/${profile.id}`}>
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[3/4]">
                        <img
                          src={profile.profile_photo || "/placeholder.svg?height=400&width=300"}
                          alt={profile.first_name}
                          className="h-full w-full object-cover"
                        />
                        {profile.is_verified && (
                          <Badge className="absolute right-2 top-2 bg-primary">
                            <Check className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-1 font-serif text-lg font-bold">{profile.first_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.age} years • {profile.city}, {profile.country}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {packages.length > 0 && (
          <section className="bg-primary py-20 text-primary-foreground">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Choose Your Plan</h2>
                <p className="mx-auto max-w-2xl text-primary-foreground/80">
                  Select the perfect membership package to start your journey
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {packages.map((pkg, index) => (
                  <Card key={pkg.id} className={`${index === 1 ? "border-2 border-accent" : ""}`}>
                    <CardContent className="p-8 text-center">
                      {index === 1 && <Badge className="mb-4 bg-accent text-accent-foreground">Most Popular</Badge>}
                      <h3 className="mb-2 font-serif text-2xl font-bold">{pkg.name}</h3>
                      <div className="mb-6">
                        <span className="font-serif text-4xl font-bold">${pkg.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <ul className="mb-6 space-y-2 text-left text-sm">
                        {Object.entries(pkg.features)
                          .slice(0, 4)
                          .map(([key, value]: [string, any]) => (
                            <li key={key} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              <span>{key.replace(/_/g, " ")}</span>
                            </li>
                          ))}
                      </ul>
                      <Link href="/membership">
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {testimonials.length > 0 && (
          <section className="bg-background py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 text-center">
                <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Love Found: Success Stories</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Real couples who found their forever love through African Nuptials
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-primary/5">
                    <CardContent className="p-6">
                      <div className="mb-4 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="mb-4 text-sm italic">{testimonial.story}</p>
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
                          {testimonial.location && (
                            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section className="bg-secondary/30 py-20">
            <div className="container mx-auto px-4">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 font-serif text-3xl font-bold md:text-4xl">Latest Articles</h2>
                  <p className="text-muted-foreground">Tips and insights for your journey</p>
                </div>
                <Link href="/articles">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {articles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`}>
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      {article.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={article.cover_image || "/placeholder.svg"}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="mb-2 font-serif text-xl font-bold line-clamp-2">{article.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">Subscribe To Our Newsletter</h2>
              <p className="mb-8 text-primary-foreground/80">
                Stay updated with the latest tips, success stories, and exclusive offers
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                  required
                />
                <Button type="submit" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Subscribe
                </Button>
              </form>
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
