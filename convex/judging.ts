import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get rubric for an event
export const getRubric = query({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rubric = await ctx.db
      .query("judgingRubrics")
      .withIndex("by_event_track", (q) => {
        if (args.trackId) {
          return q.eq("eventId", args.eventId).eq("trackId", args.trackId);
        }
        return q.eq("eventId", args.eventId);
      })
      .first();
    return rubric;
  },
});

// Get judge's assignments
export const getAssignments = query({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db
      .query("judgingAssignments")
      .withIndex("by_event_judge", (q) =>
        q.eq("eventId", args.eventId).eq("judgeId", args.judgeId)
      )
      .unique();

    if (!assignment) return null;

    // Get submissions
    const submissions = await Promise.all(
      assignment.submissionIds.map(async (id) => {
        const submission = await ctx.db.get(id);
        if (!submission) return null;

        const team = await ctx.db.get(submission.teamId);

        // Check if already scored
        const score = await ctx.db
          .query("judgingScores")
          .withIndex("by_submission_judge", (q) =>
            q.eq("submissionId", id).eq("judgeId", args.judgeId)
          )
          .unique();

        return {
          ...submission,
          team: team
            ? {
                _id: team._id,
                name: team.name,
                avatarUrl: team.avatarUrl,
              }
            : null,
          isScored: score?.status === "completed",
          scoreId: score?._id,
        };
      })
    );

    return {
      ...assignment,
      submissions: submissions.filter(Boolean),
    };
  },
});

// Get judge's scores for an event
export const getJudgeScores = query({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("judgingScores")
      .withIndex("by_judge", (q) => q.eq("judgeId", args.judgeId))
      .collect();

    // Filter by event (through submissions)
    const eventScores = [];
    for (const score of scores) {
      const submission = await ctx.db.get(score.submissionId);
      if (submission && submission.eventId === args.eventId) {
        eventScores.push(score);
      }
    }

    return eventScores;
  },
});

// Get all scores for a submission
export const getSubmissionScores = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("judgingScores")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .collect();

    // Get judge details
    const withJudges = await Promise.all(
      scores.map(async (score) => {
        const judge = await ctx.db.get(score.judgeId);
        return {
          ...score,
          judge: judge
            ? {
                _id: judge._id,
                displayName: judge.displayName,
                avatarUrl: judge.avatarUrl,
              }
            : null,
        };
      })
    );

    return withJudges;
  },
});

// Create rubric
export const createRubric = mutation({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
    criteria: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        maxScore: v.number(),
        weight: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const totalMaxScore = args.criteria.reduce(
      (sum, c) => sum + c.maxScore * c.weight,
      0
    );

    const now = Date.now();
    const rubricId = await ctx.db.insert("judgingRubrics", {
      eventId: args.eventId,
      trackId: args.trackId,
      criteria: args.criteria,
      totalMaxScore,
      createdAt: now,
      updatedAt: now,
    });

    return rubricId;
  },
});

// Update rubric
export const updateRubric = mutation({
  args: {
    rubricId: v.id("judgingRubrics"),
    criteria: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        maxScore: v.number(),
        weight: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const totalMaxScore = args.criteria.reduce(
      (sum, c) => sum + c.maxScore * c.weight,
      0
    );
    await ctx.db.patch(args.rubricId, {
      criteria: args.criteria,
      totalMaxScore,
      updatedAt: Date.now(),
    });
  },
});

// Assign submissions to judges
export const assignSubmissions = mutation({
  args: {
    eventId: v.id("events"),
    judgeId: v.id("users"),
    submissionIds: v.array(v.id("submissions")),
    trackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if assignment already exists
    const existing = await ctx.db
      .query("judgingAssignments")
      .withIndex("by_event_judge", (q) =>
        q.eq("eventId", args.eventId).eq("judgeId", args.judgeId)
      )
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        submissionIds: args.submissionIds,
        totalCount: args.submissionIds.length,
      });
      return existing._id;
    }

    const assignmentId = await ctx.db.insert("judgingAssignments", {
      eventId: args.eventId,
      judgeId: args.judgeId,
      submissionIds: args.submissionIds,
      trackId: args.trackId,
      completedCount: 0,
      totalCount: args.submissionIds.length,
      createdAt: Date.now(),
    });

    return assignmentId;
  },
});

// List assignments for an event (admin view)
export const listAssignments = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("judgingAssignments")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const withJudges = await Promise.all(
      assignments.map(async (assignment) => {
        const judge = await ctx.db.get(assignment.judgeId);
        return {
          ...assignment,
          judge: judge
            ? {
                _id: judge._id,
                displayName: judge.displayName,
                avatarUrl: judge.avatarUrl,
              }
            : null,
        };
      })
    );

    return withJudges;
  },
});

// Submit score
export const submitScore = mutation({
  args: {
    submissionId: v.id("submissions"),
    judgeId: v.id("users"),
    rubricId: v.id("judgingRubrics"),
    scores: v.array(
      v.object({
        criteriaId: v.string(),
        score: v.number(),
        comment: v.optional(v.string()),
      })
    ),
    overallComment: v.optional(v.string()),
    comparedWith: v.array(v.id("submissions")),
  },
  handler: async (ctx, args) => {
    // Get rubric for weight calculation
    const rubric = await ctx.db.get(args.rubricId);
    if (!rubric) {
      throw new Error("Rubric not found");
    }

    // Calculate scores
    let totalScore = 0;
    let weightedScore = 0;

    for (const score of args.scores) {
      totalScore += score.score;
      const criterion = rubric.criteria.find((c) => c.id === score.criteriaId);
      if (criterion) {
        weightedScore += score.score * criterion.weight;
      }
    }

    // Check if already scored
    const existing = await ctx.db
      .query("judgingScores")
      .withIndex("by_submission_judge", (q) =>
        q.eq("submissionId", args.submissionId).eq("judgeId", args.judgeId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      // Update existing score
      await ctx.db.patch(existing._id, {
        scores: args.scores,
        totalScore,
        weightedScore,
        overallComment: args.overallComment,
        comparedWith: args.comparedWith,
        status: "completed",
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new score
    const scoreId = await ctx.db.insert("judgingScores", {
      submissionId: args.submissionId,
      judgeId: args.judgeId,
      rubricId: args.rubricId,
      scores: args.scores,
      totalScore,
      weightedScore,
      overallComment: args.overallComment,
      comparedWith: args.comparedWith,
      status: "completed",
      createdAt: now,
      updatedAt: now,
    });

    // Update assignment completed count
    const submission = await ctx.db.get(args.submissionId);
    if (submission) {
      const assignment = await ctx.db
        .query("judgingAssignments")
        .withIndex("by_event_judge", (q) =>
          q.eq("eventId", submission.eventId).eq("judgeId", args.judgeId)
        )
        .unique();

      if (assignment) {
        await ctx.db.patch(assignment._id, {
          completedCount: assignment.completedCount + 1,
        });
      }
    }

    return scoreId;
  },
});

// Calculate and update submission rankings
export const calculateRankings = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // Get all submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .collect();

    // Calculate average scores
    const submissionScores = await Promise.all(
      submissions.map(async (submission) => {
        const scores = await ctx.db
          .query("judgingScores")
          .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect();

        if (scores.length === 0) {
          return { submission, averageScore: 0, totalJudges: 0 };
        }

        const totalWeighted = scores.reduce((sum, s) => sum + s.weightedScore, 0);
        const averageScore = totalWeighted / scores.length;

        return { submission, averageScore, totalJudges: scores.length };
      })
    );

    // Sort by score
    submissionScores.sort((a, b) => b.averageScore - a.averageScore);

    // Update rankings
    const now = Date.now();
    for (let i = 0; i < submissionScores.length; i++) {
      const { submission, averageScore, totalJudges } = submissionScores[i];
      await ctx.db.patch(submission._id, {
        averageScore,
        totalJudges,
        rank: i + 1,
        status: "judged",
        updatedAt: now,
      });
    }

    return submissionScores.length;
  },
});
