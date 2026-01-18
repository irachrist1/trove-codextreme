import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createHash, randomBytes } from "crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const OTP_TTL_MS = 1000 * 60 * 10;
const RESET_TTL_MS = 1000 * 60 * 30;

function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(`${usedSalt}:${password}`)
    .digest("hex");
  return `${usedSalt}:${hash}`;
}

function verifyPassword(stored: string, password: string) {
  const [salt, existing] = stored.split(":");
  if (!salt || !existing) return false;
  const hash = hashPassword(password, salt).split(":")[1];
  return hash === existing;
}

function generateToken() {
  return randomBytes(32).toString("hex");
}

function generateOtp() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

function buildDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      throw new Error("Email already registered");
    }

    const now = Date.now();
    const passwordHash = hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      authProvider: "password",
      firstName: args.firstName,
      lastName: args.lastName,
      displayName: buildDisplayName(args.firstName, args.lastName),
      roles: ["hacker"],
      skills: [],
      interests: [],
      eventsParticipated: 0,
      projectsSubmitted: 0,
      hackathonsWon: 0,
      isVerified: true,
      isActive: true,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const sessionToken = generateToken();
    await ctx.db.insert("authSessions", {
      userId,
      sessionToken,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    return { sessionToken, userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    if (!verifyPassword(user.passwordHash, args.password)) {
      throw new Error("Invalid email or password");
    }

    const now = Date.now();
    const sessionToken = generateToken();
    await ctx.db.insert("authSessions", {
      userId: user._id,
      sessionToken,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    return { sessionToken, userId: user._id };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const getCurrentUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("authSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .unique();
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      return null;
    }
    const user = await ctx.db.get(session.userId);
    return user || null;
  },
});

export const requestMagicLink = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const code = generateOtp();
    await ctx.db.insert("authOtps", {
      email: args.email,
      code,
      purpose: "magic_link",
      createdAt: now,
      expiresAt: now + OTP_TTL_MS,
    });

    return { code };
  },
});

export const verifyCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const otp = await ctx.db
      .query("authOtps")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    const match = otp.find((o) => o.code === args.code);
    if (!match || match.expiresAt < Date.now()) {
      throw new Error("Invalid or expired code");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.delete(match._id);

    const now = Date.now();
    const sessionToken = generateToken();
    await ctx.db.insert("authSessions", {
      userId: user._id,
      sessionToken,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    return { sessionToken, userId: user._id };
  },
});

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const token = generateToken();
    await ctx.db.insert("passwordResets", {
      email: args.email,
      token,
      createdAt: now,
      expiresAt: now + RESET_TTL_MS,
    });

    return { token };
  },
});

export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const reset = await ctx.db
      .query("passwordResets")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!reset || reset.expiresAt < Date.now()) {
      throw new Error("Invalid or expired reset token");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", reset.email))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
      updatedAt: Date.now(),
    });

    await ctx.db.delete(reset._id);
  },
});
