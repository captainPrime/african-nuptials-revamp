# African Nuptials - Dating App

A comprehensive African matrimony platform built with Next.js, Supabase, and Cloudinary.

## Features

- ✅ User Authentication (Sign up, Login, Password Reset)
- ✅ Multi-step Profile Creation
- ✅ Profile Management (View & Edit)
- ✅ Photo Gallery with Cloudinary Integration
- ✅ Advanced Search Functionality
- ✅ Profile Statistics & Analytics
- ✅ Responsive Design

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=african_nuptials
\`\`\`

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Go to Settings > Upload
3. Create an unsigned upload preset named "african_nuptials"
4. Add your cloud name to the environment variables

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL scripts in the `scripts` folder in order:
   - `01-create-profiles-table.sql`
   - `02-create-profile-views-table.sql`
   - `03-create-likes-table.sql`

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Image Storage:** Cloudinary
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **TypeScript:** Full type safety

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── dashboard/         # Protected dashboard routes
│   ├── profile/           # Public profile pages
│   └── reset-password/    # Password reset page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client setup
│   └── types/            # TypeScript types
└── scripts/              # Database migration scripts
\`\`\`

## Features Breakdown

### Authentication
- Email/password signup with multi-step onboarding
- Login with "remember me" functionality
- Forgot password with email reset link
- Protected routes with middleware

### Profile Management
- Comprehensive profile fields (personal, professional, family, lifestyle)
- Profile completion tracking
- Photo gallery (up to 6 photos)
- Profile photo upload
- Social media links
- Hobbies management

### Dashboard
- Profile statistics (views, likes, interests, clicks)
- Profile completion indicator
- Quick access to edit profile
- Sidebar navigation

### Search
- Advanced search with filters (gender, age, religion, location)
- Profile ID search
- Recent matches display

## License

MIT
