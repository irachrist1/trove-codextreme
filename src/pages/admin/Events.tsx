import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatDateRange } from '@/lib/utils'
import { useAnalytics, ANALYTICS_EVENTS } from '@/lib/posthog'
import { useAuth } from '@/lib/auth'

export function AdminEventsPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const { track } = useAnalytics()
  const [searchTerm, setSearchTerm] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    eventType: 'hackathon',
    registrationStartDate: '',
    registrationEndDate: '',
    eventStartDate: '',
    eventEndDate: '',
    submissionDeadline: '',
    judgingStartDate: '',
    judgingEndDate: '',
    resultsDate: '',
    isVirtual: false,
    maxTeamSize: 5,
    minTeamSize: 2,
  })

  const events = useQuery(api.events.listAll, { searchTerm }) || []
  const createEvent = useMutation(api.events.create)
  const updateStatus = useMutation(api.events.updateStatus)
  const updateEvent = useMutation(api.events.update)

  const handleCreate = async () => {
    if (!user) return
    try {
      const toNumber = (value: string) => new Date(value).getTime()
      await createEvent({
        title: form.title,
        slug: form.slug,
        description: form.description,
        shortDescription: form.shortDescription,
        eventType: form.eventType,
        registrationStartDate: toNumber(form.registrationStartDate),
        registrationEndDate: toNumber(form.registrationEndDate),
        eventStartDate: toNumber(form.eventStartDate),
        eventEndDate: toNumber(form.eventEndDate),
        submissionDeadline: toNumber(form.submissionDeadline),
        judgingStartDate: toNumber(form.judgingStartDate),
        judgingEndDate: toNumber(form.judgingEndDate),
        resultsDate: toNumber(form.resultsDate),
        isVirtual: form.isVirtual,
        maxTeamSize: Number(form.maxTeamSize),
        minTeamSize: Number(form.minTeamSize),
        organizerId: user._id as any,
        organizerName: user.displayName,
      })
      success('Event created')
      setCreateOpen(false)
    } catch (err: any) {
      error(err?.message || 'Failed to create event')
    }
  }

  const handlePublish = async (eventId: string, status: string) => {
    try {
      await updateStatus({ eventId: eventId as any, status })
      if (status === 'published') {
        track(ANALYTICS_EVENTS.ADMIN_EVENT_PUBLISHED, { event_id: eventId })
      }
      success('Status updated')
    } catch (err: any) {
      error(err?.message || 'Failed to update status')
    }
  }

  const handleQuickEdit = async (eventId: string, title: string) => {
    try {
      await updateEvent({
        eventId: eventId as any,
        updates: { title },
      })
      success('Event updated')
    } catch (err: any) {
      error(err?.message || 'Failed to update event')
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Events"
          description="Manage events, registrations, and judging."
          actions={
            <Button
              className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
              onClick={() => setCreateOpen(!createOpen)}
            >
              {createOpen ? 'Close' : 'Create Event'}
            </Button>
          }
        />

        {createOpen && (
          <Card className="mb-8">
            <CardHeader title="Create event" description="Add a new event to the platform." />
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input label="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input label="Registration start" type="date" value={form.registrationStartDate} onChange={(e) => setForm({ ...form, registrationStartDate: e.target.value })} />
              <Input label="Registration end" type="date" value={form.registrationEndDate} onChange={(e) => setForm({ ...form, registrationEndDate: e.target.value })} />
              <Input label="Event start" type="date" value={form.eventStartDate} onChange={(e) => setForm({ ...form, eventStartDate: e.target.value })} />
              <Input label="Event end" type="date" value={form.eventEndDate} onChange={(e) => setForm({ ...form, eventEndDate: e.target.value })} />
              <Input label="Submission deadline" type="date" value={form.submissionDeadline} onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })} />
              <Input label="Judging start" type="date" value={form.judgingStartDate} onChange={(e) => setForm({ ...form, judgingStartDate: e.target.value })} />
              <Input label="Judging end" type="date" value={form.judgingEndDate} onChange={(e) => setForm({ ...form, judgingEndDate: e.target.value })} />
              <Input label="Results date" type="date" value={form.resultsDate} onChange={(e) => setForm({ ...form, resultsDate: e.target.value })} />
            </div>
            <div className="mt-4">
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Active events"
            description={`${events.length} total`}
            action={
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            }
          />

          {events.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">No events yet.</div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-[var(--color-gray-100)] rounded-xl"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        className="text-lg font-semibold text-[var(--color-black-900)] bg-transparent border-b border-[var(--color-gray-100)] focus:outline-none"
                        value={event.title}
                        onChange={(e) => handleQuickEdit(event._id, e.target.value)}
                      />
                      <Badge variant="default">{event.status}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-gray-400)]">
                      {formatDateRange(event.eventStartDate, event.eventEndDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handlePublish(event._id, 'published')}>
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePublish(event._id, 'draft')}>
                      Unpublish
                    </Button>
                    <Link to="/admin/events/$id/registrations" params={{ id: event._id }}>
                      <Button size="sm" variant="ghost">Registrations</Button>
                    </Link>
                    <Link to="/admin/events/$id/rubric" params={{ id: event._id }}>
                      <Button size="sm" variant="ghost">Rubric</Button>
                    </Link>
                    <Link to="/admin/events/$id/judging" params={{ id: event._id }}>
                      <Button size="sm" variant="ghost">Judging</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}
