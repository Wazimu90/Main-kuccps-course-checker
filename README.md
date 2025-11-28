# KUCCPS Course Checker

A comprehensive web application that helps Kenyan students determine which university and college courses they qualify for based on their KCSE (Kenya Certificate of Secondary Education) results.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/wcreator/v0-kcc-v1-forked)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/kkUv5ijALpH)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

KUCCPS Course Checker simplifies the process of finding eligible courses for Kenyan students. Instead of manually cross-referencing KCSE grades with course requirements, students can input their grades and instantly receive a list of courses they qualify for across multiple education levels.

## Features

### For Students
- **Multi-Level Course Matching**: Supports Degree, Diploma, Certificate, Artisan, KMTC, and Short courses
- **Smart Grade Entry**: Easy-to-use interface for entering KCSE subject grades
- **Cluster Weight Calculation**: Automatically calculates cluster points based on subject combinations
- **Detailed Results**: View matching courses with university names, cutoff points, and requirements
- **PDF Export**: Download results as professionally formatted PDF reports
- **Dark/Light Mode**: Comfortable viewing in any lighting condition

### For Administrators
- **Dashboard Analytics**: Real-time statistics on user activity and course queries
- **User Management**: Monitor and manage registered users
- **Blog Management**: Create and publish educational content
- **News Management**: Post education news with engagement tracking (likes/comments)
- **Chatbot Training**: Upload training data and configure AI assistant
- **Payment Settings**: Enable/disable payment features

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **AI Integration**: OpenRouter API (for chatbot)

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── about/              # About page
│   ├── admin/              # Admin dashboard (protected)
│   │   ├── blog/           # Blog management
│   │   ├── chatbot/        # Chatbot configuration
│   │   ├── dashboard/      # Admin overview
│   │   ├── login/          # Admin authentication
│   │   ├── news/           # News analytics
│   │   ├── settings/       # Site settings
│   │   └── users/          # User management
│   ├── contact/            # Contact form
│   ├── faq/                # Frequently asked questions
│   ├── input/[category]/   # Grade entry by course type
│   ├── news/               # Education news
│   │   └── [slug]/         # Individual news article
│   ├── payment/            # Payment processing
│   ├── privacy-policy/     # Privacy policy
│   ├── results/            # Course matching results
│   └── terms/              # Terms of service
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/                    # Utility functions and data
│   ├── courses-data.ts     # Course database
│   ├── news-data.ts        # News articles
│   ├── supabase.ts         # Database client
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
├── scripts/                # Database migration scripts
└── public/                 # Static assets
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/wcreator/v0-kuccps-course-checker.git
cd v0-kuccps-course-checker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key (optional, for chatbot)
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Course Categories

| Category | Description | Target Students |
|----------|-------------|-----------------|
| Degree | University undergraduate programs | High achievers (C+ and above) |
| Diploma | Technical and professional diplomas | C- to C+ achievers |
| Certificate | Vocational certificates | D+ to C achievers |
| Artisan | Trade and craft courses | D- to D+ achievers |
| KMTC | Kenya Medical Training College | Medical career seekers |
| Short Courses | Professional development | All levels |

## Key Pages

- **Home** (`/`): Landing page with animated background and feature highlights
- **Input** (`/input/[category]`): Grade entry form for selected course category
- **Results** (`/results`): Matched courses display with filtering and PDF export
- **News** (`/news`): Education news with categories, search, likes, and comments
- **About** (`/about`): Information about the platform
- **Contact** (`/contact`): Contact form for inquiries
- **FAQ** (`/faq`): Common questions and answers

## Admin Access

Navigate to `/admin/login` to access the admin dashboard. Admin features include:
- Dashboard with user statistics
- Blog post management
- News engagement analytics
- Chatbot configuration
- User management
- Site settings

## Color Palette

| Mode | Background | Text | Accent |
|------|------------|------|--------|
| Light | #f5f7fa, #eef2f6 | #2c3e50, #52616b | #2ca58d |
| Dark | #1e1e2f, #2c2c3b | #93a5be, #ccd6f6 | #2ca58d |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [v0.app](https://v0.app) by Vercel
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

For support, please open an issue or contact us through the website's contact form.

---

**Live Demo**: [KUCCPS Course Checker](https://vercel.com/wcreator/v0-kcc-v1-forked)

**Continue Building**: [v0.app Chat](https://v0.app/chat/kkUv5ijALpH)
