import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    const supabase = await createClient()

    // Save to database
    const { error: dbError } = await supabase.from("contact_submissions").insert([
      {
        name,
        email,
        phone,
        message,
        status: "pending",
      },
    ])

    if (dbError) throw dbError

    // Send email notification (using a simple fetch to a hypothetical email service)
    // In production, you'd use a service like SendGrid, Resend, or AWS SES
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "noreply@africannuptials.com",
          to: "admin@africannuptials.com",
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        }),
      })
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
  }
}
