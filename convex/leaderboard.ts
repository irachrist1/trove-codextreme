import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get leaderboard for an event
export const getByEvent = query({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get cached leaderboard
    const cached = await ctx.db
      .query("leaderboard")
      .withIndex("by_event_track", (q) => {
        if (args.trackId) {
          return q.eq("eventId", args.eventId).eq("trackId", args.trackId);
        }
        return q.eq("eventId", args.eventId);
      })
      .first();

    if (cached && cached.isPublished) {
      return cached;
    }

    // Generate live leaderboard from submissions
    let submissions = await ctx.db
      .query("submissions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Filter by track if specified
    if (args.trackId) {
      submissions = submissions.filter((s) => s.trackId === args.trackId);
    }

    // Filter to only judged or submitted
    submissions = submissions.filter(
      (s) => s.status === "judged" || s.status === "submitted"
    );

    // Sort by average score (judged first, then by submission time)
    submissions.sort((a, b) => {
      if (a.averageScore !== undefined && b.averageScore !== undefined) {
        return b.averageScore - a.averageScore;
      }
      if (a.averageScore !== undefined) return -1;
      if (b.averageScore !== undefined) return 1;
      return (a.submittedAt || 0) - (b.submittedAt || 0);
    });

    // Build entries
    const entries = await Promise.all(
      submissions.slice(0, 50).map(async (submission, index) => {
        const team = await ctx.db.get(submission.teamId);
        return {
          rank: index + 1,
          teamId: submission.teamId,
          teamName: team?.name || "Unknown Team",
          projectName: submission.projectName,
          score: submission.averageScore || 0,
          avatarUrl: team?.avatarUrl,
        };
      })
    );

    return {
      _id: cached?._id,
      eventId: args.eventId,
      trackId: args.trackId,
      entries,
      lastUpdatedAt: Date.now(),
      isPublished: false,
    };
  },
});

// Get top teams across all events (for global leaderboard)
export const getGlobalTop = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // This would be a more complex query in production
    // For now, we aggregate recent winners
    const events = await ctx.db
      .query("events")
      .withIndex("by_status")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .take(10);

    const topTeams = [];

    for (const event of events) {
      const submissions = await ctx.db
        .query("submissions")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .filter((q) => q.lte(q.field("rank"), 3))
        .collect();

      for (const submission of submissions) {
        const team = await ctx.db.get(submission.teamId);
        if (team) {
          topTeams.push({
            teamId: team._id,
            teamName: team.name,
            projectName: submission.projectName,
            eventTitle: event.title,
            rank: submission.rank || 0,
            score: submission.averageScore || 0,
            eventDate: event.eventEndDate,
          });
        }
      }
    }

    // Sort by rank, then score
    topTeams.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.score - a.score;
    });

    return topTeams.slice(0, args.limit || 20);
  },
});

// Publish leaderboard (makes it official)
export const publish = mutation({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current submissions
    let submissions = await ctx.db
      .query("submissions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("status"), "judged"))
      .collect();

    if (args.trackId) {
      submissions = submissions.filter((s) => s.trackId === args.trackId);
    }

    // Sort by average score
    submissions.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));

    // Build entries
    const entries = await Promise.all(
      submissions.map(async (submission, index) => {
        const team = await ctx.db.get(submission.teamId);
        return {
          rank: index + 1,
          teamId: submission.teamId,
          teamName: team?.name || "Unknown Team",
          projectName: submission.projectName,
          score: submission.averageScore || 0,
          avatarUrl: team?.avatarUrl,
        };
      })
    );

    const now = Date.now();

    // Check for existing
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_event_track", (q) => {
        if (args.trackId) {
          return q.eq("eventId", args.eventId).eq("trackId", args.trackId);
        }
        return q.eq("eventId", args.eventId);
      })
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        entries,
        lastUpdatedAt: now,
        isPublished: true,
      });
      return existing._id;
    }

    const leaderboardId = await ctx.db.insert("leaderboard", {
      eventId: args.eventId,
      trackId: args.trackId,
      entries,
      lastUpdatedAt: now,
      isPublished: true,
    });

    return leaderboardId;
  },
});

// Unpublish leaderboard
export const unpublish = mutation({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_event_track", (q) => {
        if (args.trackId) {
          return q.eq("eventId", args.eventId).eq("trackId", args.trackId);
        }
        return q.eq("eventId", args.eventId);
      })
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isPublished: false,
      });
    }
  },
});
