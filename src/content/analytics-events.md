# Analytics Events Documentation

This document lists all analytics events tracked in Trove via PostHog.

## Event Naming Convention
Events follow the pattern: `{category}.{action}` (e.g., `hackathon.registration_completed`)

---

## Page Views

| Event Name | Description | Properties |
|------------|-------------|------------|
| `page_view` | Fired on every page navigation | `page`, `url`, `referrer` |

---

## Hackathon Funnel

### Event Discovery
| Event Name | Description | Properties |
|------------|-------------|------------|
| `hackathon.event_viewed` | User views an event details page | `event_slug`, `source` (list/featured) |

### Registration
| Event Name | Description | Properties |
|------------|-------------|------------|
| `hackathon.registration_started` | User clicks "Register" button | `event_slug` |
| `hackathon.registration_completed` | User completes registration | `event_slug`, `looking_for_team`, `experience` |

---

## Team Funnel

| Event Name | Description | Properties |
|------------|-------------|------------|
| `hackathon.team_created` | User creates a new team | `event_slug`, `track_id`, `is_open` |
| `hackathon.team_joined` | User joins an existing team | `team_id`, `event_slug`, `role` |
| `hackathon.team_invite_sent` | Team invite sent | `team_id`, `method` (code/link/email) |
| `hackathon.team_invite_accepted` | Invite accepted | `team_id`, `invite_method` |

---

## Submission Funnel

| Event Name | Description | Properties |
|------------|-------------|------------|
| `hackathon.submission_started` | User starts working on submission | `event_slug`, `team_id` |
| `hackathon.submission_saved` | Draft saved | `event_slug` |
| `hackathon.submission_completed` | Final submission made | `event_slug`, `has_demo`, `has_video`, `has_repo` |

---

## Judging Funnel

| Event Name | Description | Properties |
|------------|-------------|------------|
| `judging.session_started` | Judge begins scoring | `event_slug`, `mode` (queue/compare) |
| `judging.score_submitted` | Score submitted for a project | `submission_id`, `score` |
| `judging.comparison_made` | Comparison completed in compare mode | `event_slug`, `winner_id`, `loser_id` |

---

## Engagement

| Event Name | Description | Properties |
|------------|-------------|------------|
| `leaderboard.viewed` | User views leaderboard | `event_slug`, `track_filter` |
| `team.profile_viewed` | User views a team profile | `team_id` |
| `user.profile_viewed` | User views a user profile | `user_id` |

---

## Waitlist

| Event Name | Description | Properties |
|------------|-------------|------------|
| `waitlist.joined` | User joins a feature waitlist | `feature`, `email` |

---

## Authentication

| Event Name | Description | Properties |
|------------|-------------|------------|
| `auth.signed_up` | New user registration | `method` (email/google/github) |
| `auth.logged_in` | User login | `method` |
| `auth.logged_out` | User logout | - |

---

## Implementation Notes

1. **Page Views**: Use the `usePageView` hook in page components
2. **Custom Events**: Use the `useAnalytics` hook and call `track(EVENT_NAME, properties)`
3. **User Identification**: Call `identify(userId, properties)` after authentication
4. **Session Reset**: Call `reset()` on logout

### Example Usage

```typescript
import { useAnalytics, ANALYTICS_EVENTS, usePageView } from '@/lib/posthog'

function MyPage() {
  // Track page view
  usePageView('my_page_name', { custom_prop: 'value' })

  // Track custom events
  const { track } = useAnalytics()

  const handleAction = () => {
    track(ANALYTICS_EVENTS.TEAM_CREATED, {
      event_slug: 'ai-for-good-2026',
      track_id: 'healthcare',
    })
  }
}
```

---

## Key Funnel Metrics

1. **Registration Funnel**: `event_viewed` → `registration_started` → `registration_completed`
2. **Team Formation**: `registration_completed` → `team_created` OR `team_joined`
3. **Submission**: `team_joined` → `submission_started` → `submission_completed`
4. **Judging Efficiency**: `session_started` → completions per session

---

## PostHog Configuration

Set these environment variables:
- `VITE_POSTHOG_KEY`: Your PostHog project API key
- `VITE_POSTHOG_HOST`: PostHog host (default: https://app.posthog.com)
