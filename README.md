# Trove by CodeXtreme

> The central workflow backbone for hackathons, buildathons, and tech community programs.

Trove is a web-first Progressive Web App (PWA) designed for mobile-first UX with a modular architecture. The Hackathon & Events module is fully functional as the MVP, while other modules are presented as beautiful, interactive stubs.

## Features

### Hackathons Module (MVP - Fully Functional)
- **Public**
  - Events listing with search and filters
  - Event details with schedule, tracks, sponsors, judges
  - Registration flow (3-step wizard)
- **Authenticated Participants**
  - Team creation with invite codes
  - Team management and member invites
  - Structured submission flow (problem → solution → tech → demo)
  - My team dashboard with milestones
- **Judges**
  - Judging queue with progress tracking
  - **Swipe-based comparison mode** (signature interaction)
  - Score submission with rubric criteria
- **Admin**
  - Event creation and management
  - Participant and role management
  - Judging rubric configuration

### Leaderboard
- Real-time rankings with animated reveals
- Track-based filtering
- Podium display for top 3

### Premium Stubs (Beautiful Placeholders)
- **Townsquare** - Global community feed concept
- **Buildathon** - Multi-week challenge timelines
- **Power of Code** - Challenge-based learning
- **Opportunity Board** - Job marketplace for builders

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Styling | TailwindCSS + Custom Design Tokens |
| Routing | TanStack Router |
| Data Fetching | TanStack Query + Convex |
| Backend | Convex (real-time database) |
| Animations | Framer Motion |
| Analytics | PostHog |
| PWA | Vite PWA Plugin + Workbox |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Convex account (free tier available)

### Installation

1. **Clone and install dependencies**
```bash
cd trove
npm install
```

2. **Set up Convex**
```bash
# Login to Convex
npx convex login

# Initialize the project (creates deployment)
npx convex dev
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Convex URL
```

4. **Seed the database (optional)**
```bash
# In Convex dashboard, run the seedDatabase mutation
# Or via CLI: npx convex run seed:seedDatabase
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
trove/
├── convex/                 # Backend (Convex)
│   ├── schema.ts          # Database schema
│   ├── events.ts          # Event queries/mutations
│   ├── teams.ts           # Team management
│   ├── submissions.ts     # Submission handling
│   ├── judging.ts         # Judging system
│   ├── leaderboard.ts     # Leaderboard logic
│   └── seed.ts            # Mock data seeder
│
├── public/                 # Static assets
│   ├── robots.txt         # SEO
│   ├── sitemap.xml        # SEO
│   └── llms.txt           # LLM guide
│
├── src/
│   ├── components/
│   │   ├── ui/            # Design system components
│   │   └── layout/        # Layout components
│   │
│   ├── pages/
│   │   ├── hackathons/    # Hackathon module pages
│   │   ├── teams/         # Team management pages
│   │   ├── judging/       # Judging interface
│   │   └── stubs/         # Coming soon modules
│   │
│   ├── content/           # Centralized copy
│   │   ├── copy.ts        # All UI text
│   │   └── analytics-events.md
│   │
│   ├── lib/               # Utilities
│   │   ├── utils.ts       # Helper functions
│   │   └── posthog.tsx    # Analytics
│   │
│   └── styles/
│       └── globals.css    # Design tokens + base styles
│
└── vite.config.ts         # Vite + PWA config
```

## Design System

### Colors
```css
--color-bg-primary: #0A0A0B
--color-accent-primary: #6366F1 (Indigo)
--color-accent-secondary: #8B5CF6 (Violet)
--color-accent-tertiary: #EC4899 (Pink)
```

### Components
- `Button` - Primary, secondary, ghost, outline, danger variants
- `Card` - Default, elevated, gradient, interactive variants
- `Input` / `Textarea` / `Select` - Form inputs with labels and validation
- `Badge` - Status indicators
- `Avatar` / `AvatarGroup` - User display
- `Modal` / `ConfirmModal` - Dialogs
- `Toast` - Notifications
- `Skeleton` - Loading states

### Motion
- Page transitions (subtle)
- Micro-interactions (hover, press, swipe)
- Signature moments (leaderboard reveal, judge swipe compare)
- Shimmer loading states

## Analytics Events

Key funnel events tracked:

| Category | Events |
|----------|--------|
| Hackathon | `event_viewed`, `registration_started`, `registration_completed` |
| Teams | `team_created`, `team_joined`, `team_invite_sent` |
| Submissions | `submission_started`, `submission_saved`, `submission_completed` |
| Judging | `session_started`, `score_submitted`, `comparison_made` |
| Waitlist | `waitlist.joined` |

See `src/content/analytics-events.md` for full documentation.

## PWA Features

- Installable on mobile and desktop
- Offline-friendly shell
- Network-first caching for API calls
- Automatic service worker updates

## SEO

- `robots.txt` with sitemap reference
- `sitemap.xml` with all public routes
- Structured data (Organization, Event schemas)
- `llms.txt` for AI assistant guidance
- Open Graph and Twitter meta tags

## Content System

All user-facing copy is centralized in `src/content/copy.ts` for easy editing without code changes.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONVEX_URL` | Convex deployment URL | Yes |
| `VITE_POSTHOG_KEY` | PostHog project API key | No |
| `VITE_POSTHOG_HOST` | PostHog host URL | No |

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npx convex dev     # Start Convex dev server
```

## Deployment

1. Build the frontend:
```bash
npm run build
```

2. Deploy Convex:
```bash
npx convex deploy
```

3. Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, Cloudflare Pages, etc.)

## License

MIT

---

Built with care by [CodeXtreme](https://codextreme.io)
