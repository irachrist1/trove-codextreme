import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Check if user is registered for an event
export const checkRegistration = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .unique();
    return registration;
  },
});

// Get registrations for an event
export const listByEvent = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(v.string()),
    lookingForTeam: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));

    const registrations = await query.collect();

    // Filter by status if specified
    let filtered = registrations;
    if (args.status) {
      filtered = filtered.filter((r) => r.status === args.status);
    }

    // Filter by looking for team if specified
    if (args.lookingForTeam !== undefined) {
      filtered = filtered.filter((r) => r.lookingForTeam === args.lookingForTeam);
    }

    // Get user details for each registration
    const withUsers = await Promise.all(
      filtered.map(async (reg) => {
        const user = await ctx.db.get(reg.userId);
        return {
          ...reg,
          user: user
            ? {
                _id: user._id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                skills: user.skills,
              }
            : null,
        };
      })
    );

    return withUsers;
  },
});

// Get user's registrations
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get event details
    const withEvents = await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return {
          ...reg,
          event: event
            ? {
                _id: event._id,
                title: event.title,
                slug: event.slug,
                eventStartDate: event.eventStartDate,
                status: event.status,
              }
            : null,
        };
      })
    );

    return withEvents;
  },
});

// Register for an event
export const register = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    experience: v.optional(v.string()),
    motivation: v.optional(v.string()),
    dietaryRestrictions: v.optional(v.string()),
    tshirtSize: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    lookingForTeam: v.boolean(),
    preferredTrackId: v.optional(v.string()),
    lookingForRoles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already registered
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      throw new Error("Already registered for this event");
    }

    // Check event registration status
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "registration_open") {
      throw new Error("Registration is not open for this event");
    }

    // Check capacity
    if (event.maxParticipants && event.registrationCount >= event.maxParticipants) {
      // Add to waitlist
      const now = Date.now();
      const registrationId = await ctx.db.insert("registrations", {
        eventId: args.eventId,
        userId: args.userId,
        status: "waitlisted",
        experience: args.experience,
        motivation: args.motivation,
        dietaryRestrictions: args.dietaryRestrictions,
        tshirtSize: args.tshirtSize,
        emergencyContact: args.emergencyContact,
        lookingForTeam: args.lookingForTeam,
        preferredTrackId: args.preferredTrackId,
        lookingForRoles: args.lookingForRoles,
        createdAt: now,
        updatedAt: now,
      });

      return { registrationId, status: "waitlisted" };
    }

    // Create registration
    const now = Date.now();
    const registrationId = await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId: args.userId,
      status: "approved",
      experience: args.experience,
      motivation: args.motivation,
      dietaryRestrictions: args.dietaryRestrictions,
      tshirtSize: args.tshirtSize,
      emergencyContact: args.emergencyContact,
      lookingForTeam: args.lookingForTeam,
      preferredTrackId: args.preferredTrackId,
      lookingForRoles: args.lookingForRoles,
      createdAt: now,
      updatedAt: now,
    });

    // Update event count
    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1,
      updatedAt: now,
    });

    return { registrationId, status: "approved" };
  },
});

// Update registration status
export const updateStatus = mutation({
  args: {
    registrationId: v.id("registrations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    await ctx.db.patch(args.registrationId, {
      status: args.status as any,
      updatedAt: Date.now(),
    });
  },
});

// Check in a participant
export const checkIn = mutation({
  args: {
    registrationId: v.id("registrations"),
    checkedInBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.registrationId, {
      status: "checked_in",
      checkedInAt: now,
      checkedInBy: args.checkedInBy,
      updatedAt: now,
    });
  },
});

// Cancel registration
export const cancel = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Update event count if was approved
    if (registration.status === "approved" || registration.status === "checked_in") {
      const event = await ctx.db.get(registration.eventId);
      if (event) {
        await ctx.db.patch(registration.eventId, {
          registrationCount: Math.max(0, event.registrationCount - 1),
          updatedAt: Date.now(),
        });
      }
    }
  },
});
