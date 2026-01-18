import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table with role-based access
  users: defineTable({
    // Auth
    email: v.string(),
    passwordHash: v.optional(v.string()),
    authProvider: v.optional(v.string()),
    authProviderId: v.optional(v.string()),

    // Profile
    firstName: v.string(),
    lastName: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),

    // Skills & interests
    skills: v.array(v.string()),
    interests: v.array(v.string()),
    githubUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),

    // Roles (can have multiple)
    roles: v.array(v.union(
      v.literal("admin"),
      v.literal("hacker"),
      v.literal("mentor"),
      v.literal("judge"),
      v.literal("partner"),
      v.literal("organizer")
    )),

    // Stats
    eventsParticipated: v.number(),
    projectsSubmitted: v.number(),
    hackathonsWon: v.number(),

    // Meta
    isVerified: v.boolean(),
    isActive: v.boolean(),
    lastActiveAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_roles", ["roles"])
    .searchIndex("search_users", {
      searchField: "displayName",
      filterFields: ["roles", "isActive"],
    }),

  // Auth sessions
  authSessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
  })
    .index("by_token", ["sessionToken"])
    .index("by_user", ["userId"]),

  // One-time codes for magic link / OTP
  authOtps: defineTable({
    email: v.string(),
    code: v.string(),
    purpose: v.union(
      v.literal("magic_link"),
      v.literal("verify_code")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_email_purpose", ["email", "purpose"]),

  // Password reset tokens
  passwordResets: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),

  // Events (Hackathons, Buildathons, etc.)
  events: defineTable({
    // Basic info
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.string(),
    coverImageUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),

    // Type
    eventType: v.union(
      v.literal("hackathon"),
      v.literal("buildathon"),
      v.literal("workshop"),
      v.literal("meetup")
    ),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("registration_open"),
      v.literal("registration_closed"),
      v.literal("in_progress"),
      v.literal("judging"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    // Dates
    registrationStartDate: v.number(),
    registrationEndDate: v.number(),
    eventStartDate: v.number(),
    eventEndDate: v.number(),
    submissionDeadline: v.number(),
    judgingStartDate: v.number(),
    judgingEndDate: v.number(),
    resultsDate: v.number(),

    // Location
    isVirtual: v.boolean(),
    isHybrid: v.boolean(),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),

    // Capacity
    maxParticipants: v.optional(v.number()),
    maxTeamSize: v.number(),
    minTeamSize: v.number(),

    // Tracks
    tracks: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      color: v.string(),
      prizes: v.array(v.object({
        place: v.number(),
        title: v.string(),
        value: v.string(),
        description: v.optional(v.string()),
      })),
    })),

    // Schedule
    schedule: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      startTime: v.number(),
      endTime: v.number(),
      type: v.union(
        v.literal("ceremony"),
        v.literal("workshop"),
        v.literal("mentoring"),
        v.literal("meal"),
        v.literal("break"),
        v.literal("deadline"),
        v.literal("other")
      ),
      location: v.optional(v.string()),
      isVirtual: v.boolean(),
      meetingUrl: v.optional(v.string()),
    })),

    // Prizes
    totalPrizePool: v.optional(v.string()),
    prizes: v.array(v.object({
      place: v.number(),
      title: v.string(),
      value: v.string(),
      description: v.optional(v.string()),
    })),

    // Requirements
    requirements: v.array(v.string()),
    eligibility: v.optional(v.string()),

    // Organizer
    organizerId: v.id("users"),
    organizerName: v.string(),

    // Meta
    websiteUrl: v.optional(v.string()),
    rulesUrl: v.optional(v.string()),
    faqUrl: v.optional(v.string()),
    discordUrl: v.optional(v.string()),
    slackUrl: v.optional(v.string()),

    // Stats (denormalized for performance)
    registrationCount: v.number(),
    teamCount: v.number(),
    submissionCount: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_event_type", ["eventType"])
    .index("by_start_date", ["eventStartDate"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["status", "eventType"],
    }),

  // Event Sponsors
  eventSponsors: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    logoUrl: v.string(),
    websiteUrl: v.optional(v.string()),
    tier: v.union(
      v.literal("title"),
      v.literal("platinum"),
      v.literal("gold"),
      v.literal("silver"),
      v.literal("bronze"),
      v.literal("partner")
    ),
    description: v.optional(v.string()),
    order: v.number(),
  }).index("by_event", ["eventId"]),

  // Event Mentors/Judges
  eventStaff: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.union(
      v.literal("judge"),
      v.literal("mentor"),
      v.literal("organizer"),
      v.literal("volunteer")
    ),
    bio: v.optional(v.string()),
    expertise: v.array(v.string()),
    availability: v.optional(v.string()),
    isConfirmed: v.boolean(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_role", ["eventId", "role"]),

  // Registrations
  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("waitlisted"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("checked_in")
    ),

    // Registration form responses
    experience: v.optional(v.string()),
    motivation: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    tshirtSize: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),

    // Looking for team
    lookingForTeam: v.boolean(),
    preferredTrackId: v.optional(v.string()),
    lookingForRoles: v.array(v.string()),

    // Check-in
    checkedInAt: v.optional(v.number()),
    checkedInBy: v.optional(v.id("users")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_looking_for_team", ["eventId", "lookingForTeam"]),

  // Teams
  teams: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    // Track
    trackId: v.optional(v.string()),

    // Members
    leaderId: v.id("users"),
    memberIds: v.array(v.id("users")),

    // Invites
    inviteCode: v.string(),
    isOpenForMembers: v.boolean(),

    // Status
    isComplete: v.boolean(),
    hasSubmitted: v.boolean(),

    // Looking for
    lookingFor: v.array(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_slug", ["eventId", "slug"])
    .index("by_leader", ["leaderId"])
    .index("by_invite_code", ["inviteCode"])
    .index("by_event_open", ["eventId", "isOpenForMembers"]),

  // Team Members (for detailed member info)
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(),
    joinedAt: v.number(),
    isLeader: v.boolean(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // Team Invites
  teamInvites: defineTable({
    teamId: v.id("teams"),
    invitedUserId: v.optional(v.id("users")),
    invitedEmail: v.optional(v.string()),
    invitedByUserId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_invited_user", ["invitedUserId"])
    .index("by_invited_email", ["invitedEmail"])
    .index("by_status", ["status"]),

  // Submissions
  submissions: defineTable({
    eventId: v.id("events"),
    teamId: v.id("teams"),
    trackId: v.optional(v.string()),

    // Project info
    projectName: v.string(),
    tagline: v.string(),

    // Structured content
    problemStatement: v.string(),
    solution: v.string(),
    techStack: v.array(v.string()),
    keyFeatures: v.array(v.string()),
    challenges: v.optional(v.string()),
    learnings: v.optional(v.string()),
    futureScope: v.optional(v.string()),

    // Links
    demoUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    presentationUrl: v.optional(v.string()),

    // Files
    thumbnailUrl: v.optional(v.string()),
    screenshotUrls: v.array(v.string()),

    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("judged"),
      v.literal("disqualified")
    ),
    submittedAt: v.optional(v.number()),

    // Judging results (denormalized)
    averageScore: v.optional(v.number()),
    totalJudges: v.optional(v.number()),
    rank: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_team", ["teamId"])
    .index("by_event_track", ["eventId", "trackId"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_average_score", ["eventId", "averageScore"]),

  // Judging Rubrics
  judgingRubrics: defineTable({
    eventId: v.id("events"),
    trackId: v.optional(v.string()),

    criteria: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      maxScore: v.number(),
      weight: v.number(),
    })),

    totalMaxScore: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_track", ["eventId", "trackId"]),

  // Judging Scores
  judgingScores: defineTable({
    submissionId: v.id("submissions"),
    judgeId: v.id("users"),
    rubricId: v.id("judgingRubrics"),

    scores: v.array(v.object({
      criteriaId: v.string(),
      score: v.number(),
      comment: v.optional(v.string()),
    })),

    totalScore: v.number(),
    weightedScore: v.number(),
    overallComment: v.optional(v.string()),

    // Comparison tracking
    comparedWith: v.array(v.id("submissions")),

    status: v.union(
      v.literal("in_progress"),
      v.literal("completed")
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_judge", ["judgeId"])
    .index("by_submission_judge", ["submissionId", "judgeId"]),

  // Judging Assignments
  judgingAssignments: defineTable({
    eventId: v.id("events"),
    judgeId: v.id("users"),
    submissionIds: v.array(v.id("submissions")),
    trackId: v.optional(v.string()),

    completedCount: v.number(),
    totalCount: v.number(),

    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_judge", ["judgeId"])
    .index("by_event_judge", ["eventId", "judgeId"]),

  // Leaderboard (materialized view for performance)
  leaderboard: defineTable({
    eventId: v.id("events"),
    trackId: v.optional(v.string()),

    entries: v.array(v.object({
      rank: v.number(),
      teamId: v.id("teams"),
      teamName: v.string(),
      projectName: v.string(),
      score: v.number(),
      avatarUrl: v.optional(v.string()),
    })),

    lastUpdatedAt: v.number(),
    isPublished: v.boolean(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_track", ["eventId", "trackId"]),

  // Waitlist for stubs
  waitlist: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    feature: v.union(
      v.literal("townsquare"),
      v.literal("buildathon"),
      v.literal("power_of_code"),
      v.literal("opportunity_board")
    ),
    referralSource: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_feature", ["feature"]),

  // Analytics events (for PostHog integration tracking)
  analyticsEvents: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    eventName: v.string(),
    properties: v.any(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event_name", ["eventName"])
    .index("by_timestamp", ["timestamp"]),
});
