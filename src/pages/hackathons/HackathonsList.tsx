import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useQuery } from 'convex/react'
import { Search, Filter, MapPin, Calendar, Users, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { formatDateRange, formatRelativeDate } from '@/lib/utils'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

export function HackathonsPage() {
  usePageView('hackathons_list')
  const { track } = useAnalytics()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const convexEvents = useQuery(api.events.listPublished, {})
  const events = convexEvents ?? []

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase())
    const isUpcoming = event.eventStartDate > Date.now()
    const isPast = event.status === 'completed'

    if (filter === 'upcoming') return matchesSearch && isUpcoming
    if (filter === 'past') return matchesSearch && isPast
    return matchesSearch
  })

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Hackathons"
          description="Compete, learn, and build with the best. Find your next challenge."
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Event */}
        {filter !== 'past' && filteredEvents.find((e) => e.status === 'registration_open') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/hackathons/$slug"
              params={{ slug: filteredEvents.find((e) => e.status === 'registration_open')!.slug }}
              onClick={() => track(ANALYTICS_EVENTS.EVENT_VIEWED, { event_slug: filteredEvents[0].slug, source: 'featured' })}
            >
              <Card variant="gradient" className="relative overflow-hidden group">
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[var(--color-black-700)]" />
                    <span className="text-sm font-medium text-[var(--color-black-700)]">Featured Event</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-black-900)] mb-2 group-hover:text-[var(--color-black-700)] transition-colors">
                    {filteredEvents.find((e) => e.status === 'registration_open')!.title}
                  </h2>
                  <p className="text-[var(--color-gray-400)] mb-6 max-w-2xl">
                    {filteredEvents.find((e) => e.status === 'registration_open')!.shortDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-gray-400)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDateRange(
                        filteredEvents.find((e) => e.status === 'registration_open')!.eventStartDate,
                        filteredEvents.find((e) => e.status === 'registration_open')!.eventEndDate
                      )}
                    </span>
                    {filteredEvents.find((e) => e.status === 'registration_open')!.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {filteredEvents.find((e) => e.status === 'registration_open')!.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {filteredEvents.find((e) => e.status === 'registration_open')!.registrationCount} registered
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                    <div className="flex gap-2">
                      {filteredEvents.find((e) => e.status === 'registration_open')!.tracks?.slice(0, 3).map((track: any) => (
                        <Badge key={track.id} variant="default">
                          {track.name}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-[var(--color-black-900)]">
                      {filteredEvents.find((e) => e.status === 'registration_open')!.totalPrizePool}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {convexEvents === undefined ? (
            // Loading state
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : filteredEvents.length === 0 ? (
            // Empty state
            <div className="col-span-2 text-center py-16">
              <p className="text-[var(--color-gray-400)]">No events found matching your criteria.</p>
            </div>
          ) : (
            // Events list
            filteredEvents.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))
          )}
        </div>
      </Container>
    </div>
  )
}

// Event Card Component
function EventCard({ event }: { event: any }) {
  const { track } = useAnalytics()

  return (
    <Link
      to="/hackathons/$slug"
      params={{ slug: event.slug }}
      onClick={() => track(ANALYTICS_EVENTS.EVENT_VIEWED, { event_slug: event.slug, source: 'list' })}
    >
      <Card variant="interactive" className="h-full group">
        <div className="flex justify-between items-start mb-4">
          <StatusBadge status={event.status} />
          {event.totalPrizePool && (
            <span className="text-sm font-medium text-[var(--color-black-800)]">{event.totalPrizePool}</span>
          )}
        </div>

        <h3 className="text-title mb-2 group-hover:text-[var(--color-black-700)] transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-[var(--color-gray-400)] mb-4 line-clamp-2">{event.shortDescription}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-gray-400)] mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateRange(event.eventStartDate, event.eventEndDate)}
          </span>
          {event.city ? (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.city}
            </span>
          ) : event.isVirtual ? (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Virtual
            </span>
          ) : null}
        </div>

        {event.tracks && event.tracks.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {event.tracks.slice(0, 3).map((track: any) => (
              <Badge key={track.id} size="sm" variant="default">
                {track.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-gray-100)]">
          <span className="text-xs text-[var(--color-gray-400)]">
            {event.registrationCount} registered
            {event.maxParticipants && ` / ${event.maxParticipants} spots`}
          </span>
          <ArrowRight className="w-4 h-4 text-[var(--color-gray-400)] group-hover:text-[var(--color-black-700)] group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </Link>
  )
}
