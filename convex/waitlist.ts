import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Check if email is on waitlist for a feature
export const checkEmail = query({
  args: {
    email: v.string(),
    feature: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return entry && entry.feature === args.feature;
  },
});

// Get waitlist count for a feature
export const getCount = query({
  args: { feature: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("waitlist")
      .withIndex("by_feature", (q) => q.eq("feature", args.feature as any))
      .collect();
    return entries.length;
  },
});

// Join waitlist
export const join = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    feature: v.string(),
    referralSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already on waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    const alreadyOnFeature = existing.find((e) => e.feature === args.feature);
    if (alreadyOnFeature) {
      return { success: true, alreadyJoined: true };
    }

    await ctx.db.insert("waitlist", {
      email: args.email,
      name: args.name,
      feature: args.feature as any,
      referralSource: args.referralSource,
      createdAt: Date.now(),
    });

    return { success: true, alreadyJoined: false };
  },
});
