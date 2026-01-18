import { mutation } from "./_generated/server";
import { createHash, randomBytes } from "crypto";

function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(`${usedSalt}:${password}`)
    .digest("hex");
  return `${usedSalt}:${hash}`;
}

// Seed function to populate mock data
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Check if already seeded
    const existingEvents = await ctx.db.query("events").first();
    if (existingEvents) {
      return { message: "Database already seeded" };
    }

    // Create admin user
    const adminId = await ctx.db.insert("users", {
      email: "admin@codextreme.io",
      passwordHash: hashPassword("admin123"),
      authProvider: "password",
      firstName: "Sarah",
      lastName: "Chen",
      displayName: "Sarah Chen",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      bio: "Founder & CEO of CodeXtreme. Building the future of hackathons.",
      location: "San Francisco, CA",
      roles: ["admin", "organizer"],
      skills: ["Leadership", "Strategy", "Product"],
      interests: ["EdTech", "Community Building", "Innovation"],
      eventsParticipated: 0,
      projectsSubmitted: 0,
      hackathonsWon: 0,
      isVerified: true,
      isActive: true,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create sample hackers
    const hackerPassword = hashPassword("password123");
    const hackerIds = await Promise.all([
      ctx.db.insert("users", {
        email: "alex@example.com",
        passwordHash: hackerPassword,
        authProvider: "password",
        firstName: "Alex",
        lastName: "Rivera",
        displayName: "Alex Rivera",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        bio: "Full-stack developer passionate about AI/ML applications.",
        location: "Austin, TX",
        roles: ["hacker"],
        skills: ["React", "Python", "TensorFlow", "Node.js"],
        interests: ["AI", "Web3", "Climate Tech"],
        eventsParticipated: 5,
        projectsSubmitted: 4,
        hackathonsWon: 1,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        email: "jamie@example.com",
        passwordHash: hackerPassword,
        authProvider: "password",
        firstName: "Jamie",
        lastName: "Park",
        displayName: "Jamie Park",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamie",
        bio: "UX Designer and frontend specialist. Making tech accessible.",
        location: "Seattle, WA",
        roles: ["hacker"],
        skills: ["UI/UX", "Figma", "React", "TypeScript"],
        interests: ["Accessibility", "Design Systems", "Mobile"],
        eventsParticipated: 3,
        projectsSubmitted: 3,
        hackathonsWon: 0,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        email: "morgan@example.com",
        passwordHash: hackerPassword,
        authProvider: "password",
        firstName: "Morgan",
        lastName: "Thompson",
        displayName: "Morgan Thompson",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=morgan",
        bio: "Backend engineer with a focus on scalable systems.",
        location: "New York, NY",
        roles: ["hacker"],
        skills: ["Go", "Rust", "Kubernetes", "PostgreSQL"],
        interests: ["Infrastructure", "DevOps", "Security"],
        eventsParticipated: 8,
        projectsSubmitted: 7,
        hackathonsWon: 2,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        email: "taylor@example.com",
        passwordHash: hackerPassword,
        authProvider: "password",
        firstName: "Taylor",
        lastName: "Kim",
        displayName: "Taylor Kim",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
        bio: "Data scientist exploring the intersection of ML and social good.",
        location: "Boston, MA",
        roles: ["hacker"],
        skills: ["Python", "PyTorch", "SQL", "Data Viz"],
        interests: ["Healthcare", "Education", "Sustainability"],
        eventsParticipated: 4,
        projectsSubmitted: 3,
        hackathonsWon: 1,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    // Create judges
    const judgePassword = hashPassword("password123");
    const judgeIds = await Promise.all([
      ctx.db.insert("users", {
        email: "judge1@example.com",
        passwordHash: judgePassword,
        authProvider: "password",
        firstName: "Dr. Michael",
        lastName: "Foster",
        displayName: "Dr. Michael Foster",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        bio: "VP of Engineering at TechCorp. 15+ years in software architecture.",
        location: "San Jose, CA",
        roles: ["judge", "mentor"],
        skills: ["Architecture", "Leadership", "Cloud"],
        interests: ["Mentoring", "Startups", "Innovation"],
        eventsParticipated: 0,
        projectsSubmitted: 0,
        hackathonsWon: 0,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        email: "judge2@example.com",
        passwordHash: judgePassword,
        authProvider: "password",
        firstName: "Lisa",
        lastName: "Wang",
        displayName: "Lisa Wang",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
        bio: "Partner at Velocity Ventures. Invested in 50+ startups.",
        location: "Palo Alto, CA",
        roles: ["judge"],
        skills: ["Investment", "Strategy", "Product"],
        interests: ["B2B SaaS", "AI", "Fintech"],
        eventsParticipated: 0,
        projectsSubmitted: 0,
        hackathonsWon: 0,
        isVerified: true,
        isActive: true,
        lastActiveAt: now,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    // Create upcoming hackathon event
    const upcomingEventId = await ctx.db.insert("events", {
      title: "AI for Good Hackathon 2026",
      slug: "ai-for-good-2026",
      description: `Join us for the most impactful AI hackathon of the year. Over 48 hours, you'll collaborate with brilliant minds to build AI solutions that address real-world challenges in healthcare, education, and sustainability.

**Why Participate?**
- Work on meaningful projects with real impact potential
- Learn from industry experts and AI researchers
- Network with founders, investors, and fellow builders
- Compete for over $50,000 in prizes and resources

**What We're Looking For**
Projects that demonstrate innovative use of AI/ML to solve pressing social challenges. We value creativity, feasibility, and potential for real-world impact.

This is more than a hackathon—it's a movement. Join 500+ builders from around the world in creating technology that matters.`,
      shortDescription: "48 hours to build AI solutions for healthcare, education, and sustainability. $50K+ in prizes.",
      eventType: "hackathon",
      status: "registration_open",
      registrationStartDate: now - oneWeek,
      registrationEndDate: now + 2 * oneWeek,
      eventStartDate: now + 3 * oneWeek,
      eventEndDate: now + 3 * oneWeek + 2 * oneDay,
      submissionDeadline: now + 3 * oneWeek + 2 * oneDay - 2 * 60 * 60 * 1000,
      judgingStartDate: now + 3 * oneWeek + 2 * oneDay,
      judgingEndDate: now + 3 * oneWeek + 3 * oneDay,
      resultsDate: now + 3 * oneWeek + 3 * oneDay + 4 * 60 * 60 * 1000,
      isVirtual: false,
      isHybrid: true,
      venue: "Innovation Center SF",
      address: "123 Tech Boulevard",
      city: "San Francisco",
      country: "United States",
      maxParticipants: 500,
      maxTeamSize: 5,
      minTeamSize: 2,
      tracks: [
        {
          id: "healthcare",
          name: "Healthcare & Wellness",
          description: "Build AI solutions for patient care, diagnostics, mental health, or wellness.",
          color: "#10B981",
          prizes: [
            { place: 1, title: "1st Place", value: "$10,000", description: "Cash + AWS credits" },
            { place: 2, title: "2nd Place", value: "$5,000" },
            { place: 3, title: "3rd Place", value: "$2,500" },
          ],
        },
        {
          id: "education",
          name: "Education & Learning",
          description: "Create AI-powered tools for personalized learning, accessibility, or skills development.",
          color: "#6366F1",
          prizes: [
            { place: 1, title: "1st Place", value: "$10,000", description: "Cash + Google Cloud credits" },
            { place: 2, title: "2nd Place", value: "$5,000" },
            { place: 3, title: "3rd Place", value: "$2,500" },
          ],
        },
        {
          id: "sustainability",
          name: "Climate & Sustainability",
          description: "Develop AI applications for environmental monitoring, resource optimization, or climate action.",
          color: "#EC4899",
          prizes: [
            { place: 1, title: "1st Place", value: "$10,000", description: "Cash + Azure credits" },
            { place: 2, title: "2nd Place", value: "$5,000" },
            { place: 3, title: "3rd Place", value: "$2,500" },
          ],
        },
      ],
      schedule: [
        {
          id: "opening",
          title: "Opening Ceremony",
          description: "Welcome, rules, and track introductions",
          startTime: now + 3 * oneWeek,
          endTime: now + 3 * oneWeek + 60 * 60 * 1000,
          type: "ceremony",
          isVirtual: true,
          meetingUrl: "https://zoom.us/example",
        },
        {
          id: "hacking-starts",
          title: "Hacking Begins",
          startTime: now + 3 * oneWeek + 60 * 60 * 1000,
          endTime: now + 3 * oneWeek + 2 * 60 * 60 * 1000,
          type: "other",
          isVirtual: false,
        },
        {
          id: "mentor-session-1",
          title: "Mentor Office Hours",
          description: "Get 1:1 help from industry experts",
          startTime: now + 3 * oneWeek + 4 * 60 * 60 * 1000,
          endTime: now + 3 * oneWeek + 6 * 60 * 60 * 1000,
          type: "mentoring",
          isVirtual: true,
        },
        {
          id: "workshop-ai",
          title: "Workshop: Building with LLMs",
          description: "Hands-on session on integrating LLM APIs",
          startTime: now + 3 * oneWeek + 8 * 60 * 60 * 1000,
          endTime: now + 3 * oneWeek + 10 * 60 * 60 * 1000,
          type: "workshop",
          isVirtual: true,
        },
        {
          id: "submission-deadline",
          title: "Submission Deadline",
          startTime: now + 3 * oneWeek + 2 * oneDay - 2 * 60 * 60 * 1000,
          endTime: now + 3 * oneWeek + 2 * oneDay - 2 * 60 * 60 * 1000,
          type: "deadline",
          isVirtual: false,
        },
        {
          id: "closing",
          title: "Closing Ceremony & Awards",
          description: "Project demos, judging results, and celebration",
          startTime: now + 3 * oneWeek + 3 * oneDay,
          endTime: now + 3 * oneWeek + 3 * oneDay + 3 * 60 * 60 * 1000,
          type: "ceremony",
          isVirtual: true,
        },
      ],
      totalPrizePool: "$50,000+",
      prizes: [
        { place: 1, title: "Grand Prize", value: "$15,000", description: "Best overall project + incubator spot" },
        { place: 2, title: "Runner Up", value: "$7,500" },
        { place: 3, title: "Third Place", value: "$3,500" },
      ],
      requirements: [
        "All team members must be registered participants",
        "Projects must be built during the hackathon period",
        "Teams must use AI/ML in their solution",
        "All code must be original or properly attributed",
        "Submissions must include a working demo or video",
      ],
      eligibility: "Open to students, professionals, and anyone 18+ with a passion for AI and social impact.",
      organizerId: adminId,
      organizerName: "CodeXtreme",
      websiteUrl: "https://codextreme.io/ai-for-good",
      discordUrl: "https://discord.gg/codextreme",
      registrationCount: 127,
      teamCount: 32,
      submissionCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create past completed hackathon
    const pastEventId = await ctx.db.insert("events", {
      title: "Web3 Builder Fest 2025",
      slug: "web3-builder-fest-2025",
      description: "Our flagship Web3 hackathon brought together 300+ builders to create the next generation of decentralized applications.",
      shortDescription: "Decentralized apps, DeFi innovations, and NFT experiences. $30K in prizes awarded.",
      eventType: "hackathon",
      status: "completed",
      registrationStartDate: now - 60 * oneDay,
      registrationEndDate: now - 45 * oneDay,
      eventStartDate: now - 40 * oneDay,
      eventEndDate: now - 38 * oneDay,
      submissionDeadline: now - 38 * oneDay,
      judgingStartDate: now - 38 * oneDay,
      judgingEndDate: now - 37 * oneDay,
      resultsDate: now - 37 * oneDay,
      isVirtual: true,
      isHybrid: false,
      maxParticipants: 300,
      maxTeamSize: 4,
      minTeamSize: 1,
      tracks: [
        {
          id: "defi",
          name: "DeFi",
          description: "Decentralized finance applications",
          color: "#F59E0B",
          prizes: [{ place: 1, title: "1st Place", value: "$10,000" }],
        },
        {
          id: "nft",
          name: "NFT & Gaming",
          description: "NFT marketplaces and blockchain games",
          color: "#8B5CF6",
          prizes: [{ place: 1, title: "1st Place", value: "$10,000" }],
        },
      ],
      schedule: [],
      totalPrizePool: "$30,000",
      prizes: [
        { place: 1, title: "Grand Prize", value: "$10,000" },
        { place: 2, title: "Runner Up", value: "$5,000" },
      ],
      requirements: ["Must use blockchain technology"],
      organizerId: adminId,
      organizerName: "CodeXtreme",
      registrationCount: 287,
      teamCount: 72,
      submissionCount: 65,
      createdAt: now - 90 * oneDay,
      updatedAt: now - 37 * oneDay,
    });

    // Create future hackathon
    await ctx.db.insert("events", {
      title: "Mobile Innovation Challenge",
      slug: "mobile-innovation-2026",
      description: "Build the next breakthrough mobile experience. Focus on cross-platform development, AR/VR, and edge computing.",
      shortDescription: "Cross-platform apps, AR/VR experiences, and edge computing. Coming Q2 2026.",
      eventType: "hackathon",
      status: "published",
      registrationStartDate: now + 60 * oneDay,
      registrationEndDate: now + 90 * oneDay,
      eventStartDate: now + 100 * oneDay,
      eventEndDate: now + 102 * oneDay,
      submissionDeadline: now + 102 * oneDay,
      judgingStartDate: now + 102 * oneDay,
      judgingEndDate: now + 104 * oneDay,
      resultsDate: now + 104 * oneDay,
      isVirtual: true,
      isHybrid: false,
      maxParticipants: 400,
      maxTeamSize: 4,
      minTeamSize: 1,
      tracks: [],
      schedule: [],
      totalPrizePool: "$40,000",
      prizes: [],
      requirements: [],
      organizerId: adminId,
      organizerName: "CodeXtreme",
      registrationCount: 0,
      teamCount: 0,
      submissionCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Add sponsors to upcoming event
    await Promise.all([
      ctx.db.insert("eventSponsors", {
        eventId: upcomingEventId,
        name: "TechCorp",
        logoUrl: "https://placehold.co/200x80/1a1a1a/white?text=TechCorp",
        websiteUrl: "https://techcorp.example.com",
        tier: "title",
        description: "Leading enterprise software company",
        order: 1,
      }),
      ctx.db.insert("eventSponsors", {
        eventId: upcomingEventId,
        name: "CloudScale",
        logoUrl: "https://placehold.co/200x80/1a1a1a/white?text=CloudScale",
        websiteUrl: "https://cloudscale.example.com",
        tier: "platinum",
        order: 2,
      }),
      ctx.db.insert("eventSponsors", {
        eventId: upcomingEventId,
        name: "DevTools Inc",
        logoUrl: "https://placehold.co/200x80/1a1a1a/white?text=DevTools",
        tier: "gold",
        order: 3,
      }),
      ctx.db.insert("eventSponsors", {
        eventId: upcomingEventId,
        name: "AI Labs",
        logoUrl: "https://placehold.co/200x80/1a1a1a/white?text=AI+Labs",
        tier: "gold",
        order: 4,
      }),
    ]);

    // Add staff to upcoming event
    await Promise.all([
      ctx.db.insert("eventStaff", {
        eventId: upcomingEventId,
        userId: judgeIds[0],
        role: "judge",
        expertise: ["AI/ML", "System Design", "Cloud Architecture"],
        isConfirmed: true,
      }),
      ctx.db.insert("eventStaff", {
        eventId: upcomingEventId,
        userId: judgeIds[1],
        role: "judge",
        expertise: ["Product Strategy", "Startups", "Investment"],
        isConfirmed: true,
      }),
    ]);

    // Create judging rubric for upcoming event
    await ctx.db.insert("judgingRubrics", {
      eventId: upcomingEventId,
      criteria: [
        {
          id: "innovation",
          name: "Innovation",
          description: "How novel and creative is the solution?",
          maxScore: 10,
          weight: 1.5,
        },
        {
          id: "impact",
          name: "Social Impact",
          description: "What is the potential positive impact on society?",
          maxScore: 10,
          weight: 1.5,
        },
        {
          id: "technical",
          name: "Technical Execution",
          description: "How well-built and functional is the solution?",
          maxScore: 10,
          weight: 1,
        },
        {
          id: "design",
          name: "Design & UX",
          description: "How intuitive and polished is the user experience?",
          maxScore: 10,
          weight: 0.75,
        },
        {
          id: "presentation",
          name: "Presentation",
          description: "How clearly was the problem and solution communicated?",
          maxScore: 10,
          weight: 0.75,
        },
      ],
      totalMaxScore: 55,
      createdAt: now,
      updatedAt: now,
    });

    // Create sample registrations
    await Promise.all(
      hackerIds.map((userId) =>
        ctx.db.insert("registrations", {
          eventId: upcomingEventId,
          userId,
          status: "approved",
          experience: "3+ years",
          motivation: "I want to build something meaningful with AI.",
          lookingForTeam: true,
          lookingForRoles: ["Backend Developer", "ML Engineer"],
          createdAt: now,
          updatedAt: now,
        })
      )
    );

    // Create a sample team
    const teamId = await ctx.db.insert("teams", {
      eventId: upcomingEventId,
      name: "Neural Nexus",
      slug: "neural-nexus",
      description: "Building AI-powered mental health support tools",
      trackId: "healthcare",
      leaderId: hackerIds[0],
      memberIds: [hackerIds[0], hackerIds[1]],
      inviteCode: "NN2026",
      isOpenForMembers: true,
      isComplete: false,
      hasSubmitted: false,
      lookingFor: ["ML Engineer", "UI/UX Designer"],
      createdAt: now,
      updatedAt: now,
    });

    // Add team members
    await Promise.all([
      ctx.db.insert("teamMembers", {
        teamId,
        userId: hackerIds[0],
        role: "Team Lead / Full Stack",
        joinedAt: now,
        isLeader: true,
      }),
      ctx.db.insert("teamMembers", {
        teamId,
        userId: hackerIds[1],
        role: "UI/UX Designer",
        joinedAt: now,
        isLeader: false,
      }),
    ]);

    // Update registration looking for team status
    const reg1 = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", upcomingEventId).eq("userId", hackerIds[0])
      )
      .unique();
    if (reg1) {
      await ctx.db.patch(reg1._id, { lookingForTeam: false });
    }

    const reg2 = await ctx.db
      .query("registrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", upcomingEventId).eq("userId", hackerIds[1])
      )
      .unique();
    if (reg2) {
      await ctx.db.patch(reg2._id, { lookingForTeam: false });
    }

    return {
      message: "Database seeded successfully",
      upcomingEventId,
      pastEventId,
      teamId,
    };
  },
});
