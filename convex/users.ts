import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user by ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Search users
export const search = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) =>
        q.search("displayName", args.searchTerm).eq("isActive", true)
      )
      .take(args.limit || 20);
  },
});

// Get users by role
export const listByRole = query({
  args: {
    role: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by role
    const filtered = users.filter((u) =>
      u.roles.includes(args.role as any)
    );

    return filtered.slice(0, args.limit || 50);
  },
});

// Create user
export const create = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      roles: args.roles as any,
      skills: [],
      interests: [],
      eventsParticipated: 0,
      projectsSubmitted: 0,
      hackathonsWon: 0,
      isVerified: false,
      isActive: true,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Update user
export const update = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      displayName: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      timezone: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      interests: v.optional(v.array(v.string())),
      githubUrl: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      portfolioUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Update user roles
export const updateRoles = mutation({
  args: {
    userId: v.id("users"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      roles: args.roles as any,
      updatedAt: Date.now(),
    });
  },
});

// Update last active
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActiveAt: Date.now(),
    });
  },
});

// Get current user (mock for auth stub)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // In production, this would check auth identity
    // For MVP, we return the first user or null
    const user = await ctx.db.query("users").first();
    return user;
  },
});
