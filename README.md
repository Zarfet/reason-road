# NEXUS — Interface Paradigm Assessment Tool

> Evidence-based DIKW assessment tool for interface paradigm selection.  
> Research project from the **Universitat Politècnica de Catalunya (UPC)** — Master in Advanced Studies in Design.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Scoring Algorithm](#scoring-algorithm)
5. [Database Schema](#database-schema)
6. [Edge Functions (AI)](#edge-functions-ai)
7. [Authentication & Security](#authentication--security)
8. [Project Structure](#project-structure)
9. [Manual Installation](#manual-installation)
10. [Environment Variables](#environment-variables)
11. [Available Scripts](#available-scripts)

---

## Overview

NEXUS guides users through an 11-step assessment wizard that collects data about their project context, user demographics, task characteristics, and design values. A weighted scoring algorithm then recommends one of five interface paradigms:

| Paradigm | Description |
|---|---|
| **Traditional Screen** | Mobile/desktop screens with visual UI elements |
| **Invisible/Ambient** | Background automation with minimal user interaction |
| **AI Vectorial** | AI-powered search, generation, and intelligent assistance |
| **Spatial (AR/VR)** | Augmented or Virtual Reality experiences |
| **Voice** | Voice-first interfaces and conversational AI |

### User Flow

```
Landing → Auth → Assessment Wizard (11 steps) → Results (5 tabs) → Save/Share/PDF
```

**Routes:**

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth` | Public | Login / Sign up |
| `/assessment` | Protected | 11-step wizard |
| `/results` | Protected | Live results from current session |
| `/results/:id` | Protected | Saved assessment results |
| `/shared/:token` | Public | Shared read-only results |
| `/profile` | Protected | User profile |
| `/analytics` | Protected + Admin | Admin analytics dashboard |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  React 18 + TypeScript + Tailwind + shadcn/ui    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Wizard   │  │ Scoring  │  │ Results Tabs  │  │
│  │ (11 steps│  │ Engine   │  │ (5 views)     │  │
│  │  + state)│  │ (client) │  │               │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              Lovable Cloud (Supabase)            │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Auth     │  │ Database │  │ Edge Functions │  │
│  │ (email)  │  │ (Postgres│  │ (Deno/AI)     │  │
│  │          │  │  + RLS)  │  │               │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with lazy-loaded routes |
| **TypeScript** | Type safety across the codebase |
| **Vite 5** | Build tool with SWC plugin |
| **Tailwind CSS 3** | Utility-first styling with semantic design tokens |
| **shadcn/ui** | Component library (Radix primitives + Tailwind) |
| **React Router 6** | Client-side routing with protected routes |
| **React Query 5** | Server state management and caching |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Charts in admin analytics dashboard |
| **jsPDF** | Client-side PDF generation of results |
| **@dnd-kit** | Drag-and-drop for values ranking step |
| **Zod** | Input validation schemas |
| **React Hook Form** | Form state management |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|---|---|
| **PostgreSQL** | Database with Row Level Security (RLS) |
| **Supabase Auth** | Email-based authentication |
| **Edge Functions (Deno)** | Serverless AI-powered endpoints |
| **Lovable AI Gateway** | Gemini API proxy (no API key needed) |

### Testing

| Technology | Purpose |
|---|---|
| **Vitest** | Unit test runner |
| **Testing Library** | React component testing |
| **jsdom** | Browser environment for tests |

---

## Scoring Algorithm

**File:** `src/lib/scoring.ts` (661 lines, heavily documented)

The algorithm uses **11 weighted question categories** to score each paradigm. Weights total 105% before normalization:

| Category | Weight | Source |
|---|---|---|
| Design Values Ranking | 30% | Step 1 — drag-to-rank 5 values |
| Task Complexity | 12% | Simple / Medium / Complex |
| Frequency of Use | 10% | Daily → Rarely |
| Predictability | 10% | Identical → Always different |
| Context of Use | 10% | Desktop / Mobile / Hands-free / Social |
| Information Type | 10% | Structured / Unstructured / Visual / Spatial |
| User Demographics | 8% | Free-text parsed with regex |
| Exploration Mode | 5% | Browse / Targeted / Mixed |
| Error Consequence | 5% | Trivial / Annoying / Serious |
| Control Preference | 3% | Automatic / Supervised / Full control |
| Geography | 2% | Europe / US / Global / Internal |

### Demographics Parsing

The `userDemographics` free-text field is parsed via regex to detect:

- **Age signals:** elderly, teen, senior → adjusts Spatial (-0.12 for elderly), Voice (+0.08)
- **Tech literacy:** beginner, expert → adjusts Traditional (+0.08 for low literacy)
- **Accessibility:** blind, visual impairment → Voice gets critical +0.12 boost
- **Profession:** healthcare, developer → domain-specific adjustments

### Output

```typescript
interface RecommendationResult {
  primary:   { paradigm: string; pct: number };  // Top recommendation
  secondary: { paradigm: string; pct: number };  // Runner-up
  tertiary:  { paradigm: string; pct: number };  // Third option
  avoid:     [string, number][];                  // Paradigms to avoid
  allScores: ParadigmPercentages;                 // All 5 as percentages (sum = 100%)
}
```

### Supporting Modules

| File | Purpose |
|---|---|
| `src/lib/contradictionDetector.ts` | Detects conflicting answers (e.g., "full control" + "automatic") |
| `src/lib/redFlagsDetector.ts` | Identifies potential risks in the recommendation |
| `src/lib/argumentsGenerator.ts` | Generates structured arguments for/against each paradigm |
| `src/lib/regulatoryAnalysis.ts` | EU AI Act / GDPR / ADA compliance checks |
| `src/lib/sustainabilityAnalysis.ts` | Environmental impact analysis per paradigm |
| `src/lib/citations.ts` | Static database of peer-reviewed HCI citations |
| `src/lib/pdfGenerator.ts` | Generates downloadable PDF report |

---

## Database Schema

### Tables

#### `assessments`
Stores completed assessment data and results.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid | Owner (references auth.users) |
| `responses` | jsonb | Raw wizard answers |
| `paradigm_results` | jsonb | Computed scores |
| `is_completed` | boolean | Completion flag |
| `share_token` | uuid | Public sharing token (nullable) |
| `time_to_complete_seconds` | integer | Duration tracking |
| `pdf_downloaded` | boolean | PDF export tracking |
| `agreement_rating` | integer | Quick agreement score |
| `created_at` / `updated_at` | timestamptz | Timestamps |

#### `assessment_ratings`
Detailed user feedback on results quality.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `assessment_id` | uuid (FK) | One-to-one with assessments |
| `user_id` | uuid | Rater |
| `rating` | integer (1-5) | Overall rating |
| `accuracy_rating` | integer (1-5) | Accuracy sub-score |
| `clarity_rating` | integer (1-5) | Clarity sub-score |
| `usefulness_rating` | integer (1-5) | Usefulness sub-score |
| `would_recommend` | boolean | NPS-style recommendation |
| `feedback_text` | text | Free-text feedback (sanitized) |

#### `profiles`
User profile data (auto-created on signup via trigger).

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Same as auth.users.id |
| `email` | text | User email |
| `full_name` | text | Display name |
| `avatar_url` | text | Avatar URL |

#### `user_roles`
Role-based access control (separate from profiles for security).

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References auth.users |
| `role` | app_role enum | `'admin'` or `'user'` |

### Database Functions

| Function | Type | Purpose |
|---|---|---|
| `has_role(_user_id, _role)` | SECURITY DEFINER | Check user role without RLS recursion |
| `handle_new_user()` | SECURITY DEFINER | Trigger: creates profile on signup |
| `validate_rating_values()` | Trigger | Validates rating values (1-5 range) |
| `update_updated_at_column()` | Trigger | Auto-updates `updated_at` timestamps |

---

## Edge Functions (AI)

Two serverless functions use the **Lovable AI Gateway** (Gemini) to generate contextual research evidence:

### `research-papers`
Generates 5 relevant academic papers supporting the recommended paradigm.

- **Auth:** Manual JWT validation via `getClaims()`
- **Input validation:** Paradigm must match whitelist; demographics capped at 500 chars
- **Sanitization:** Newlines stripped to prevent prompt injection
- **Model:** `google/gemini-3-flash-preview`

### `case-studies`
Generates real-world case studies for the recommended paradigm.

- Same security pattern as `research-papers`
- Returns structured JSON with company, industry, outcomes

Both functions are configured with `verify_jwt = false` in `supabase/config.toml` to allow custom error handling, but enforce authentication manually in code.

---

## Authentication & Security

### Auth Flow
1. Email + password signup (email confirmation required)
2. Profile auto-created via `handle_new_user()` trigger
3. Sessions managed by Supabase Auth (localStorage, auto-refresh)

### Row Level Security (RLS)
All tables have RLS enabled with 18 policies:

- **Users:** Can CRUD their own data only (`auth.uid() = user_id`)
- **Admins:** Can view/delete all assessments and ratings via `has_role()` function
- **Public:** Can view shared assessments (when `share_token IS NOT NULL`)

### Admin Access
- Roles stored in separate `user_roles` table (not in profiles)
- Checked via `has_role()` SECURITY DEFINER function
- Client-side: `useAdmin()` hook for UI gating
- Server-side: RLS policies enforce actual data access

### Input Sanitization
- `RatingCard`: HTML tags stripped, character whitelist enforced, 500-char limit
- Edge functions: Paradigm whitelist, demographics length cap, newline removal
- Chart component: Secure CSS injection via `useInsertionEffect` (no `dangerouslySetInnerHTML`)

---

## Project Structure

```
src/
├── App.tsx                    # Router + providers
├── main.tsx                   # Entry point
├── index.css                  # Design tokens (HSL)
├── components/
│   ├── admin/                 # Admin dashboard components
│   ├── auth/                  # ProtectedRoute wrapper
│   ├── layout/                # Navbar, Logo
│   ├── results/               # Results page components
│   │   ├── tabs/              # 5 result tabs (Overview, Analysis, Impact, Research, Actions)
│   │   └── bento/             # Bento grid layout
│   ├── ui/                    # shadcn/ui components
│   └── wizard/                # Assessment wizard steps
├── context/
│   └── AssessmentContext.tsx   # Wizard state management
├── hooks/
│   ├── useAuth.ts             # Authentication state
│   ├── useAdmin.ts            # Admin role check
│   └── use-mobile.tsx         # Responsive detection
├── lib/
│   ├── scoring.ts             # Core scoring algorithm (661 lines)
│   ├── contradictionDetector.ts
│   ├── redFlagsDetector.ts
│   ├── argumentsGenerator.ts
│   ├── regulatoryAnalysis.ts
│   ├── sustainabilityAnalysis.ts
│   ├── citations.ts           # Static HCI citation database
│   ├── pdfGenerator.ts
│   └── utils.ts               # Tailwind merge utility
├── pages/
│   ├── Landing.tsx            # Public landing page
│   ├── Auth.tsx               # Login / Signup
│   ├── Assessment.tsx         # Wizard container
│   ├── Results.tsx            # Live results
│   ├── SavedResults.tsx       # Persisted results
│   ├── SharedResults.tsx      # Public shared view
│   ├── Profile.tsx            # User profile
│   ├── Admin.tsx              # Analytics dashboard
│   └── NotFound.tsx           # 404
├── types/
│   └── assessment.ts          # TypeScript types + constants
└── integrations/
    └── supabase/
        ├── client.ts          # Auto-generated Supabase client
        └── types.ts           # Auto-generated database types

supabase/
├── config.toml                # Edge function config (verify_jwt = false)
├── functions/
│   ├── research-papers/       # AI research paper generation
│   └── case-studies/          # AI case study generation
└── migrations/                # Database migrations (read-only)
```

---

## Manual Installation

### Prerequisites

- **Node.js** ≥ 18 (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun** package manager
- A **Supabase project** (or use Lovable Cloud)

### Steps

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file with the following (values from your Supabase project):
cat > .env << 'EOF'
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
EOF

# 4. Run database migrations
# Apply all migrations from supabase/migrations/ in order via the Supabase CLI:
npx supabase db push

# 5. Deploy edge functions (requires Supabase CLI)
npx supabase functions deploy research-papers
npx supabase functions deploy case-studies

# 6. Set edge function secrets
npx supabase secrets set LOVABLE_API_KEY="your-lovable-api-key"

# 7. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Type | Description |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | Client | Supabase project identifier |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Supabase anon/public key (safe for client) |
| `VITE_SUPABASE_URL` | Client | Supabase API URL |
| `LOVABLE_API_KEY` | Server (secret) | AI Gateway key (edge functions only) |
| `SUPABASE_URL` | Server (auto) | Available in edge functions automatically |
| `SUPABASE_ANON_KEY` | Server (auto) | Available in edge functions automatically |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (auto) | Admin access (never exposed to client) |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Vite, port 5173) |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## License

Research project — Universitat Politècnica de Catalunya (UPC), Master in Advanced Studies in Design.
