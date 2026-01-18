import { createContext, useContext, useEffect, ReactNode } from 'react'
import posthog from 'posthog-js'

// Initialize PostHog (only in production with valid key)
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

if (POSTHOG_KEY && typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.debug()
      }
    },
    capture_pageview: false, // We'll handle this manually
    capture_pageleave: true,
    autocapture: false, // Manual event tracking for cleaner data
  })
}

// Analytics event names for documentation
export const ANALYTICS_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',

  // Hackathon funnel
  EVENT_VIEWED: 'hackathon.event_viewed',
  REGISTRATION_STARTED: 'hackathon.registration_started',
  REGISTRATION_COMPLETED: 'hackathon.registration_completed',

  // Team funnel
  TEAM_CREATED: 'hackathon.team_created',
  TEAM_JOINED: 'hackathon.team_joined',
  TEAM_INVITE_SENT: 'hackathon.team_invite_sent',
  TEAM_INVITE_ACCEPTED: 'hackathon.team_invite_accepted',

  // Submission funnel
  SUBMISSION_STARTED: 'hackathon.submission_started',
  SUBMISSION_SAVED: 'hackathon.submission_saved',
  SUBMISSION_COMPLETED: 'hackathon.submission_completed',

  // Judging funnel
  JUDGING_SESSION_STARTED: 'judging.session_started',
  JUDGING_SCORE_SUBMITTED: 'judging.score_submitted',
  JUDGING_COMPARISON_MADE: 'judging.comparison_made',

  // Engagement
  LEADERBOARD_VIEWED: 'leaderboard.viewed',
  TEAM_PROFILE_VIEWED: 'team.profile_viewed',
  USER_PROFILE_VIEWED: 'user.profile_viewed',

  // Waitlist
  WAITLIST_JOINED: 'waitlist.joined',

  // Auth
  USER_SIGNED_UP: 'auth.signed_up',
  USER_LOGGED_IN: 'auth.logged_in',
  USER_LOGGED_OUT: 'auth.logged_out',

  // Required key actions
  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  EVENT_REGISTER_COMPLETE: 'event_register_complete',
  SUBMISSION_SUBMITTED: 'submission_submitted',
  ADMIN_EVENT_PUBLISHED: 'admin_event_published',
  JUDGE_SCORE_SUBMITTED: 'judge_score_submitted',
} as const

type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

interface AnalyticsContextValue {
  track: (event: AnalyticsEvent, properties?: Record<string, unknown>) => void
  identify: (userId: string, properties?: Record<string, unknown>) => void
  reset: () => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function PostHogProvider({ children }: { children: ReactNode }) {
  const track = (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
    if (POSTHOG_KEY) {
      posthog.capture(event, properties)
    } else if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties)
    }
  }

  const identify = (userId: string, properties?: Record<string, unknown>) => {
    if (POSTHOG_KEY) {
      posthog.identify(userId, properties)
    }
  }

  const reset = () => {
    if (POSTHOG_KEY) {
      posthog.reset()
    }
  }

  return (
    <AnalyticsContext.Provider value={{ track, identify, reset }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    // Return no-op functions if provider not found
    return {
      track: () => {},
      identify: () => {},
      reset: () => {},
    }
  }
  return context
}

// Hook for tracking page views
export function usePageView(pageName: string, properties?: Record<string, unknown>) {
  const { track } = useAnalytics()

  useEffect(() => {
    track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
    })
  }, [pageName])
}
