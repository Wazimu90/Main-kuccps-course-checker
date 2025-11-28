# KUCCPS Course Checker - Architecture Documentation

## System Overview

\`\`\`mermaid
graph TB
    User[User Browser]
    Admin[Admin Browser]
    NextJS[Next.js Application]
    Supabase[Supabase PostgreSQL]
    OpenRouter[OpenRouter API]
    MPesa[M-Pesa API]
    
    User --> NextJS
    Admin --> NextJS
    NextJS --> Supabase
    NextJS --> OpenRouter
    NextJS --> MPesa
    
    subgraph "Frontend"
        NextJS
    end
    
    subgraph "Backend Services"
        Supabase
        OpenRouter
        MPesa
    end
    
    subgraph "Client Storage"
        LocalStorage[localStorage]
    end
    
    User --> LocalStorage
    Admin --> LocalStorage
\`\`\`

## Technology Stack

### Frontend
- **Framework:** Next.js 15.2.4 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4.1.9
- **Component Library:** shadcn/ui (Radix UI primitives)
- **Animation:** Framer Motion, GSAP
- **State Management:** React Hooks + localStorage
- **Form Handling:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js (Next.js Server)
- **API Pattern:** Server Actions + Route Handlers
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (-- GUESS --)
- **File Storage:** Supabase Storage

### Third-Party Integrations
- **AI Chatbot:** OpenRouter API
- **Payment:** M-Pesa Daraja API (-- GUESS --)
- **Analytics:** Vercel Analytics

---

## High-Level Architecture

### Component Layers

\`\`\`mermaid
graph TD
    A[Presentation Layer] --> B[Business Logic Layer]
    B --> C[Data Access Layer]
    C --> D[External Services]
    
    A1[Pages/Components] --> A
    A2[UI Components] --> A
    
    B1[Eligibility Calculators] --> B
    B2[Validation Logic] --> B
    B3[Server Actions] --> B
    
    C1[Supabase Client] --> C
    C2[localStorage] --> C
    
    D1[Supabase Database] --> D
    D2[OpenRouter API] --> D
    D3[M-Pesa API] --> D
\`\`\`

**Layer Responsibilities:**

1. **Presentation Layer**
   - User interface rendering
   - User input handling
   - Visual feedback
   - Navigation

2. **Business Logic Layer**
   - Course eligibility calculations
   - Grade validation
   - Payment processing
   - Chatbot response generation

3. **Data Access Layer**
   - Database queries
   - localStorage management
   - API calls
   - Data transformation

4. **External Services**
   - Persistent data storage
   - AI model inference
   - Payment gateway
   - Authentication

---

## Sequence Diagrams

### 1. Course Check Flow

\`\`\`mermaid
sequenceDiagram
    actor User
    participant Browser
    participant GradeEntry as Grade Entry Page
    participant Validator
    participant Calculator as Eligibility Calculator
    participant Storage as localStorage
    participant Results as Results Page
    
    User->>Browser: Navigate to category
    Browser->>GradeEntry: Load /input/[category]
    GradeEntry->>User: Display form
    
    User->>GradeEntry: Enter KCSE grades
    GradeEntry->>Validator: Validate inputs
    
    alt Invalid Input
        Validator-->>GradeEntry: Validation errors
        GradeEntry-->>User: Show error messages
    else Valid Input
        Validator-->>GradeEntry: Valid
        User->>GradeEntry: Click "Check Courses"
        GradeEntry->>GradeEntry: Show processing animation
        GradeEntry->>Calculator: Calculate eligibility
        
        Calculator->>Calculator: Apply cluster formulas
        Calculator->>Calculator: Filter eligible courses
        Calculator->>Calculator: Sort by points
        
        Calculator-->>Storage: Store results + grades
        Calculator-->>Results: Redirect to /results
        
        Results->>Storage: Load results
        Storage-->>Results: Return data
        Results->>User: Display eligible courses
    end
\`\`\`

### 2. Payment Processing Flow

\`\`\`mermaid
sequenceDiagram
    actor User
    participant Results as Results Page
    participant Payment as Payment Page
    participant ServerAction
    participant MPesa as M-Pesa API
    participant Storage as localStorage
    
    User->>Results: Click "Export PDF"
    Results->>Storage: Check payment status
    Storage-->>Results: Status: unpaid
    
    Results->>Payment: Redirect to /payment
    Payment->>User: Show payment form
    
    User->>Payment: Enter phone number
    User->>Payment: Click "Pay Now"
    
    Payment->>ServerAction: processPayment(phone, amount)
    ServerAction->>MPesa: Initiate STK Push
    MPesa->>User: STK Push prompt
    
    User->>MPesa: Enter M-Pesa PIN
    MPesa->>MPesa: Process payment
    
    alt Payment Successful
        MPesa-->>ServerAction: Payment callback (success)
        ServerAction-->>Payment: Return { success: true, transactionId }
        Payment->>Storage: Save payment status + transactionId
        Payment->>Results: Redirect to /results
        Results->>User: PDF export unlocked
    else Payment Failed
        MPesa-->>ServerAction: Payment callback (failed)
        ServerAction-->>Payment: Return { success: false, error }
        Payment->>User: Show error message
    end
\`\`\`

### 3. Chatbot Interaction Flow

\`\`\`mermaid
sequenceDiagram
    actor User
    participant Chatbot as Chatbot UI
    participant Results as Results Page
    participant Server as Server Action
    participant Supabase
    participant OpenRouter
    
    User->>Results: Open chatbot
    Results->>Chatbot: Initialize chatbot
    
    Chatbot->>Supabase: Get chatbot settings
    Supabase-->>Chatbot: Settings (model, temperature, etc.)
    
    Chatbot->>Supabase: Get API key
    Supabase-->>Chatbot: OpenRouter key
    
    Chatbot->>Supabase: Get training contexts
    Supabase-->>Chatbot: Context files
    
    User->>Chatbot: Type message
    User->>Chatbot: Send
    
    Chatbot->>Server: Send prompt + context + user grades
    Server->>OpenRouter: POST /api/v1/chat/completions
    
    Note over OpenRouter: Generate AI response<br/>using context + user data
    
    OpenRouter-->>Server: AI response
    Server->>Supabase: Store in chatbot_history
    Server-->>Chatbot: Return response
    
    Chatbot->>User: Display AI message
\`\`\`

### 4. Admin News Analytics Flow

\`\`\`mermaid
sequenceDiagram
    actor Admin
    participant Dashboard as Admin Dashboard
    participant Storage as localStorage
    participant Timer
    
    Admin->>Dashboard: Navigate to /admin/news
    Dashboard->>Storage: Load all news interactions
    Storage-->>Dashboard: Return likes + comments
    
    Dashboard->>Dashboard: Calculate total likes
    Dashboard->>Dashboard: Calculate total comments
    Dashboard->>Dashboard: Calculate engagement rate
    Dashboard->>Dashboard: Format timestamps
    
    Dashboard->>Admin: Display analytics
    
    Note over Timer: Auto-refresh every 2 seconds
    
    loop Every 2 seconds
        Timer->>Dashboard: Trigger refresh
        Dashboard->>Storage: Reload interactions
        Storage-->>Dashboard: Updated data
        Dashboard->>Admin: Update display
    end
    
    alt Admin changes tab
        Admin->>Dashboard: Click "Comments" tab
        Dashboard->>Dashboard: Filter to show comments only
        Dashboard->>Admin: Display comments list
    else Admin clicks "Likes" tab
        Admin->>Dashboard: Click "Likes" tab
        Dashboard->>Dashboard: Filter to show likes only
        Dashboard->>Admin: Display likes list
    end
\`\`\`

### 5. Admin Chatbot Configuration Flow

\`\`\`mermaid
sequenceDiagram
    actor Admin
    participant Settings as Chatbot Settings Page
    participant FileUpload
    participant Supabase
    participant Storage as Supabase Storage
    
    Admin->>Settings: Navigate to /admin/chatbot
    Settings->>Supabase: Load current settings
    Supabase-->>Settings: Settings + API key
    Settings->>Admin: Display configuration
    
    alt Upload Training Data
        Admin->>Settings: Click "Upload File"
        Settings->>FileUpload: Open file picker
        Admin->>FileUpload: Select .txt file
        FileUpload->>Settings: Validate file type
        
        alt Valid File
            Settings->>Storage: Upload to chatbot-contexts bucket
            Storage-->>Settings: File URL
            Settings->>Supabase: INSERT into chatbot_contexts
            Settings->>Admin: Show success + file info
        else Invalid File
            Settings->>Admin: Show error "Must be .txt file"
        end
    else Update API Key
        Admin->>Settings: Enter OpenRouter API key
        Admin->>Settings: Click "Save"
        Settings->>Supabase: UPDATE chatbot_api_key
        Supabase-->>Settings: Success
        Settings->>Admin: Show success message
    end
\`\`\`

---

## Data Flow Architecture

### User-Facing Data Flow

\`\`\`mermaid
graph LR
    A[User Input] --> B[Validation]
    B --> C[Business Logic]
    C --> D[localStorage]
    D --> E[Results Display]
    
    style A fill:#e1f5ff
    style E fill:#e1f5ff
\`\`\`

**Key Characteristics:**
- Client-side only (no server persistence for user data)
- Fast response times
- Privacy-focused (data stays in browser)
- Offline-capable

### Admin Data Flow

\`\`\`mermaid
graph LR
    A[Admin Input] --> B[Server Action]
    B --> C[Supabase Database]
    C --> D[Query Results]
    D --> E[Admin Dashboard]
    
    style A fill:#ffe1e1
    style E fill:#ffe1e1
\`\`\`

**Key Characteristics:**
- Server-side persistence
- Real-time updates
- Authentication required
- Centralized data management

### Chatbot Data Flow

\`\`\`mermaid
graph TB
    A[User Message] --> B[Context Builder]
    C[Training Data] --> B
    D[User Grades] --> B
    E[Eligible Courses] --> B
    
    B --> F[OpenRouter API]
    F --> G[AI Response]
    G --> H[Supabase History]
    G --> I[User Display]
    
    style A fill:#e1f5ff
    style I fill:#e1f5ff
\`\`\`

**Key Characteristics:**
- Combines multiple data sources
- Persistent conversation history
- Context-aware responses
- Real-time interaction

---

## Security Architecture

### Authentication Flow (-- GUESS --)

\`\`\`mermaid
sequenceDiagram
    actor Admin
    participant Login as Login Page
    participant Supabase as Supabase Auth
    participant Layout as Admin Layout
    
    Admin->>Login: Enter credentials
    Login->>Supabase: signIn(email, password)
    
    alt Valid Credentials
        Supabase-->>Login: Return session token
        Login->>Layout: Redirect to /admin/dashboard
        Layout->>Supabase: Verify session
        Supabase-->>Layout: Session valid
        Layout->>Admin: Show dashboard
    else Invalid Credentials
        Supabase-->>Login: Authentication error
        Login->>Admin: Show error message
    end
\`\`\`

### Row Level Security (RLS) Policies

**Chatbot Tables:**
\`\`\`sql
-- All chatbot tables have the same policy
CREATE POLICY "Allow all for authenticated users"
ON chatbot_settings
FOR ALL
TO authenticated
USING (true);
\`\`\`

**Security Considerations:**
- All authenticated users can access all data
- No role-based restrictions
- **Recommendation:** Implement admin role check

### API Key Storage

**Supabase:**
- Stored in environment variables
- Public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) exposed to client
- Service key kept server-side only

**OpenRouter:**
- Stored in `chatbot_api_key` table
- Accessed only by server actions
- Never exposed to client

**M-Pesa (-- GUESS --):**
- Consumer key/secret in environment variables
- Server-side only
- Never exposed to client

---

## Scalability Considerations

### Current Limitations

1. **localStorage for User Data**
   - Limited to ~10MB per domain
   - Not shared across devices
   - Lost if browser cache cleared
   
2. **Client-Side Calculations**
   - CPU-intensive for large datasets
   - Can't be cached across users
   - Repetitive computation
   
3. **No CDN for Static Assets**
   - All assets served from origin
   - Higher latency for global users
   
4. **No Database Connection Pooling (-- GUESS --)**
   - Each request creates new connection
   - Potential bottleneck under load

### Scaling Recommendations

**Short-term (< 10,000 active users):**
- Current architecture sufficient
- Monitor localStorage limits
- Implement error tracking (Sentry)

**Medium-term (10,000 - 100,000 users):**
- Move course data to database
- Implement Redis caching layer
- Add CDN for static assets
- Implement user accounts

**Long-term (100,000+ users):**
- Microservices architecture
- Separate API server
- Database read replicas
- Elasticsearch for course search
- Queue system for background jobs

---

## Deployment Architecture

### Vercel Deployment

\`\`\`mermaid
graph TB
    Git[GitHub Repository]
    Vercel[Vercel Platform]
    Edge[Vercel Edge Network]
    User[Users]
    
    Git -->|Push| Vercel
    Vercel -->|Deploy| Edge
    Edge -->|Serve| User
    
    Vercel -->|Connect| Supabase[Supabase Cloud]
    Vercel -->|API Calls| OpenRouter[OpenRouter]
    
    style Vercel fill:#000,stroke:#fff,color:#fff
    style Git fill:#f05032,stroke:#fff,color:#fff
\`\`\`

**Deployment Process:**
1. Code pushed to GitHub
2. Vercel detects commit
3. Runs build: `npm run build`
4. Deploys to edge network
5. Assigns preview URL (for branches)
6. Production deployment on main branch

**Environment:**
- **Region:** Auto (Vercel selects optimal)
- **Node Version:** 18+ (-- GUESS --)
- **Build Time:** ~2-3 minutes
- **Cold Start:** <1 second

---

## Monitoring & Observability (-- GUESS --)

### Recommended Monitoring Stack

**Application Monitoring:**
- Vercel Analytics (included)
- Error tracking: Sentry
- Performance: Web Vitals

**Database Monitoring:**
- Supabase Dashboard (query performance)
- Connection pool metrics
- Slow query log

**User Behavior:**
- Google Analytics or Mixpanel
- Conversion funnels
- Feature usage tracking

**Alerts:**
- Error rate > 5%
- Response time > 3 seconds
- Database connection failures
- Payment processing failures

---

## Disaster Recovery

### Backup Strategy (-- GUESS --)

**Database:**
- Supabase automatic daily backups
- Point-in-time recovery available
- Retention: 7 days (depends on plan)

**User Data:**
- localStorage only (user responsible)
- Recommendation: Implement server-side backup

**Code:**
- GitHub repository (source of truth)
- All commits preserved
- Branch protection enabled

### Recovery Procedures

**Database Failure:**
1. Switch to Supabase backup
2. Restore to last known good state
3. Replay transactions if available

**Application Failure:**
1. Rollback to previous Vercel deployment
2. Fix issue in code
3. Redeploy

**Data Loss:**
- User data: Cannot be recovered (localStorage)
- Admin data: Restore from Supabase backup

---

**Document Version:** 1.0
**Last Updated:** December 2024

*End of Architecture Documentation*
