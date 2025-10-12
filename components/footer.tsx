import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="font-serif text-xl font-semibold">AfricaNuptials</span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              Africa Nuptials is the first exclusively African matrimony website worldwide, a platform created to
              connect and facilitate life partners.
            </p>
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/membership" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-primary-foreground/80 hover:text-primary-foreground">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Search Profiles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-foreground/80 hover:text-primary-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Subscribe to newsletter</h3>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button
                type="submit"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Subscribe
              </Button>
            </form>
            <div className="space-y-1 text-sm">
              <p className="text-primary-foreground/80">Toll Free Worldwide Support</p>
              <p className="font-serif text-xl font-semibold">+(8) 123-56 7890</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-primary-foreground/80">Sales Inquiries</p>
              <p className="font-medium">sales@africannuptials.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/80">
          <p>All rights reserved | @africanuptials 2023</p>
        </div>
      </div>
    </footer>
  )
}
