import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Trophy, Users, Rocket } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { usePageView } from '@/lib/posthog'

export function HomePage() {
  usePageView('home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-offwhite-4)] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[var(--color-gray-100)] to-[var(--color-offwhite-5)] rounded-full blur-3xl opacity-30" />

        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="text-overline text-[var(--color-red-500)] mb-4 block">CodeXtreme</span>
            <h1 className="text-display mb-6">
              Where Builders
              <span className="gradient-text block">Shape the Future</span>
            </h1>
            <p className="text-xl text-[var(--color-gray-400)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the most ambitious builders from around the world. Compete in hackathons,
              learn through challenges, and connect with a community that ships.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/hackathons">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Explore Events
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="lg">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Builders', value: '10K+' },
              { label: 'Projects Shipped', value: '2.5K+' },
              { label: 'Prize Pool', value: '$500K+' },
              { label: 'Countries', value: '45+' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[var(--color-white)] rounded-2xl border border-[var(--color-gray-100)] shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-black-900)] mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--color-gray-400)]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-[var(--color-gray-100)]">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-4">Everything You Need to Build</h2>
            <p className="text-[var(--color-gray-400)] max-w-xl mx-auto">
              A complete ecosystem for hackers, builders, and dreamers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Hackathons',
                description: 'Compete in world-class hackathons with meaningful prizes and mentorship.',
                href: '/hackathons',
                active: true,
              },
              {
                icon: Trophy,
                title: 'Leaderboard',
                description: 'Track your progress and see how you stack up against the best.',
                href: '/leaderboard',
                active: true,
              },
              {
                icon: Users,
                title: 'Townsquare',
                description: 'Connect with builders, share ideas, and find your next co-founder.',
                href: '/townsquare',
                active: false,
              },
              {
                icon: Rocket,
                title: 'Buildathon',
                description: 'Long-form building challenges with milestone tracking and support.',
                href: '/buildathon',
                active: false,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={feature.href}>
                  <Card variant="interactive" className="h-full group">
                    <div className="p-2 w-12 h-12 rounded-xl bg-[var(--color-offwhite-4)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-[var(--color-red-500)]" />
                    </div>
                    <h3 className="text-title mb-2 flex items-center gap-2">
                      {feature.title}
                      {!feature.active && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-gray-100)] rounded text-[var(--color-gray-400)]">Soon</span>
                      )}
                    </h3>
                    <p className="text-sm text-[var(--color-gray-400)]">{feature.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[var(--color-gray-100)]">
        <Container size="md">
          <Card variant="gradient" className="text-center py-12">
            <h2 className="text-headline mb-4">Ready to Start Building?</h2>
            <p className="text-[var(--color-gray-400)] mb-8 max-w-md mx-auto">
              Join thousands of builders who are turning their ideas into reality.
            </p>
            <Link to="/hackathons">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Find Your Next Hackathon
              </Button>
            </Link>
          </Card>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--color-gray-100)]">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Trove" className="h-8 w-auto" />
              <span className="font-semibold text-[var(--color-black-900)]">Trove by CodeXtreme</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">
              Building the future of hackathons.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
