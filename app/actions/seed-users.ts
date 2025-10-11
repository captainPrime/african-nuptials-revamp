"use server"

import { createClient } from "@/lib/supabase/server"

const testUsers = [
  {
    email: "ashley.emyy@test.com",
    password: "Test123456!",
    first_name: "Ashley",
    last_name: "Emyy",
    gender: "female",
    date_of_birth: "1995-03-15",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Lagos, Nigeria",
    height: "165cm",
    education: "Bachelor of Science",
    profession: "IT Professional",
    annual_income: "$50,000 - $75,000",
  },
  {
    email: "elizabeth.taylor@test.com",
    password: "Test123456!",
    first_name: "Elizabeth",
    last_name: "Taylor",
    gender: "female",
    date_of_birth: "1994-07-22",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Accra, Ghana",
    height: "170cm",
    education: "Bachelor of Science",
    profession: "IT Professional",
    annual_income: "$40,000 - $60,000",
  },
  {
    email: "angelina.jolie@test.com",
    password: "Test123456!",
    first_name: "Angelina",
    last_name: "Jolie",
    gender: "female",
    date_of_birth: "1993-06-10",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Nairobi, Kenya",
    height: "168cm",
    education: "Bachelor of Science",
    profession: "IT Professional",
    annual_income: "$45,000 - $65,000",
  },
  {
    email: "olivia.mia@test.com",
    password: "Test123456!",
    first_name: "Olivia",
    last_name: "Mia",
    gender: "female",
    date_of_birth: "1996-09-18",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Cape Town, South Africa",
    height: "163cm",
    education: "Bachelor of Science",
    profession: "IT Professional",
    annual_income: "$35,000 - $55,000",
  },
  {
    email: "jennifer.smith@test.com",
    password: "Test123456!",
    first_name: "Jennifer",
    last_name: "Smith",
    gender: "female",
    date_of_birth: "1992-11-25",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Johannesburg, South Africa",
    height: "167cm",
    education: "Bachelor of Science",
    profession: "IT Professional",
    annual_income: "$50,000 - $70,000",
  },
  {
    email: "michael.johnson@test.com",
    password: "Test123456!",
    first_name: "Michael",
    last_name: "Johnson",
    gender: "male",
    date_of_birth: "1990-04-12",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Lagos, Nigeria",
    height: "180cm",
    education: "Master of Science",
    profession: "Software Engineer",
    annual_income: "$60,000 - $85,000",
  },
  {
    email: "david.williams@test.com",
    password: "Test123456!",
    first_name: "David",
    last_name: "Williams",
    gender: "male",
    date_of_birth: "1991-08-30",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Accra, Ghana",
    height: "175cm",
    education: "Bachelor of Engineering",
    profession: "Civil Engineer",
    annual_income: "$55,000 - $75,000",
  },
  {
    email: "james.brown@test.com",
    password: "Test123456!",
    first_name: "James",
    last_name: "Brown",
    gender: "male",
    date_of_birth: "1989-12-05",
    profile_created_for: "myself",
    religion: "Christianity",
    community: "African",
    living_in: "Nairobi, Kenya",
    height: "178cm",
    education: "Master of Business Administration",
    profession: "Business Analyst",
    annual_income: "$65,000 - $90,000",
  },
]

export async function seedTestUsers() {
  const supabase = await createClient()

  const results = {
    success: [] as string[],
    errors: [] as string[],
  }

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase.from("profiles").select("email").eq("email", user.email).single()

      if (existingProfile) {
        results.errors.push(`${user.email} already exists`)
        continue
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        results.errors.push(`${user.email}: ${authError?.message || "Failed to create auth user"}`)
        continue
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        profile_created_for: user.profile_created_for,
        religion: user.religion,
        community: user.community,
        living_in: user.living_in,
        height: user.height,
        education: user.education,
        profession: user.profession,
        annual_income: user.annual_income,
        profile_completion: 60,
      })

      if (profileError) {
        results.errors.push(`${user.email}: ${profileError.message}`)
        continue
      }

      results.success.push(user.email)
    } catch (error) {
      results.errors.push(`${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}
