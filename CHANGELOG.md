# Changelog

All notable changes to the KUCCPS Course Checker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real database integration for news engagement (likes/comments)
- Admin authentication with Supabase Auth
- M-Pesa payment processing integration
- PDF export functionality
- User account system
- Course database sync with official KUCCPS data

## [1.0.0] - 2024-12-XX

### Added
- Homepage with animated hero section and course categories
- Grade entry forms for 5 course categories (Degree, Diploma, Certificate, KMTC, Artisan)
- Course eligibility calculator using official KUCCPS formulas
- Results page with filtering, searching, and sorting
- Payment page for PDF export feature
- News section with articles, likes, and comments
- Admin dashboard with statistics and analytics
- Admin chatbot configuration page
- Admin news analytics with real-time engagement tracking
- Admin settings page with payment toggle
- Responsive design for mobile and desktop
- Dark mode support
- Animated gradient backgrounds
- TextType component with GSAP typing animations
- Testimonial carousel
- FAQ page
- Contact page
- About page
- Privacy policy and terms pages

### Technical
- Next.js 15.2.4 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4.1.9
- shadcn/ui component library
- Supabase for database and authentication
- OpenRouter API integration for chatbot
- Framer Motion animations
- GSAP for advanced animations
- localStorage for client-side data persistence

### Database
- Created chatbot tables (settings, api_key, contexts, history)
- Set up Row Level Security (RLS) policies
- Created storage bucket for training data

## Template for Future Releases

\`\`\`markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features and functionality

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements and vulnerability patches

### Performance
- Performance improvements and optimizations

### Database
- Database schema changes and migrations

### API
- API changes and new endpoints

### Documentation
- Documentation updates and improvements
\`\`\`

## How to Use This Changelog

### For Developers
1. **Before starting work:** Check [Unreleased] section for planned features
2. **When making changes:** Add your changes under [Unreleased]
3. **When releasing:** Move [Unreleased] items to a new version section
4. **Use semantic versioning:**
   - MAJOR version (X.0.0) for incompatible API changes
   - MINOR version (0.X.0) for new functionality in a backwards compatible manner
   - PATCH version (0.0.X) for backwards compatible bug fixes

### Categories Guide
- **Added:** New features
- **Changed:** Changes in existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Now removed features
- **Fixed:** Any bug fixes
- **Security:** Vulnerability fixes
- **Performance:** Performance improvements
- **Database:** Database schema changes
- **API:** API changes
- **Documentation:** Documentation changes

### Example Entry

\`\`\`markdown
## [1.1.0] - 2024-01-15

### Added
- User authentication with email/password
- Save search history feature
- Export results to PDF (implemented M-Pesa integration)
- Social sharing buttons for results

### Changed
- Updated course eligibility calculator to match KUCCPS 2024 formulas
- Improved mobile navigation UI

### Fixed
- Fixed bug where diploma courses were not filtering correctly
- Resolved admin sidebar collapse issue on mobile

### Database
- Added `users` table for authentication
- Added `search_history` table for storing user searches
- Migration: `20240115_add_user_tables.sql`

### Performance
- Reduced homepage load time by 40% with image optimization
- Implemented lazy loading for course category cards

### Security
- Enabled RLS on all user-related tables
- Added rate limiting to payment endpoints
\`\`\`

---

**Maintainers:** Please keep this file updated with every release.

**Contributors:** When submitting PRs, add your changes under [Unreleased].

---

*Last Updated: December 2024*
