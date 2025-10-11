"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSearch } from "@/components/hero-search"
import { SignupModal } from "@/components/auth/signup-modal"
import { LoginModal } from "@/components/auth/login-modal"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true)
    window.addEventListener("show-login-modal", handleShowLogin)
    return () => window.removeEventListener("show-login-modal", handleShowLogin)
  }, [])

  const handleForgotPassword = () => {
    setShowLogin(false)
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setShowLogin(true)
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
