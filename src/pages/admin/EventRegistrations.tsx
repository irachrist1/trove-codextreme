import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'

export function AdminEventRegistrationsPage() {
  const { id } = useParams({ from: '/admin/events/$id/registrations' })
  const { success, error } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const registrations = useQuery(api.registrations.listByEvent, { eventId: id as any }) || []
  const updateStatus = useMutation(api.registrations.updateStatus)
  const checkIn = useMutation(api.registrations.checkIn)

  const filtered = registrations.filter((reg) =>
    reg.user?.displayName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatus = async (registrationId: string, status: string) => {
    try {
      await updateStatus({ registrationId: registrationId as any, status })
      success('Status updated')
    } catch (err: any) {
      error(err?.message || 'Failed to update')
    }
  }

  const handleCheckIn = async (registrationId: string) => {
    try {
      if (!user) return
      await checkIn({ registrationId: registrationId as any, checkedInBy: user._id as any })
      success('Checked in')
    } catch (err: any) {
      error(err?.message || 'Check-in failed')
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Registrations"
          description="Manage registrations for this event."
          actions={
            <Input
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        />

        <Card>
          {filtered.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">No registrations found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((reg) => (
                <div key={reg._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-[var(--color-gray-100)] rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--color-black-900)]">{reg.user?.displayName || 'Unknown'}</p>
                    <p className="text-sm text-[var(--color-gray-400)]">{reg.user?.skills?.join(', ')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="default">{reg.status}</Badge>
                    <Button size="sm" variant="secondary" onClick={() => handleStatus(reg._id, 'approved')}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(reg._id, 'cancelled')}>Cancel</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCheckIn(reg._id)}>Check in</Button>
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
