import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Get team by ID
export const getById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    // Get members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Get user details for members
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
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

    return {
      ...team,
      members: membersWithUsers,
    };
  },
});

// Get teams for an event
export const listByEvent = query({
  args: {
    eventId: v.id("events"),
    trackId: v.optional(v.string()),
    isOpenForMembers: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    let filtered = teams;

    if (args.trackId) {
      filtered = filtered.filter((t) => t.trackId === args.trackId);
    }

    if (args.isOpenForMembers !== undefined) {
      filtered = filtered.filter((t) => t.isOpenForMembers === args.isOpenForMembers);
    }

    // Get member count for each team
    const withMemberCount = await Promise.all(
      filtered.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        return {
          ...team,
          memberCount: members.length,
        };
      })
    );

    return withMemberCount;
  },
});

// Get user's team for an event
export const getUserTeam = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find team membership
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const membership of memberships) {
      const team = await ctx.db.get(membership.teamId);
      if (team && team.eventId === args.eventId) {
        // Get all members
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const membersWithUsers = await Promise.all(
          members.map(async (member) => {
            const user = await ctx.db.get(member.userId);
            return {
              ...member,
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

        return {
          ...team,
          members: membersWithUsers,
        };
      }
    }

    return null;
  },
});

// Get team by invite code
export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!team) return null;

    // Get event
    const event = await ctx.db.get(team.eventId);

    // Get member count
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", team._id))
      .collect();

    return {
      ...team,
      memberCount: members.length,
      event: event
        ? {
            _id: event._id,
            title: event.title,
            maxTeamSize: event.maxTeamSize,
          }
        : null,
    };
  },
});

// Create a team
export const create = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    trackId: v.optional(v.string()),
    leaderId: v.id("users"),
    isOpenForMembers: v.boolean(),
    lookingFor: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is registered
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.leaderId)
      )
      .unique();

    if (!registration || registration.status !== "approved") {
      throw new Error("User must be registered for the event");
    }

    // Check if user already has a team
    const existingTeam = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.leaderId))
      .collect();

    for (const membership of existingTeam) {
      const team = await ctx.db.get(membership.teamId);
      if (team && team.eventId === args.eventId) {
        throw new Error("User is already part of a team for this event");
      }
    }

    // Create team
    const now = Date.now();
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const inviteCode = generateInviteCode();

    const teamId = await ctx.db.insert("teams", {
      eventId: args.eventId,
      name: args.name,
      slug,
      description: args.description,
      trackId: args.trackId,
      leaderId: args.leaderId,
      memberIds: [args.leaderId],
      inviteCode,
      isOpenForMembers: args.isOpenForMembers,
      isComplete: false,
      hasSubmitted: false,
      lookingFor: args.lookingFor,
      createdAt: now,
      updatedAt: now,
    });

    // Add leader as team member
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.leaderId,
      role: "Team Lead",
      joinedAt: now,
      isLeader: true,
    });

    // Update event team count
    const event = await ctx.db.get(args.eventId);
    if (event) {
      await ctx.db.patch(args.eventId, {
        teamCount: event.teamCount + 1,
        updatedAt: now,
      });
    }

    // Update registration
    await ctx.db.patch(registration._id, {
      lookingForTeam: false,
      updatedAt: now,
    });

    return { teamId, inviteCode };
  },
});

// Join a team
export const join = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is registered
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", team.eventId).eq("userId", args.userId)
      )
      .unique();

    if (!registration || registration.status !== "approved") {
      throw new Error("User must be registered for the event");
    }

    // Check if user already has a team
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const membership of existingMembership) {
      const existingTeam = await ctx.db.get(membership.teamId);
      if (existingTeam && existingTeam.eventId === team.eventId) {
        throw new Error("User is already part of a team for this event");
      }
    }

    // Check team capacity
    const event = await ctx.db.get(team.eventId);
    if (event && team.memberIds.length >= event.maxTeamSize) {
      throw new Error("Team is full");
    }

    // Add member
    const now = Date.now();
    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role,
      joinedAt: now,
      isLeader: false,
    });

    // Update team
    await ctx.db.patch(args.teamId, {
      memberIds: [...team.memberIds, args.userId],
      updatedAt: now,
    });

    // Update registration
    await ctx.db.patch(registration._id, {
      lookingForTeam: false,
      updatedAt: now,
    });
  },
});

// Join by invite code
export const joinByInviteCode = mutation({
  args: {
    inviteCode: v.string(),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db
      .query("teams")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!team) {
      throw new Error("Invalid invite code");
    }

    // Use the join mutation logic
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", team.eventId).eq("userId", args.userId)
      )
      .unique();

    if (!registration || registration.status !== "approved") {
      throw new Error("User must be registered for the event");
    }

    // Check if user already has a team
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const membership of existingMembership) {
      const existingTeam = await ctx.db.get(membership.teamId);
      if (existingTeam && existingTeam.eventId === team.eventId) {
        throw new Error("User is already part of a team for this event");
      }
    }

    // Check team capacity
    const event = await ctx.db.get(team.eventId);
    if (event && team.memberIds.length >= event.maxTeamSize) {
      throw new Error("Team is full");
    }

    // Add member
    const now = Date.now();
    await ctx.db.insert("teamMembers", {
      teamId: team._id,
      userId: args.userId,
      role: args.role,
      joinedAt: now,
      isLeader: false,
    });

    // Update team
    await ctx.db.patch(team._id, {
      memberIds: [...team.memberIds, args.userId],
      updatedAt: now,
    });

    // Update registration
    await ctx.db.patch(registration._id, {
      lookingForTeam: false,
      updatedAt: now,
    });

    return { teamId: team._id };
  },
});

// Update team
export const update = mutation({
  args: {
    teamId: v.id("teams"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      trackId: v.optional(v.string()),
      isOpenForMembers: v.optional(v.boolean()),
      lookingFor: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.teamId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Leave team
export const leave = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    if (team.leaderId === args.userId) {
      throw new Error("Team leader cannot leave. Transfer leadership first or disband the team.");
    }

    // Find and remove membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("User is not a member of this team");
    }

    await ctx.db.delete(membership._id);

    // Update team
    await ctx.db.patch(args.teamId, {
      memberIds: team.memberIds.filter((id) => id !== args.userId),
      updatedAt: Date.now(),
    });
  },
});

// Regenerate invite code
export const regenerateInviteCode = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const newCode = generateInviteCode();
    await ctx.db.patch(args.teamId, {
      inviteCode: newCode,
      updatedAt: Date.now(),
    });
    return newCode;
  },
});
