# KUCCPS Course Checker - Complete Documentation

## Project Summary

The KUCCPS Course Checker is a Next.js-based web application that helps Kenyan students determine which courses they qualify for based on their KCSE (Kenya Certificate of Secondary Education) results. The system uses official KUCCPS data and cluster formulas to provide instant, accurate course matching across multiple education levels: Degree, Diploma, Certificate, KMTC, and Artisan programs. The platform serves over 10,000 students with a 99% accuracy rate and includes comprehensive features like an admin dashboard, news section, payment gateway, and AI-powered chatbot assistant.

---

## Table of Contents

1. [Site Map & Routes](#site-map--routes)
2. [Page-by-Page Documentation](#page-by-page-documentation)
3. [Component Architecture](#component-architecture)
4. [UI Documentation](#ui-documentation)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Database Structure](#database-structure)
8. [Data Flow](#data-flow)
9. [Deployment & Environment](#deployment--environment)
10. [File Structure](#file-structure)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)
13. [Security & Privacy](#security--privacy)
14. [Roadmap & TODOs](#roadmap--todos)

---

## Site Map & Routes

### User-Facing Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Homepage | Landing page with hero section, course categories, testimonials |
| `/input/degree` | Degree Grade Entry | Input KCSE grades for degree program eligibility |
| `/input/diploma` | Diploma Grade Entry | Input KCSE grades for diploma program eligibility |
| `/input/certificate` | Certificate Grade Entry | Input KCSE grades for certificate program eligibility |
| `/input/kmtc` | KMTC Grade Entry | Input KCSE grades for KMTC program eligibility |
| `/input/artisan` | Artisan Grade Entry | Input KCSE grades for artisan program eligibility |
| `/results` | Results Page | Display eligible courses with filters, search, and PDF export |
| `/payment` | Payment Page | Handle payment processing for premium features |
| `/news` | News Listing | Display education-related news articles |
| `/news/[slug]` | News Article | Individual news article with comments and likes |
| `/about` | About Page | Information about the platform |
| `/contact` | Contact Page | Contact form for support |
| `/faq` | FAQ Page | Frequently asked questions |
| `/privacy-policy` | Privacy Policy | Data privacy information |
| `/terms` | Terms & Conditions | Terms of service |

### Admin Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/admin/login` | Admin Login | Authentication for admin access |
| `/admin/dashboard` | Admin Dashboard | Overview of platform statistics and analytics |
| `/admin/users` | User Management | View and manage user accounts |
| `/admin/chatbot` | Chatbot Management | Configure AI chatbot settings and training data |
| `/admin/blog` | Blog Management | Manage blog posts and content |
| `/admin/news` | News Analytics | View real-time news engagement (likes, comments) |
| `/admin/settings` | Admin Settings | General platform settings including payment toggle |

---

## Page-by-Page Documentation

### Homepage (`/`)
**File:** `app/page.tsx`

**Purpose:** Landing page showcasing platform features and driving user engagement

**Key Features:**
- Animated gradient background
- TextType component with rotating hero messages
- Course category cards (7 categories)
- How It Works section (3 steps)
- Testimonial carousel
- Statistics display (10,000+ students, 4.9/5 rating, 99% accuracy)

**Components Used:**
- `AnimatedBackground` - Dynamic gradient background
- `TextType` - Typing animation for hero text
- `CourseCategoryCard` - Interactive category cards
- `TestimonialCarousel` - Student testimonials
- `Footer` - Site footer

**State Management:**
- Uses `useRef` to track course categories section for smooth scrolling
- Toast notifications for "Coming Soon" features

**Data Flow:**
1. User lands on homepage
2. Can scroll to course categories or click "Check Now" button
3. Selects course category to begin grade entry
4. Navigates to respective `/input/[category]` page

---

### Grade Entry Pages (`/input/[category]`)
**File:** `app/input/[category]/page.tsx`

**Purpose:** Collect user's KCSE grades and calculate eligible courses

**Supported Categories:**
- `degree` - Bachelor's degree programs
- `diploma` - Diploma courses
- `certificate` - Certificate programs
- `kmtc` - Kenya Medical Training College
- `artisan` - Technical/vocational courses

**Components Used:**
- `GradeEntryForm` - Main form for grade input
- `ClusterWeightsForm` - Subject cluster point calculator
- `LoadingAnimation` - Processing state display
- Category-specific processing animations

**Data Flow:**
1. User selects category from homepage
2. Form validates grade inputs (A, A-, B+, etc.)
3. User enters subject grades and cluster points
4. On submit, calculates eligible courses using category-specific eligibility logic
5. Stores results in localStorage
6. Redirects to `/results` page

**Validation Rules:**
- Minimum required subjects vary by category
- Grades must be valid KCSE grades (A to E)
- Cluster points validated against official KUCCPS weights

**Files Involved:**
- `lib/course-eligibility.ts` - Degree eligibility logic
- `lib/diploma-course-eligibility.ts` - Diploma eligibility logic
- `lib/certificate-course-eligibility.ts` - Certificate eligibility logic
- `lib/kmtc-course-eligibility.ts` - KMTC eligibility logic
- `lib/artisan-course-eligibility.ts` - Artisan eligibility logic
- `lib/grade-utils.ts` - Grade conversion utilities

---

### Results Page (`/results`)
**File:** `app/results/page.tsx`

**Purpose:** Display eligible courses with filtering, searching, and export options

**Key Features:**
- Course table with sorting and filtering
- Category filter (University, TVETs, KMTC)
- Search functionality
- PDF export (premium feature requiring payment)
- AI chatbot assistant for course recommendations
- User summary card

**Components Used:**
- `CourseTable` - Main results table with pagination
- `UserSummary` - Display user's grades and summary
- `ChatbotAssistant` - AI-powered course advisor
- `CourseDetailsModal` - Detailed course information popup

**State Management:**
- Retrieves results from localStorage
- Filters courses by category and search query
- Manages payment status for PDF export

**Data Flow:**
1. Loads results from localStorage
2. User can filter courses by category
3. User can search courses by name/institution
4. Click course for detailed modal view
5. Export to PDF (requires payment if unpaid)
6. Chat with AI assistant for recommendations

**Premium Features:**
- PDF export requires payment (KES 50)
- Payment status tracked in localStorage
- Redirects to `/payment` for unpaid users

---

### Payment Page (`/payment`)
**File:** `app/payment/page.tsx`

**Purpose:** Handle payment processing for premium features (PDF export)

**Payment Details:**
- Amount: KES 50
- Payment methods: M-Pesa, Airtel Money
- Instant verification

**Components Used:**
- `PaymentSummary` - Order details display
- `PaymentStatus` - Payment confirmation

**Server Actions:**
- `app/payment/actions.ts` - Server-side payment processing

**Data Flow:**
1. User initiates payment from results page
2. Selects payment method
3. Enters phone number
4. Server processes payment
5. Updates payment status
6. Redirects back to results page with unlock

**Integration Points:**
- -- GUESS (70% confidence) -- M-Pesa Daraja API for payment processing
- -- GUESS (60% confidence) -- Webhook endpoint for payment confirmation
- **Verification:** Check `app/payment/actions.ts` for exact integration details

---

### News Section (`/news`)
**File:** `app/news/page.tsx`

**Purpose:** Display education-related news articles with engagement features

**Key Features:**
- Grid layout matching provided design (3 columns)
- Category badges (Education, Technology, Business, Lifestyle)
- Search functionality
- Like and comment system
- Real-time engagement tracking

**Components Used:**
- News card components (inline)
- Search input
- Category filter tabs

**Data Source:**
- `lib/news-data.ts` - Mock news articles

**Data Flow:**
1. Loads news articles from news-data.ts
2. User can filter by category
3. User can search articles
4. Click article to view full content
5. Like/comment interactions stored in localStorage

**Engagement Features:**
- Like button with counter
- Comment form with name and message
- Real-time updates visible in admin dashboard

---

### News Article Page (`/news/[slug]`)
**File:** `app/news/[slug]/page.tsx`

**Purpose:** Display full news article with comments and likes

**Key Features:**
- Full article content
- Author and date information
- Like button
- Comment section
- Related articles
- Share functionality (-- GUESS --)

**State Management:**
- Tracks likes per article
- Stores comments in localStorage
- Updates engagement metrics for admin view

**Data Flow:**
1. Loads article by slug from news-data.ts
2. User can like article
3. User can add comments
4. Comments and likes synced to localStorage
5. Admin dashboard displays real-time stats

---

### Admin Dashboard (`/admin/dashboard`)
**File:** `app/admin/dashboard/page.tsx`

**Purpose:** Central hub for admin users to monitor platform metrics

**Key Metrics:**
- Total users
- Active sessions
- Revenue generated
- System status

**Components Used:**
- `DashboardStats` - KPI cards
- `BarChart` - User activity trends
- `PieChart` - Course category distribution
- `RecentActivity` - Latest user actions
- `SystemAlerts` - System notifications

**Tabs:**
- Overview - Main dashboard view
- Analytics - Detailed analytics charts

**Data Flow:**
- -- GUESS (50% confidence) -- Fetches data from Supabase analytics tables
- Displays aggregated statistics
- Auto-refreshes every 30 seconds (-- GUESS --)

**Access Control:**
- Protected by admin layout
- Requires authentication
- No sidebar/topbar on login page

---

### Admin News Analytics (`/admin/news`)
**File:** `app/admin/news/page.tsx`

**Purpose:** Monitor real-time engagement on news articles

**Key Features:**
- Total likes counter
- Total comments counter
- Engagement rate calculation
- Live activity feed (refreshes every 2 seconds)
- Recent comments list
- Popular articles by likes

**Tabs:**
- Recent Activity - Live feed of interactions
- Comments - All user comments with timestamps
- Likes - Articles sorted by popularity

**Data Source:**
- localStorage for news interactions
- Formatted timestamps
- Article title mapping

**Real-time Updates:**
- Auto-refreshes every 2 seconds
- No manual refresh needed
- Instant visibility of new interactions

---

### Admin Chatbot Management (`/admin/chatbot`)
**File:** `app/admin/chatbot/page.tsx`

**Purpose:** Configure AI chatbot settings and training data

**Tabs:**
1. **Training Data**
   - Upload .txt files for context
   - Display uploaded file name and size
   - Remove uploaded files
   - File upload validation

2. **Bot Settings**
   - OpenRouter API key input
   - Show/hide password toggle
   - Save API key button
   - Link to OpenRouter dashboard

3. **Conversation History** (-- GUESS --)
   - View past chatbot interactions
   - Export conversation logs

**Database Tables Used:**
- `chatbot_contexts` - Training data files
- `chatbot_api_key` - OpenRouter API key storage
- `chatbot_settings` - Bot configuration
- `chatbot_history` - Conversation logs

**Data Flow:**
1. Admin uploads .txt training file
2. File saved to `chatbot_contexts` table
3. API key saved to `chatbot_api_key` table
4. Chatbot uses context for responses

---

### Admin Settings (`/admin/settings`)
**File:** `app/admin/settings/page.tsx`

**Purpose:** Configure general platform settings

**Simplified Structure:**
- Removed: Email, Security, Notifications, Database tabs
- Kept: General tab only

**General Settings:**
- **Payment Toggle:** Enable/disable payment feature
- Platform name (-- GUESS --)
- Maintenance mode (-- GUESS --)

**State Management:**
- Toggle stored in Supabase (-- GUESS --)
- Real-time updates across platform

---

## Component Architecture

### Core Components

#### `AnimatedBackground` (`components/animated-background.tsx`)
- **Purpose:** Animated gradient background for visual appeal
- **Props:** None (default export)
- **Features:** 
  - Pink and purple gradient hues
  - Smooth animation
  - Fixed position overlay
- **Usage:** Homepage, admin login

#### `Header` (`components/header.tsx`)
- **Purpose:** Main navigation header
- **Features:**
  - Logo and brand name
  - Navigation links (Home, News, About, Contact, FAQ)
  - Mode toggle (light/dark)
  - Mobile responsive menu
- **State:** Active route tracking

#### `Footer` (`components/footer.tsx`)
- **Purpose:** Site footer with links and info
- **Props:** `showOnHomepage` - boolean to control visibility
- **Features:**
  - Quick links
  - Social media links (-- GUESS --)
  - Copyright information

#### `GradeEntryForm` (`components/grade-entry-form.tsx`)
- **Purpose:** Collect KCSE grades from users
- **Props:**
  - `category` - Course category type
  - `onSubmit` - Callback function
- **Features:**
  - Grade dropdowns (A to E)
  - Subject selection
  - Form validation
  - Real-time feedback
- **Validation:**
  - Required fields check
  - Valid grade format
  - Minimum subjects per category

#### `ClusterWeightsForm` (`components/cluster-weights-form.tsx`)
- **Purpose:** Calculate cluster points for course eligibility
- **Props:**
  - `subjects` - Array of subjects
  - `onCalculate` - Callback with calculated points
- **Features:**
  - Subject weight selection
  - Auto-calculation
  - Visual feedback

#### `CourseTable` (`components/results/course-table.tsx`)
- **Purpose:** Display eligible courses in sortable table
- **Props:**
  - `courses` - Array of course objects
  - `onCourseClick` - Course selection callback
- **Features:**
  - Sorting by name, institution, points
  - Pagination
  - Search filtering
  - Category filtering

#### `ChatbotAssistant` (`components/results/chatbot-assistant.tsx`)
- **Purpose:** AI-powered course recommendation chatbot
- **Props:**
  - `userGrades` - User's KCSE grades
  - `eligibleCourses` - List of eligible courses
- **Features:**
  - Natural language processing
  - Course recommendations
  - Conversational interface
- **Integration:** OpenRouter API via AI SDK
- **Database:** Stores chat history in `chatbot_history` table

#### `TestimonialCarousel` (`components/testimonial-carousel.tsx`)
- **Purpose:** Display student testimonials
- **Features:**
  - Auto-scrolling carousel
  - Manual navigation
  - Responsive design
- **Data Source:** `lib/mock-data.ts` (-- GUESS --)

#### `TextType` (`components/ui/text-type.tsx`)
- **Purpose:** Animated typing text effect
- **Props:**
  - `text` - Array of strings to type
  - `typingSpeed` - Speed of typing (ms)
  - `pauseDuration` - Pause between texts
  - `showCursor` - Show blinking cursor
  - `loop` - Loop through texts
- **Uses:** GSAP for animation
- **CSS:** `components/ui/TextType.css`

### Admin Components

#### `AdminSidebar` (`components/admin/admin-sidebar.tsx`)
- **Purpose:** Admin navigation sidebar
- **Features:**
  - Collapsible on mobile
  - Active route highlighting
  - Icon-based navigation
  - Show/hide toggle button
- **Routes:**
  - Dashboard
  - Users
  - Chatbot
  - Blog
  - News
  - Settings

#### `AdminTopbar` (`components/admin/admin-topbar.tsx`)
- **Purpose:** Admin page header
- **Features:**
  - Page title display
  - User profile dropdown (-- GUESS --)
  - Notifications (-- GUESS --)
- **State:** Current page context

#### `DashboardStats` (`components/admin/dashboard-stats.tsx`)
- **Purpose:** Display KPI cards on dashboard
- **Props:**
  - `stats` - Array of statistic objects
- **Features:**
  - Color-coded cards
  - Icon display
  - Percentage change indicators

#### `BarChart` (`components/admin/bar-chart.tsx`)
- **Purpose:** Recharts bar chart wrapper
- **Props:**
  - `data` - Chart data array
  - `xKey` - X-axis data key
  - `yKey` - Y-axis data key
- **Library:** Recharts

#### `PieChart` (`components/admin/pie-chart.tsx`)
- **Purpose:** Recharts pie chart wrapper
- **Props:**
  - `data` - Chart data array
- **Library:** Recharts

### Processing Animation Components

Category-specific loading animations:
- `components/degree-processing-animation.tsx` (-- GUESS, not found --)
- `components/diploma-processing-animation.tsx`
- `components/certificate-processing-animation.tsx`
- `components/kmtc-processing-animation.tsx`
- `components/artisan-processing-animation.tsx`

**Features:**
- Progress bars
- Step indicators
- Loading messages
- Estimated time display

---

## UI Documentation

### Color Palette

**Defined in:** `app/globals.css`

#### Light Mode Colors
\`\`\`css
--background: oklch(1 0 0)         /* Pure white background */
--foreground: oklch(0.145 0 0)     /* Near black text */
--primary: oklch(0.205 0 0)        /* Dark primary */
--secondary: oklch(0.97 0 0)       /* Light gray */
--accent: oklch(0.97 0 0)          /* Light accent */
--muted: oklch(0.97 0 0)           /* Muted gray */
--border: oklch(0.922 0 0)         /* Light border */
\`\`\`

#### Dark Mode Colors
\`\`\`css
--background: oklch(0.145 0 0)     /* Near black background */
--foreground: oklch(0.985 0 0)     /* Near white text */
--primary: oklch(0.985 0 0)        /* Light primary */
--secondary: oklch(0.269 0 0)      /* Dark gray */
--accent: oklch(0.269 0 0)         /* Dark accent */
--muted: oklch(0.269 0 0)          /* Dark muted */
--border: oklch(0.269 0 0)         /* Dark border */
\`\`\`

#### Gradient Colors (Animated Background)
\`\`\`css
Linear gradient: #3ab795, #00aeef, #845ec2, #ff8bbf, #d65db1
Animation: 12s ease infinite
\`\`\`

#### Course Category Color Schemes
- **Purple:** Degree programs
- **Blue:** Diploma programs
- **Green:** Certificate programs
- **Orange:** KMTC programs
- **Pink:** Artisan programs
- **Indigo:** Short courses
- **Teal:** Data bundles

#### Chart Colors
\`\`\`css
--chart-1: oklch(0.646 0.222 41.116)
--chart-2: oklch(0.6 0.118 184.704)
--chart-3: oklch(0.398 0.07 227.392)
--chart-4: oklch(0.828 0.189 84.429)
--chart-5: oklch(0.769 0.188 70.08)
\`\`\`

### Typography

**Font Family:** Inter (sans-serif)
**Loaded in:** `app/layout.tsx`

#### Font Scales
- **Hero:** `text-4xl md:text-6xl lg:text-7xl` (36px/60px/72px)
- **H2:** `text-3xl md:text-5xl` (30px/48px)
- **H3:** `text-xl` (20px)
- **Body:** `text-base` (16px)
- **Small:** `text-sm` (14px)

#### Font Weights
- **Bold:** `font-bold` (700)
- **Semibold:** `font-semibold` (600)
- **Medium:** `font-medium` (500)
- **Normal:** `font-normal` (400)

#### Line Heights
- **Tight:** `leading-tight` (1.25)
- **Relaxed:** `leading-relaxed` (1.625)
- **Default:** `leading-normal` (1.5)

### Spacing Units

**Tailwind Spacing Scale (4px base):**
- `p-1` = 4px
- `p-2` = 8px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `p-12` = 48px
- `p-16` = 64px
- `p-20` = 80px

**Common Spacing Patterns:**
- Section padding: `py-20` (80px top/bottom)
- Container padding: `px-4` (16px left/right)
- Card padding: `p-8` (32px all sides)
- Grid gaps: `gap-8` (32px)

### Border Radius

**Defined in CSS variables:**
\`\`\`css
--radius: 0.625rem (10px)
--radius-sm: calc(var(--radius) - 4px)  /* 6px */
--radius-md: calc(var(--radius) - 2px)  /* 8px */
--radius-lg: var(--radius)              /* 10px */
--radius-xl: calc(var(--radius) + 4px)  /* 14px */
\`\`\`

**Tailwind Classes:**
- `rounded` - 0.25rem (4px)
- `rounded-lg` - var(--radius-lg)
- `rounded-xl` - var(--radius-xl)
- `rounded-2xl` - 1rem (16px)
- `rounded-full` - 9999px (circle)

### Shadows

**Tailwind Shadow Classes:**
- `shadow-sm` - Small shadow
- `shadow` - Default shadow
- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow
- `shadow-2xl` - 2XL shadow

**Custom Shadows:**
\`\`\`css
hover:shadow-xl /* Elevated hover state */
hover:shadow-2xl /* Maximum elevation */
\`\`\`

### Breakpoints

**Tailwind Responsive Breakpoints:**
- `sm:` - 640px and above
- `md:` - 768px and above
- `lg:` - 1024px and above
- `xl:` - 1280px and above
- `2xl:` - 1536px and above

**Common Patterns:**
- Mobile first: Base styles apply to mobile
- `md:` prefix for tablet/desktop
- `lg:` prefix for large desktop

### Animations

**Location:** `app/globals.css` and Tailwind classes

#### Gradient Background Animation
\`\`\`css
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animated-gradient {
  animation: gradientBG 12s ease infinite;
}
\`\`\`

#### Framer Motion Animations
**Used in:** Homepage, course cards, testimonials

**Common patterns:**
\`\`\`tsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
whileHover={{ y: -10, scale: 1.02 }}
\`\`\`

#### GSAP Animations
**Used in:** TextType component
**File:** `components/ui/text-type.tsx`, `components/ui/TextType.css`

**Performance:**
- Hardware accelerated
- GPU-optimized transforms
- RequestAnimationFrame based

### Accessibility

#### Focus States
- All interactive elements have visible focus rings
- Focus ring color: `ring-ring` (oklch(0.708 0 0))
- Focus ring offset: `ring-offset-2`

#### ARIA Labels
- All icons have aria-label attributes (-- VERIFY --)
- Form inputs have associated labels
- Navigation landmarks defined

#### Color Contrast
- WCAG AA compliant (-- VERIFY --)
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text

#### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space activate buttons
- Escape closes modals/dropdowns

### Icon Library

**Library:** Lucide React
**Version:** ^0.454.0
**Import:** `import { Cone as IconName } from 'lucide-react'`

**Commonly Used Icons:**
- `GraduationCap` - Education/degree
- `Award` - Diploma
- `BookOpen` - Certificate
- `Stethoscope` - KMTC
- `Hammer` - Artisan
- `Search` - Search functionality
- `Heart` - Likes
- `MessageCircle` - Comments
- `Download` - PDF export

### UI Modification Guide

#### Change Primary Color
1. Edit `app/globals.css`
2. Update `--color-primary` in `@theme inline` section
3. Format: `--color-primary: HUE SATURATION LIGHTNESS`
4. Example: `--color-primary: 270 80% 50%` (purple)
5. No rebuild needed (CSS hot reload)

#### Change Font
1. Edit `app/layout.tsx`
2. Import new font from `next/font/google`
3. Update font variable
4. No CSS changes needed

#### Change Border Radius
1. Edit `app/globals.css`
2. Update `--radius` variable in root
3. All components update automatically

#### Change Button Styles
1. Edit `components/ui/button.tsx`
2. Modify `buttonVariants` object
3. Add new variants as needed

#### Change Animation Speed
1. Edit `app/globals.css`
2. Update animation duration in `@keyframes`
3. For Framer Motion: Edit individual components

#### Change Layout Spacing
1. Use Tailwind spacing utilities
2. Update `py-` and `px-` classes
3. Common: `py-20` for sections, `px-4` for containers

---

## Frontend Architecture

### Framework & Version
- **Framework:** Next.js 15.2.4
- **React Version:** 19
- **TypeScript:** 5.x
- **Build System:** Turbopack (-- GUESS based on Next.js 15 --)

### Routing Strategy
- **Type:** App Router (Next.js 13+ App Directory)
- **File-based routing:** `app/` directory
- **Dynamic routes:** `[category]` and `[slug]` parameters
- **Layouts:** Nested layouts with `layout.tsx`
- **Loading states:** `loading.tsx` files
- **Not found:** `not-found.tsx`

### State Management

#### Local State
- **Library:** React hooks (useState, useEffect, useRef)
- **Scope:** Component-level state

#### Global State
- **Library:** None (Context API not used)
- **Alternative:** localStorage for cross-page data

#### Form State
- **Library:** React Hook Form (^7.60.0)
- **Validation:** Zod (3.25.76)
- **Pattern:** Controlled components

#### Server State
- **Library:** None (SWR or React Query not used)
- **Pattern:** Server Components for data fetching (-- GUESS --)

### Client-Side Storage
- **Primary:** localStorage
- **Use cases:**
  - Course results caching
  - Payment status
  - News likes/comments
  - User preferences

**Key localStorage Items:**
- `courseResults` - Eligible courses array
- `userGrades` - KCSE grade inputs
- `paymentStatus` - Payment completion flag
- `newsInteractions` - Likes and comments

### Build Commands

\`\`\`bash
# Development
npm run dev         # Start dev server on localhost:3000
pnpm dev           # Alternative with pnpm

# Production
npm run build      # Build for production
npm run start      # Start production server

# Linting
npm run lint       # Run ESLint
\`\`\`

### Environment Variables

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Auth redirect for development

**Optional Variables (-- GUESS --):**
- `OPENROUTER_API_KEY` - OpenRouter API key for chatbot
- `MPESA_CONSUMER_KEY` - M-Pesa integration
- `MPESA_CONSUMER_SECRET` - M-Pesa secret

### Directory Structure

\`\`\`
app/
├── (pages)
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # Root layout with header
│   ├── globals.css              # Global styles
│   ├── not-found.tsx            # 404 page
│   ├── about/page.tsx           # About page
│   ├── contact/page.tsx         # Contact page
│   ├── faq/page.tsx             # FAQ page
│   ├── privacy-policy/page.tsx  # Privacy page
│   ├── terms/page.tsx           # Terms page
│   ├── input/
│   │   └── [category]/page.tsx  # Dynamic grade entry
│   ├── results/
│   │   ├── page.tsx             # Results display
│   │   └── loading.tsx          # Results loading
│   ├── payment/
│   │   ├── page.tsx             # Payment page
│   │   └── actions.ts           # Server actions
│   ├── news/
│   │   ├── page.tsx             # News listing
│   │   ├── loading.tsx          # News loading
│   │   └── [slug]/
│   │       ├── page.tsx         # Article page
│   │       └── loading.tsx      # Article loading
│   └── admin/
│       ├── layout.tsx           # Admin layout
│       ├── login/page.tsx       # Admin auth
│       ├── dashboard/page.tsx   # Dashboard
│       ├── users/page.tsx       # User management
│       ├── chatbot/page.tsx     # Chatbot config
│       ├── blog/page.tsx        # Blog management
│       ├── news/page.tsx        # News analytics
│       └── settings/page.tsx    # Settings

components/
├── admin/                       # Admin-specific components
│   ├── admin-sidebar.tsx
│   ├── admin-topbar.tsx
│   ├── dashboard-stats.tsx
│   ├── bar-chart.tsx
│   └── pie-chart.tsx
├── results/                     # Results page components
│   ├── course-table.tsx
│   ├── user-summary.tsx
│   ├── chatbot-assistant.tsx
│   └── course-details-modal.tsx
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── text-type.tsx           # Custom typing animation
│   └── ... (50+ components)
├── header.tsx                   # Site header
├── footer.tsx                   # Site footer
├── grade-entry-form.tsx         # Grade input form
├── cluster-weights-form.tsx     # Cluster calculator
├── animated-background.tsx      # Gradient background
├── course-category-card.tsx     # Category cards
├── testimonial-carousel.tsx     # Testimonials
└── ... (processing animations)

lib/
├── course-eligibility.ts        # Degree eligibility logic
├── diploma-course-eligibility.ts
├── certificate-course-eligibility.ts
├── kmtc-course-eligibility.ts
├── artisan-course-eligibility.ts
├── grade-utils.ts               # Grade conversion utilities
├── chatbot-service.ts           # Chatbot integration
├── supabase.ts                  # Supabase client
├── news-data.ts                 # News articles data
├── mock-data.ts                 # Mock data for demos
└── utils.ts                     # Utility functions (cn, etc.)

public/
├── images/
│   └── graduation.svg
├── placeholder.svg
└── icon.svg

scripts/
├── create-chatbot-tables.sql    # Database setup
└── remove-chatbot-tables.sql    # Database teardown
\`\`\`

### Client-Side Workflows

#### Course Check Flow
1. User lands on homepage (`/`)
2. Clicks course category card
3. Navigates to `/input/[category]`
4. Fills grade entry form
5. Form validates inputs
6. Processing animation displays
7. Eligibility calculation runs
8. Results saved to localStorage
9. Redirects to `/results`
10. Results page loads from localStorage
11. User can filter, search, export

#### Payment Flow
1. User clicks "Export PDF" on results page
2. Checks localStorage for payment status
3. If unpaid, redirects to `/payment`
4. User selects payment method
5. Enters phone number
6. Server action processes payment
7. Payment confirmation updates localStorage
8. Redirects to `/results`
9. PDF export now unlocked

#### News Engagement Flow
1. User navigates to `/news`
2. Browses news articles
3. Clicks article to read full content
4. Can like article (heart icon)
5. Can add comment with name and message
6. Like/comment saved to localStorage
7. Admin can view in real-time at `/admin/news`

---

## Backend Architecture

### Server Framework
- **Framework:** Next.js App Router
- **API Routes:** Server Actions and Route Handlers
- **Runtime:** Node.js (-- GUESS: 18+ --)

### API Endpoints

#### Payment Actions
**File:** `app/payment/actions.ts`

**Functions:**
- `processPayment(phoneNumber, amount)` - Process M-Pesa payment
- `verifyPayment(transactionId)` - Verify payment status

**Method:** Server Actions (Server Components)

**Expected Response:**
\`\`\`typescript
{
  success: boolean
  transactionId: string
  message: string
}
\`\`\`

-- GUESS (60% confidence) -- Integration with M-Pesa Daraja API
**Verification:** Read `app/payment/actions.ts` to confirm exact implementation

#### Chatbot Endpoints (-- GUESS --)
**Location:** `app/api/chatbot/route.ts` (-- Not found in current scan --)

**Endpoints:**
- `POST /api/chatbot` - Send message to chatbot
- `GET /api/chatbot/history` - Get conversation history

**Integration:** OpenRouter API via AI SDK

### Middleware
-- GUESS (40% confidence) -- No middleware found in current scan
**Verification:** Check for `middleware.ts` in root directory

### Authentication
-- GUESS (50% confidence) -- Admin authentication strategy:
- Simple password-based login
- Session stored in cookies or localStorage
- Protected routes via layout check

**Files to verify:**
- `app/admin/login/page.tsx`
- `app/admin/layout.tsx`

### Background Jobs
-- GUESS (30% confidence) -- No background job system detected
**Potential uses:**
- Payment verification polling
- News data refresh
- Analytics aggregation

---

## Database Structure

### Database Provider
**Service:** Supabase (PostgreSQL)
**Client Library:** @supabase/supabase-js (latest)
**Configuration:** `lib/supabase.ts`

### Tables

#### Chatbot Tables

##### `chatbot_settings`
**Purpose:** Store chatbot configuration
\`\`\`sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
enabled BOOLEAN DEFAULT true
welcome_message TEXT DEFAULT 'Hello! How can I help you with your course selection today?'
response_tone VARCHAR(50) DEFAULT 'friendly'
model VARCHAR(100) DEFAULT 'openai/gpt-3.5-turbo'
temperature DECIMAL(3,2) DEFAULT 0.7
max_tokens INTEGER DEFAULT 150
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
\`\`\`

##### `chatbot_api_key`
**Purpose:** Store OpenRouter API key
\`\`\`sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
api_key TEXT NOT NULL
provider VARCHAR(50) DEFAULT 'openrouter'
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
\`\`\`

##### `chatbot_contexts`
**Purpose:** Store training data files
\`\`\`sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
file_name VARCHAR(255) NOT NULL
file_path VARCHAR(500) NOT NULL
content TEXT NOT NULL
is_active BOOLEAN DEFAULT true
uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
\`\`\`

##### `chatbot_history`
**Purpose:** Store conversation logs
\`\`\`sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_email VARCHAR(255) NOT NULL
user_name VARCHAR(255)
prompt TEXT NOT NULL
response TEXT NOT NULL
session_id VARCHAR(100) NOT NULL
result_id VARCHAR(100)
timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
\`\`\`

#### Course Tables (-- GUESS --)

##### `degree_programmes`
**Purpose:** Store degree course data
**Columns (estimated):**
\`\`\`sql
id UUID PRIMARY KEY
course_code VARCHAR(50)
course_name TEXT NOT NULL
institution TEXT NOT NULL
cluster_subjects TEXT[]
minimum_points DECIMAL(4,2)
category VARCHAR(50)
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
\`\`\`
**Verification:** Query Supabase to confirm exact schema

##### `diploma_programmes` (-- GUESS --)
**Purpose:** Store diploma course data
**Similar structure to degree_programmes**

##### `certificate_programmes` (-- GUESS --)
**Purpose:** Store certificate course data

##### `kmtc_programmes` (-- GUESS --)
**Purpose:** Store KMTC course data

##### `artisan_programmes` (-- GUESS --)
**Purpose:** Store artisan course data

### Supabase-Specific Features

#### Storage Buckets
\`\`\`sql
chatbot-contexts (private)
\`\`\`
**Purpose:** Store uploaded training data files
**Access:** Admin only

#### Authentication
-- GUESS (40% confidence) --
**Providers:** Email/Password (-- GUESS --)
**Users table:** Supabase auth.users

#### Row Level Security (RLS)

**Policies on chatbot tables:**
\`\`\`sql
CREATE POLICY "Allow all for authenticated users" 
ON chatbot_settings 
FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow all for authenticated users" 
ON chatbot_api_key 
FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow all for authenticated users" 
ON chatbot_contexts 
FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow all for authenticated users" 
ON chatbot_history 
FOR ALL 
TO authenticated 
USING (true);
\`\`\`

**Security Note:** All authenticated users can access all data. Consider restricting to admin role only.

#### Functions & Triggers
-- GUESS (20% confidence) -- No custom functions detected in current scan
**Potential uses:**
- Auto-update timestamps
- Calculate aggregate statistics
- Validate data on insert

---

## Data Flow

### User Course Check Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Homepage
    participant GradeEntry
    participant EligibilityLib
    participant LocalStorage
    participant ResultsPage
    
    User->>Homepage: Visit site
    Homepage->>User: Display course categories
    User->>Homepage: Click "Degree" category
    Homepage->>GradeEntry: Navigate to /input/degree
    GradeEntry->>User: Show grade entry form
    User->>GradeEntry: Enter KCSE grades
    GradeEntry->>GradeEntry: Validate inputs
    GradeEntry->>EligibilityLib: Calculate eligible courses
    EligibilityLib->>LocalStorage: Store results
    EligibilityLib->>ResultsPage: Redirect to /results
    ResultsPage->>LocalStorage: Load results
    ResultsPage->>User: Display eligible courses
\`\`\`

### Payment Processing Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant ResultsPage
    participant PaymentPage
    participant ServerAction
    participant MPesa
    participant LocalStorage
    
    User->>ResultsPage: Click "Export PDF"
    ResultsPage->>LocalStorage: Check payment status
    LocalStorage->>ResultsPage: Status: unpaid
    ResultsPage->>PaymentPage: Redirect to /payment
    PaymentPage->>User: Show payment form
    User->>PaymentPage: Enter phone number
    User->>PaymentPage: Click "Pay Now"
    PaymentPage->>ServerAction: processPayment(phone, amount)
    ServerAction->>MPesa: Initiate STK Push
    MPesa->>User: Phone receives prompt
    User->>MPesa: Enter PIN
    MPesa->>ServerAction: Payment callback
    ServerAction->>PaymentPage: Return success
    PaymentPage->>LocalStorage: Update payment status
    PaymentPage->>ResultsPage: Redirect back
    ResultsPage->>User: PDF export unlocked
\`\`\`

### Admin News Analytics Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant NewsPage
    participant LocalStorage
    participant AdminDashboard
    participant AdminUser
    
    User->>NewsPage: Read article
    User->>NewsPage: Click like button
    NewsPage->>LocalStorage: Store like interaction
    User->>NewsPage: Add comment
    NewsPage->>LocalStorage: Store comment
    
    Note over AdminDashboard: Auto-refresh every 2 seconds
    AdminUser->>AdminDashboard: View /admin/news
    AdminDashboard->>LocalStorage: Read interactions
    LocalStorage->>AdminDashboard: Return likes/comments
    AdminDashboard->>AdminUser: Display real-time stats
\`\`\`

### Chatbot Interaction Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant ChatbotUI
    participant ServerAction
    participant OpenRouter
    participant Supabase
    
    User->>ChatbotUI: Type question
    User->>ChatbotUI: Click send
    ChatbotUI->>Supabase: Get chatbot settings
    ChatbotUI->>Supabase: Get API key
    ChatbotUI->>Supabase: Get training contexts
    ChatbotUI->>ServerAction: Send prompt + context
    ServerAction->>OpenRouter: API request
    OpenRouter->>ServerAction: AI response
    ServerAction->>Supabase: Store in chatbot_history
    ServerAction->>ChatbotUI: Return response
    ChatbotUI->>User: Display message
\`\`\`

---

## Deployment & Environment

### Local Development Setup

**Prerequisites:**
- Node.js 18+ (-- GUESS --)
- npm or pnpm
- Supabase account

**Steps:**

1. **Clone repository**
\`\`\`bash
git clone <repository-url>
cd kuccps-course-checker
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

4. **Set up Supabase database**
\`\`\`bash
# Connect to your Supabase project
# Run the SQL script in Supabase SQL Editor
\`\`\`

Copy contents of `scripts/create-chatbot-tables.sql` and execute in Supabase SQL Editor

5. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

### Environment Variables

**Required:**
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

**Optional:**
\`\`\`env
OPENROUTER_API_KEY=<openrouter-api-key>
MPESA_CONSUMER_KEY=<mpesa-key>  # -- GUESS --
MPESA_CONSUMER_SECRET=<mpesa-secret>  # -- GUESS --
NEXT_PUBLIC_SITE_URL=<production-url>  # -- GUESS --
\`\`\`

### Production Deployment

**Recommended Platform:** Vercel (Next.js native)

**Deployment Steps:**

1. **Connect GitHub repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Set build command:** `npm run build`
4. **Set output directory:** `.next`
5. **Deploy**

**Alternative Platforms:**
- Netlify
- Railway
- Digital Ocean App Platform

### Database Seeding (-- GUESS --)

**Seed command:** (-- Not found --)
**Verification:** Check `package.json` scripts for seed command

**Manual seeding:**
1. Export course data as CSV
2. Import to Supabase via dashboard
3. Verify data with test query

---

## File Structure

### Complete File Index

#### Root Files
- `.gitignore` - Git ignore rules
- `README.md` - Project readme
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Lock file
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `tailwind.config.ts` - Tailwind CSS v4 configuration
- `components.json` - shadcn/ui configuration

#### App Directory (`app/`)

**Layout & Globals:**
- `layout.tsx` - Root layout with header, theme provider, toaster
  - Exports: `RootLayout` component
  - Metadata: Title, description
- `page.tsx` - Homepage with hero, categories, testimonials
  - Exports: `Home` component (default)
- `globals.css` - Global styles, CSS variables, animations
- `not-found.tsx` - 404 error page

**Public Pages:**
- `about/page.tsx` - About the platform (9 lines to export)
- `contact/page.tsx` - Contact form (15 lines to export)
- `faq/page.tsx` - Frequently asked questions (10 lines to export)
- `privacy-policy/page.tsx` - Privacy policy (8 lines to export)
- `terms/page.tsx` - Terms and conditions (8 lines to export)

**Input Pages:**
- `input/[category]/page.tsx` - Dynamic grade entry for all categories (28 lines to export)
  - Handles: degree, diploma, certificate, kmtc, artisan

**Results:**
- `results/page.tsx` - Display eligible courses (40 lines to export)
- `results/loading.tsx` - Loading skeleton

**Payment:**
- `payment/page.tsx` - Payment processing page (23 lines to export)
- `payment/actions.ts` - Server actions for payment

**News:**
- `news/page.tsx` - News listing with search and filters (15 lines to export)
- `news/loading.tsx` - News loading skeleton
- `news/[slug]/page.tsx` - Individual article page (25 lines to export)
- `news/[slug]/loading.tsx` - Article loading skeleton

**Admin:**
- `admin/layout.tsx` - Admin layout with sidebar and topbar
- `admin/login/page.tsx` - Admin authentication (18 lines to export)
- `admin/dashboard/page.tsx` - Admin dashboard overview
- `admin/dashboard/AdminDashboardClient.tsx` - Client component for dashboard
- `admin/dashboard/loading.tsx` - Dashboard loading
- `admin/users/page.tsx` - User management (56 lines to export)
- `admin/users/loading.tsx` - Users loading
- `admin/chatbot/page.tsx` - Chatbot configuration (36 lines to export)
- `admin/chatbot/loading.tsx` - Chatbot loading
- `admin/blog/page.tsx` - Blog management (45 lines to export)
- `admin/blog/loading.tsx` - Blog loading
- `admin/news/page.tsx` - News analytics (18 lines to export)
- `admin/news/loading.tsx` - News analytics loading
- `admin/settings/page.tsx` - General settings (13 lines to export)
- `admin/settings/loading.tsx` - Settings loading
- `admin/analytics/loading.tsx` - Analytics loading
- `admin/blocks/loading.tsx` - Blocks loading
- `admin/short-courses/loading.tsx` - Short courses loading
- `admin/starred/loading.tsx` - Starred loading

#### Components Directory (`components/`)

**Core Components:**
- `header.tsx` - Site navigation header
  - Exports: `Header` (default)
  - Features: Logo, nav links, mode toggle
- `footer.tsx` - Site footer
  - Exports: `Footer` (default)
  - Props: `showOnHomepage?: boolean`
- `animated-background.tsx` - Gradient background animation
  - Exports: `AnimatedBackground` (default)
- `theme-provider.tsx` - Dark mode provider
  - Exports: `ThemeProvider`

**Form Components:**
- `grade-entry-form.tsx` - KCSE grade input form
  - Exports: `GradeEntryForm`
  - Props: `category`, `onSubmit`
- `cluster-weights-form.tsx` - Cluster point calculator
  - Exports: `ClusterWeightsForm`
  - Props: `subjects`, `onCalculate`

**Category Components:**
- `course-category-card.tsx` - Category selection cards
  - Exports: `CourseCategoryCard`
  - Props: `title`, `description`, `icon`, `href`, `colorScheme`

**Processing Animations:**
- `diploma-processing-animation.tsx`
- `certificate-processing-animation.tsx`
- `kmtc-processing-animation.tsx`
- `artisan-processing-animation.tsx`
- `loading-animation.tsx`

**Results Components:**
- `results/course-table.tsx` - Sortable course table
- `results/user-summary.tsx` - User grades summary card
- `results/chatbot-assistant.tsx` - AI chatbot interface
- `results/course-details-modal.tsx` - Course detail popup
- `results-preview.tsx` - Results preview component
- `diploma-results-preview.tsx`
- `certificate-results-preview.tsx`
- `kmtc-results-preview.tsx`
- `artisan-results-preview.tsx`

**UI Feedback:**
- `progress-bar.tsx` - Progress indicator
- `real-time-progress-bar.tsx` - Real-time progress
- `testimonial-card.tsx` - Single testimonial
- `testimonial-carousel.tsx` - Testimonial slider
- `how-it-works-step.tsx` - How it works step card

**Payment:**
- `payment-summary.tsx` - Order summary
- `payment-status.tsx` - Payment confirmation

**Admin Components:**
- `admin/admin-sidebar.tsx` - Admin navigation sidebar
  - Exports: `AdminSidebar`
  - Features: Collapsible, active route highlighting
- `admin/admin-topbar.tsx` - Admin page header
  - Exports: `AdminTopbar`
- `admin/dashboard-stats.tsx` - KPI cards
  - Exports: `DashboardStats`
  - Props: `stats[]`
- `admin/bar-chart.tsx` - Bar chart wrapper
  - Exports: `BarChart`
  - Uses: Recharts
- `admin/pie-chart.tsx` - Pie chart wrapper
  - Exports: `PieChart`
  - Uses: Recharts
- `admin/analytics-chart.tsx` - Analytics visualizations
- `admin/date-range-picker.tsx` - Date range selector
- `admin/recent-activity.tsx` - Activity feed
- `admin/system-alerts.tsx` - System notifications

**UI Components (shadcn/ui - 50+ components):**
- `ui/button.tsx` - Button component
- `ui/input.tsx` - Input field
- `ui/card.tsx` - Card container
- `ui/dialog.tsx` - Modal dialog
- `ui/table.tsx` - Data table
- `ui/tabs.tsx` - Tab navigation
- `ui/switch.tsx` - Toggle switch
- `ui/toast.tsx` - Toast notification
- `ui/toaster.tsx` - Toast container
- `ui/text-type.tsx` - Typing animation component
  - Exports: `TextType`
  - Props: `text[]`, `typingSpeed`, `pauseDuration`, `loop`, `showCursor`
  - CSS: `ui/TextType.css`
- `ui/accordion.tsx`, `ui/alert.tsx`, `ui/avatar.tsx`, `ui/badge.tsx`, `ui/breadcrumb.tsx`, `ui/button-group.tsx`, `ui/calendar.tsx`, `ui/carousel.tsx`, `ui/chart.tsx`, `ui/checkbox.tsx`, `ui/collapsible.tsx`, `ui/command.tsx`, `ui/context-menu.tsx`, `ui/drawer.tsx`, `ui/dropdown-menu.tsx`, `ui/empty.tsx`, `ui/field.tsx`, `ui/form.tsx`, `ui/hover-card.tsx`, `ui/input-group.tsx`, `ui/input-otp.tsx`, `ui/item.tsx`, `ui/kbd.tsx`, `ui/label.tsx`, `ui/menubar.tsx`, `ui/navigation-menu.tsx`, `ui/pagination.tsx`, `ui/popover.tsx`, `ui/progress.tsx`, `ui/radio-group.tsx`, `ui/resizable.tsx`, `ui/scroll-area.tsx`, `ui/select.tsx`, `ui/separator.tsx`, `ui/sheet.tsx`, `ui/sidebar.tsx`, `ui/skeleton.tsx`, `ui/slider.tsx`, `ui/sonner.tsx`, `ui/spinner.tsx`, `ui/textarea.tsx`, `ui/toggle.tsx`, `ui/toggle-group.tsx`, `ui/tooltip.tsx`
- `ui/use-mobile.tsx` - Mobile detection hook
- `ui/use-toast.ts` - Toast hook

#### Library Directory (`lib/`)

**Eligibility Logic:**
- `course-eligibility.ts` - Degree course eligibility calculator
  - Exports: `calculateEligibleCourses(grades, clusterPoints)`
- `diploma-course-eligibility.ts` - Diploma eligibility calculator
  - Exports: `calculateEligibleDiplomaCourses()`
- `certificate-course-eligibility.ts` - Certificate eligibility calculator
  - Exports: `calculateEligibleCertificateCourses()`
- `kmtc-course-eligibility.ts` - KMTC eligibility calculator
  - Exports: `calculateEligibleKMTCCourses()`
- `artisan-course-eligibility.ts` - Artisan eligibility calculator
  - Exports: `calculateEligibleArtisanCourses()`
- `debug-course-eligibility.ts` - Debugging utilities

**Utilities:**
- `grade-utils.ts` - Grade conversion and validation
  - Exports: `convertGradeToPoints()`, `validateGrade()`
- `utils.ts` - General utilities
  - Exports: `cn()` - Tailwind class name merger

**Services:**
- `chatbot-service.ts` - Chatbot API integration
  - Exports: `sendChatMessage()`, `getChatHistory()`
- `supabase.ts` - Supabase client configuration
  - Exports: `supabase`, `testSupabaseConnection()`

**Data:**
- `news-data.ts` - News articles data
  - Exports: `newsArticles[]`
- `mock-data.ts` - Mock data for demos
  - Exports: `testimonials[]` (-- GUESS --)

#### Scripts Directory (`scripts/`)

- `create-chatbot-tables.sql` - Database setup SQL
  - Creates: chatbot_settings, chatbot_api_key, chatbot_contexts, chatbot_history
  - Sets up: RLS policies, storage bucket
- `remove-chatbot-tables.sql` - Database teardown SQL

#### Public Directory (`public/`)

- `icon.svg` - Site favicon
- `placeholder.svg` - Placeholder image generator
- `placeholder.jpg` - Placeholder image
- `placeholder-logo.png` - Placeholder logo
- `placeholder-logo.svg` - Placeholder logo SVG
- `placeholder-user.jpg` - User avatar placeholder
- `images/graduation.svg` - Graduation cap icon

#### Hooks Directory (`hooks/`)

- `use-mobile.ts` - Mobile detection hook
  - Exports: `useMobile()`
- `use-toast.ts` - Toast notification hook
  - Exports: `useToast()`, `toast()`

---

## Testing

### Test Location
-- GUESS (20% confidence) -- No test files found in current scan

**Verification:** Run `find . -name "*.test.ts*"` or `find . -name "*.spec.ts*"`

### Testing Strategy (Recommended)

**Unit Tests:**
- Test eligibility calculators (`lib/*-eligibility.ts`)
- Test grade utilities (`lib/grade-utils.ts`)
- Test utility functions (`lib/utils.ts`)

**Integration Tests:**
- Test form submissions
- Test navigation flows
- Test localStorage persistence

**E2E Tests:**
- Test complete course check flow
- Test payment flow
- Test admin dashboard access

**Recommended Tools:**
- Jest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

### Coverage Notes
-- GUESS -- No coverage reports found

---

## Troubleshooting

### Common Issues

#### 1. Import Error: "AnimatedBackground" module does not provide export
**Cause:** Mixed default and named exports
**Solution:** Use `import AnimatedBackground from '@/components/animated-background'` (default import, no curly braces)

#### 2. Tailwind Error: "Cannot apply unknown utility class `border-border`"
**Cause:** Tailwind CSS v4 requires `--color-` prefix for theme variables
**Solution:** Verify `app/globals.css` has correct `@theme inline` format with `--color-border` variable

#### 3. localStorage is not defined
**Cause:** Attempting to access localStorage in Server Component
**Solution:** Add `"use client"` directive or move localStorage logic to client component

#### 4. Supabase connection fails
**Cause:** Missing or incorrect environment variables
**Solution:** 
- Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Test connection with `testSupabaseConnection()` from `lib/supabase.ts`

#### 5. Chatbot not responding
**Cause:** Missing OpenRouter API key or invalid configuration
**Solution:**
- Add API key in admin chatbot settings
- Verify API key is saved to `chatbot_api_key` table
- Check OpenRouter dashboard for API limits

#### 6. Payment not processing
**Cause:** -- GUESS -- M-Pesa integration not configured
**Solution:**
- Verify M-Pesa credentials in environment variables
- Check server action logs for errors
- Test with M-Pesa sandbox first

#### 7. Admin sidebar not showing on mobile
**Cause:** Sidebar hidden by default on small screens
**Solution:** Click the menu/hamburger icon to toggle sidebar visibility

#### 8. PDF export not working
**Cause:** Payment status not persisted
**Solution:**
- Check localStorage for `paymentStatus` key
- Verify payment flow completes successfully
- Clear localStorage and retry payment

### Performance Tips

1. **Optimize Images:** Use Next.js Image component for all images
2. **Code Splitting:** Lazy load heavy components with `React.lazy()` and `Suspense`
3. **Reduce Bundle Size:** Analyze with `@next/bundle-analyzer`
4. **Cache API Responses:** Use SWR or React Query for data fetching
5. **Optimize Animations:** Use CSS transforms instead of layout properties

### Debugging

**Enable Debug Logs:**
\`\`\`javascript
console.log("[v0] Debug message")
\`\`\`

**Check Browser Console:** F12 → Console tab
**Check Network Tab:** F12 → Network tab to inspect API calls
**React DevTools:** Install browser extension for component inspection

---

## Security & Privacy

### Data Retention
-- GUESS (40% confidence) --
- **User grades:** Stored in localStorage (client-side only)
- **Chat history:** Stored in `chatbot_history` table indefinitely
- **Comments/Likes:** Stored in localStorage (not persisted to database)

**Recommendation:** Implement data retention policy to delete old chat history

### PII Handling
**Personal Information Collected:**
- User email (chatbot history) (-- GUESS --)
- User name (chatbot history) (-- GUESS --)
- Phone number (payment processing)
- KCSE grades (not stored server-side)

**Security Measures:**
- HTTPS encryption for all connections
- Supabase Row Level Security (RLS) enabled
- Environment variables for sensitive keys
- Client-side storage for sensitive grade data

### Kenyan Data Protection Laws
-- GUESS (30% confidence) --
**Relevant Laws:**
- Data Protection Act, 2019
- Kenya Information and Communications Act

**Compliance Requirements:**
- User consent for data collection
- Data processing transparency
- Right to access and delete personal data
- Data breach notification

**Recommendation:** Add explicit consent checkboxes and privacy policy links

### API Key Management

**How to Revoke API Keys:**

1. **Supabase:**
   - Go to Supabase dashboard
   - Project Settings → API
   - Generate new keys
   - Update environment variables
   - Redeploy application

2. **OpenRouter:**
   - Go to OpenRouter dashboard
   - Delete old key
   - Generate new key
   - Update in admin chatbot settings

**Secret Rotation Schedule:**
- Quarterly rotation recommended
- Immediate rotation if compromised

---

## Roadmap & TODOs

### High Priority (Next Sprint)

1. **Implement Real Database for News Engagement** (Complexity: Medium)
   - **Files to modify:** 
     - Create `app/api/news/route.ts` for API endpoints
     - Update `app/news/[slug]/page.tsx` to use API instead of localStorage
     - Update `app/admin/news/page.tsx` to fetch from database
   - **Database:**
     - Create `news_likes` table
     - Create `news_comments` table
   - **Estimated Time:** 4-6 hours

2. **Add Real Authentication for Admin** (Complexity: High)
   - **Files to modify:**
     - `app/admin/login/page.tsx` - Implement Supabase auth
     - `app/admin/layout.tsx` - Add auth check
     - Create `middleware.ts` for route protection
   - **Database:**
     - Use Supabase auth.users
     - Create `admin_users` table for role management
   - **Estimated Time:** 6-8 hours

3. **Implement M-Pesa Payment Integration** (Complexity: High)
   - **Files to modify:**
     - `app/payment/actions.ts` - Add M-Pesa Daraja API calls
     - Create `app/api/mpesa/callback/route.ts` for webhooks
   - **Environment Variables:**
     - `MPESA_CONSUMER_KEY`
     - `MPESA_CONSUMER_SECRET`
     - `MPESA_SHORTCODE`
   - **Estimated Time:** 8-10 hours

### Medium Priority (Next Month)

4. **Add PDF Export Functionality** (Complexity: Medium)
   - **Files to modify:**
     - Create `lib/pdf-generator.ts` using jsPDF or similar
     - Update `app/results/page.tsx` to trigger PDF generation
   - **Dependencies:** Add `jspdf` or `react-pdf`
   - **Estimated Time:** 4-5 hours

5. **Implement Course Database Sync** (Complexity: High)
   - **Files to modify:**
     - All `lib/*-eligibility.ts` files to fetch from database
     - Create seed scripts for course data
   - **Database:**
     - Create tables: `degree_programmes`, `diploma_programmes`, etc.
     - Import official KUCCPS data
   - **Estimated Time:** 10-12 hours

6. **Add User Account System** (Complexity: High)
   - **Files to modify:**
     - Create `app/login/page.tsx`
     - Create `app/register/page.tsx`
     - Create `app/profile/page.tsx`
     - Update header with auth state
   - **Features:**
     - Save search history
     - Favorite courses
     - Multiple grade entries
   - **Estimated Time:** 12-15 hours

### Low Priority (Future)

7. **Implement Short Courses Feature** (Complexity: Medium)
   - Currently shows "Coming Soon"
   - **Files to create:**
     - `app/input/short-courses/page.tsx`
     - `lib/short-courses-eligibility.ts`
   - **Estimated Time:** 6-8 hours

8. **Add Data Bundles Purchase Feature** (Complexity: High)
   - Currently shows "Coming Soon"
   - **Integration:** Safaricom API
   - **Estimated Time:** 15-20 hours

9. **Add Analytics Dashboard** (Complexity: Medium)
   - Track user engagement
   - Popular courses
   - Conversion rates
   - **Tools:** Google Analytics or Mixpanel integration
   - **Estimated Time:** 6-8 hours

10. **Implement Automated Testing** (Complexity: High)
    - Unit tests for eligibility calculators
    - Integration tests for forms
    - E2E tests for critical flows
    - **Tools:** Jest, React Testing Library, Playwright
    - **Estimated Time:** 20-25 hours

11. **Add Social Sharing** (Complexity: Low)
    - Share results on social media
    - Share news articles
    - **Files to modify:**
      - `app/results/page.tsx`
      - `app/news/[slug]/page.tsx`
    - **Estimated Time:** 3-4 hours

12. **Implement Search Autocomplete** (Complexity: Medium)
    - Course name suggestions
    - Institution suggestions
    - **Files to modify:**
      - `app/results/page.tsx`
      - `app/news/page.tsx`
    - **Estimated Time:** 4-6 hours

### Performance Optimizations

13. **Implement Image Optimization** (Complexity: Low)
    - Replace `<img>` with Next.js `<Image>`
    - Add proper sizing and formats
    - **Estimated Time:** 2-3 hours

14. **Add Service Worker for Offline Support** (Complexity: Medium)
    - Cache static assets
    - Offline-first approach
    - **Estimated Time:** 8-10 hours

15. **Optimize Bundle Size** (Complexity: Medium)
    - Code splitting
    - Tree shaking
    - Lazy loading
    - **Estimated Time:** 6-8 hours

---

## Verification Checklist

Before proceeding with development, verify the following:

### Code Verification
- [ ] Run `grep -r "degree_programmes" .` to confirm database table names
- [ ] Check `package.json` for exact dependency versions
- [ ] Verify `middleware.ts` exists for auth protection
- [ ] Confirm M-Pesa integration in `app/payment/actions.ts`
- [ ] Check for test files: `find . -name "*.test.ts*"`
- [ ] Verify Supabase connection: Run `testSupabaseConnection()` function
- [ ] Check admin authentication implementation in `app/admin/layout.tsx`

### Database Verification
- [ ] Connect to Supabase and run `\dt` to list all tables
- [ ] Verify course tables exist: `degree_programmes`, `diploma_programmes`, etc.
- [ ] Check RLS policies: `SELECT * FROM pg_policies`
- [ ] Verify storage buckets: Check Supabase Storage dashboard
- [ ] Confirm chatbot tables exist with `SELECT * FROM chatbot_settings`

### Environment Verification
- [ ] Confirm all required environment variables are set
- [ ] Test Supabase connection from local environment
- [ ] Verify OpenRouter API key works (make test request)
- [ ] Check M-Pesa credentials validity (if implemented)
- [ ] Test payment callback webhook (if implemented)

### Functionality Verification
- [ ] Complete a course check flow from start to finish
- [ ] Test PDF export (verify payment requirement)
- [ ] Test chatbot interaction
- [ ] Test news like/comment functionality
- [ ] Verify admin dashboard displays correct data
- [ ] Test responsive design on mobile device

### Security Verification
- [ ] Verify RLS policies are enabled on all tables
- [ ] Check that admin routes are protected
- [ ] Confirm API keys are not exposed in client-side code
- [ ] Test authentication flow (if implemented)
- [ ] Verify HTTPS is enforced in production

---

## Contact & Ownership

### Code Owners
-- GUESS (10% confidence) -- No CODEOWNERS file found

**Recommendation:** Create `.github/CODEOWNERS` file with module ownership

### Maintainers
**Primary Maintainer:** [To be filled]
**Contact:** [To be filled]

### Escalation Path
1. Check this documentation
2. Review code comments
3. Check GitHub issues
4. Contact primary maintainer
5. Escalate to project owner

---

## Changelog Stub

See `CHANGELOG.md` for release history and version notes.

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Maintained By:** Development Team
**Status:** Living Document - Update as code evolves

---

*End of Documentation*
