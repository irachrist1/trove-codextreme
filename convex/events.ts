import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all published events
export const listPublished = query({
  args: {
    eventType: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_status")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "published"),
          q.eq(q.field("status"), "registration_open"),
          q.eq(q.field("status"), "registration_closed"),
          q.eq(q.field("status"), "in_progress"),
          q.eq(q.field("status"), "judging"),
          q.eq(q.field("status"), "completed")
        )
      );

    const events = await eventsQuery.collect();

    // Filter by event type if specified
    let filtered = events;
    if (args.eventType) {
      filtered = events.filter((e) => e.eventType === args.eventType);
    }

    // Sort by start date
    filtered.sort((a, b) => a.eventStartDate - b.eventStartDate);

    // Limit results
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Admin list (all events)
export const listAll = query({
  args: {
    searchTerm: v.optional(v.string()),
    status: v.optional(v.string()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db.query("events").collect();

    let filtered = events;
    if (args.status) {
      filtered = filtered.filter((e) => e.status === args.status);
    }
    if (args.eventType) {
      filtered = filtered.filter((e) => e.eventType === args.eventType);
    }
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(term));
    }

    filtered.sort((a, b) => b.eventStartDate - a.eventStartDate);
    return filtered;
  },
});

// Get upcoming events
export const listUpcoming = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gt(q.field("eventStartDate"), now))
      .take(args.limit || 10);

    return events.filter(
      (e) => e.status !== "draft" && e.status !== "cancelled"
    );
  },
});

// Get event by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!event) return null;

    // Get sponsors
    const sponsors = await ctx.db
      .query("eventSponsors")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    // Get staff (judges, mentors)
    const staff = await ctx.db
      .query("eventStaff")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();

    // Get staff user details
    const staffWithUsers = await Promise.all(
      staff.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return {
          ...s,
          user: user
            ? {
                _id: user._id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
              }
            : null,
        };
      })
    );

    return {
      ...event,
      sponsors: sponsors.sort((a, b) => a.order - b.order),
      staff: staffWithUsers,
    };
  },
});

// Get event by ID
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// Search events
export const search = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("events")
      .withSearchIndex("search_events", (q) => q.search("title", args.searchTerm))
      .take(args.limit || 20);

    return results.filter((e) => e.status !== "draft");
  },
});

// Create event (admin only)
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.string(),
    eventType: v.string(),
    registrationStartDate: v.number(),
    registrationEndDate: v.number(),
    eventStartDate: v.number(),
    eventEndDate: v.number(),
    submissionDeadline: v.number(),
    judgingStartDate: v.number(),
    judgingEndDate: v.number(),
    resultsDate: v.number(),
    isVirtual: v.boolean(),
    maxTeamSize: v.number(),
    minTeamSize: v.number(),
    organizerId: v.id("users"),
    organizerName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      ...args,
      eventType: args.eventType as "hackathon" | "buildathon" | "workshop" | "meetup",
      status: "draft",
      isHybrid: false,
      tracks: [],
      schedule: [],
      prizes: [],
      requirements: [],
      registrationCount: 0,
      teamCount: 0,
      submissionCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return eventId;
  },
});

// Update event
export const update = mutation({
  args: {
    eventId: v.id("events"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Update event status
export const updateStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status as any,
      updatedAt: Date.now(),
    });
  },
});
