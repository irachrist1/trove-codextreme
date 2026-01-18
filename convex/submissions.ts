import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get submission by ID
export const getById = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return null;

    // Get team
    const team = await ctx.db.get(submission.teamId);

    return {
      ...submission,
      team: team
        ? {
            _id: team._id,
            name: team.name,
            avatarUrl: team.avatarUrl,
          }
        : null,
    };
  },
});

// Get team's submission
export const getByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .unique();
    return submission;
  },
});

// Get submissions for an event
export const listByEvent = query({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    let filtered = submissions;

    if (args.trackId) {
      filtered = filtered.filter((s) => s.trackId === args.trackId);
    }

    if (args.status) {
      filtered = filtered.filter((s) => s.status === args.status);
    }

    // Get team details
    const withTeams = await Promise.all(
      filtered.map(async (submission) => {
        const team = await ctx.db.get(submission.teamId);
        return {
          ...submission,
          team: team
            ? {
                _id: team._id,
                name: team.name,
                avatarUrl: team.avatarUrl,
              }
            : null,
        };
      })
    );

    return withTeams;
  },
});

// Create submission
export const create = mutation({
  args: {
    eventId: v.id("events"),
    teamId: v.id("teams"),
    trackId: v.optional(v.string()),
    projectName: v.string(),
    tagline: v.string(),
    problemStatement: v.string(),
    solution: v.string(),
    techStack: v.array(v.string()),
    keyFeatures: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if team already has a submission
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .unique();

    if (existing) {
      throw new Error("Team already has a submission");
    }

    const now = Date.now();
    const submissionId = await ctx.db.insert("submissions", {
      ...args,
      challenges: undefined,
      learnings: undefined,
      futureScope: undefined,
      demoUrl: undefined,
      videoUrl: undefined,
      repoUrl: undefined,
      presentationUrl: undefined,
      thumbnailUrl: undefined,
      screenshotUrls: [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return submissionId;
  },
});

// Update submission
export const update = mutation({
  args: {
    submissionId: v.id("submissions"),
    updates: v.object({
      projectName: v.optional(v.string()),
      tagline: v.optional(v.string()),
      trackId: v.optional(v.string()),
      problemStatement: v.optional(v.string()),
      solution: v.optional(v.string()),
      techStack: v.optional(v.array(v.string())),
      keyFeatures: v.optional(v.array(v.string())),
      challenges: v.optional(v.string()),
      learnings: v.optional(v.string()),
      futureScope: v.optional(v.string()),
      demoUrl: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      repoUrl: v.optional(v.string()),
      presentationUrl: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      screenshotUrls: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Submit for judging
export const submit = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Validate required fields
    if (
      !submission.projectName ||
      !submission.tagline ||
      !submission.problemStatement ||
      !submission.solution ||
      submission.techStack.length === 0 ||
      submission.keyFeatures.length === 0
    ) {
      throw new Error("Please fill in all required fields");
    }

    const now = Date.now();
    await ctx.db.patch(args.submissionId, {
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
    });

    // Update team
    const team = await ctx.db.get(submission.teamId);
    if (team) {
      await ctx.db.patch(team._id, {
        hasSubmitted: true,
        updatedAt: now,
      });
    }

    // Update event submission count
    const event = await ctx.db.get(submission.eventId);
    if (event) {
      await ctx.db.patch(submission.eventId, {
        submissionCount: event.submissionCount + 1,
        updatedAt: now,
      });
    }
  },
});

// Unsubmit (revert to draft)
export const unsubmit = mutation({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status !== "submitted") {
      throw new Error("Submission is not in submitted state");
    }

    const now = Date.now();
    await ctx.db.patch(args.submissionId, {
      status: "draft",
      submittedAt: undefined,
      updatedAt: now,
    });

    // Update team
    const team = await ctx.db.get(submission.teamId);
    if (team) {
      await ctx.db.patch(team._id, {
        hasSubmitted: false,
        updatedAt: now,
      });
    }

    // Update event submission count
    const event = await ctx.db.get(submission.eventId);
    if (event) {
      await ctx.db.patch(submission.eventId, {
        submissionCount: Math.max(0, event.submissionCount - 1),
        updatedAt: now,
      });
    }
  },
});
