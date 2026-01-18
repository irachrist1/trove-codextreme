/**
 * Trove Content System
 *
 * All user-facing copy is centralized here for easy editing.
 * This enables quick iteration on messaging without code changes.
 */

export const content = {
  // Brand
  brand: {
    name: 'Trove',
    tagline: 'Where Builders Shape the Future',
    company: 'CodeXtreme',
    description: 'The central workflow backbone for hackathons, buildathons, and tech community programs.',
  },

  // Homepage
  home: {
    hero: {
      badge: 'CodeXtreme',
      title: 'Where Builders',
      titleHighlight: 'Shape the Future',
      description: 'Join the most ambitious builders from around the world. Compete in hackathons, learn through challenges, and connect with a community that ships.',
      primaryCta: 'Explore Events',
      secondaryCta: 'View Leaderboard',
    },
    stats: [
      { label: 'Builders', value: '10K+' },
      { label: 'Projects Shipped', value: '2.5K+' },
      { label: 'Prize Pool', value: '$500K+' },
      { label: 'Countries', value: '45+' },
    ],
    features: {
      title: 'Everything You Need to Build',
      description: 'A complete ecosystem for hackers, builders, and dreamers.',
    },
    cta: {
      title: 'Ready to Start Building?',
      description: 'Join thousands of builders who are turning their ideas into reality.',
      buttonText: 'Find Your Next Hackathon',
    },
  },

  // Hackathons
  hackathons: {
    title: 'Hackathons',
    description: 'Compete, learn, and build with the best. Find your next challenge.',
    emptyState: 'No events found matching your criteria.',
    featured: 'Featured Event',
    filters: {
      all: 'All',
      upcoming: 'Upcoming',
      past: 'Past',
    },
  },

  // Registration
  registration: {
    steps: {
      about: {
        title: 'Tell us about yourself',
        description: 'Help us match you with the right team and resources.',
      },
      team: {
        title: 'Team Preferences',
        description: "Let us know if you need help finding teammates.",
      },
      final: {
        title: 'Almost there!',
        description: "Just a few more details and you're all set.",
      },
    },
    lookingForTeam: {
      title: 'Looking for teammates?',
      description: "We'll help connect you with other participants looking for team members.",
    },
    agreement: 'I agree to the hackathon rules and code of conduct. I understand that my participation is subject to approval by the organizers.',
    submitButton: 'Complete Registration',
    benefits: [
      'Build Something Amazing',
      'Meet Great People',
      'Learn New Skills',
    ],
  },

  // Teams
  teams: {
    create: {
      title: 'Create Your Team',
      description: 'Assemble your dream team for the hackathon',
      submitButton: 'Create Team',
    },
    join: {
      title: 'Join this team',
      invalidCode: 'Invalid Invite Code',
      invalidCodeDescription: 'This invite code is invalid or has expired. Please check the code and try again.',
    },
    invite: {
      title: 'Invite Teammates',
      codeHint: 'Share this code with your teammates',
    },
    openForMembers: {
      title: 'Open for new members',
      description: 'Allow other participants to request to join your team',
    },
  },

  // Submission
  submission: {
    title: 'Project Submission',
    description: 'Tell us about what you built',
    sections: {
      info: {
        title: 'Project Info',
        description: 'The basics about your project',
      },
      problem: {
        title: 'Problem & Solution',
        description: 'What problem are you solving and how?',
      },
      tech: {
        title: 'Tech Stack',
        description: 'Technologies used in your project',
      },
      features: {
        title: 'Key Features',
        description: 'Main features of your project',
      },
      links: {
        title: 'Links',
        description: 'Share your demo, video, and code',
      },
    },
    status: {
      draft: 'Draft',
      submitted: 'Submitted',
    },
    completion: {
      title: 'Completion Status',
      warning: 'Complete all required fields before submitting',
    },
    confirmSubmit: {
      title: 'Submit Project?',
      description: 'Once submitted, your project will be locked for judging. You can still make edits until the deadline.',
    },
  },

  // Judging
  judging: {
    title: 'Judging Dashboard',
    progress: {
      title: 'Your Progress',
      description: (completed: number, total: number) => `${completed} of ${total} submissions judged`,
    },
    compare: {
      title: 'Compare Mode',
      description: 'Swipe away the project you think is weaker, or click the buttons below',
      buttonA: 'A is Better',
      buttonB: 'B is Better',
      skip: 'Skip',
      tip: 'Tip: Use keyboard shortcuts: ← for A, → for B, Space to skip',
    },
  },

  // Leaderboard
  leaderboard: {
    title: 'Leaderboard',
    description: 'Real-time rankings for AI for Good Hackathon 2026',
    filters: {
      all: 'All Tracks',
    },
    lastUpdated: 'Last updated:',
  },

  // Stub pages
  stubs: {
    badge: 'Coming Soon',
    waitlistCta: 'Join Waitlist',
    waitlistCount: (count: number) => `Join ${count.toLocaleString()}+ builders waiting for early access`,
    townsquare: {
      title: 'Where Builders',
      titleHighlight: 'Connect & Create',
      description: 'Townsquare is the global community hub for CodeXtreme builders. Share your work, find collaborators, get feedback, and stay connected with the most ambitious builders in tech.',
    },
    buildathon: {
      title: 'Build Something',
      titleHighlight: 'That Lasts',
      description: 'Buildathon is for the long game. Multi-week challenges with structured milestones, mentor check-ins, and the accountability you need to ship a real product.',
    },
    powerOfCode: {
      title: 'Level Up Your',
      titleHighlight: 'Coding Skills',
      description: 'Power of Code is challenge-based learning that actually works. Real-world projects, instant feedback, and a path from beginner to expert.',
    },
    opportunities: {
      title: 'Your Next Role',
      titleHighlight: 'Awaits',
      description: 'Opportunity Board connects CodeXtreme builders with companies that value hackathon experience. Curated roles from startups and tech giants alike.',
    },
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    tryAgain: 'Try Again',
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    viewAll: 'View All',
    learnMore: 'Learn More',
    getStarted: 'Get Started',
  },

  // Footer
  footer: {
    tagline: 'Building the future of hackathons.',
  },
}

export default content
