import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

export function AdminEventJudgingPage() {
  const { id } = useParams({ from: '/admin/events/$id/judging' })
  const { success, error } = useToast()
  const submissions = useQuery(api.submissions.listByEvent, { eventId: id as any, status: 'submitted' }) || []
  const judges = useQuery(api.users.listByRole, { role: 'judge' }) || []
  const assignments = useQuery(api.judging.listAssignments, { eventId: id as any }) || []
  const assignSubmissions = useMutation(api.judging.assignSubmissions)
  const [judgeId, setJudgeId] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const toggleSubmission = (submissionId: string) => {
    setSelected((prev) =>
      prev.includes(submissionId) ? prev.filter((id) => id !== submissionId) : [...prev, submissionId]
    )
  }

  const handleAssign = async () => {
    if (!judgeId || selected.length === 0) return
    try {
      await assignSubmissions({
        eventId: id as any,
        judgeId: judgeId as any,
        submissionIds: selected as any,
      })
      success('Assignments updated')
    } catch (err: any) {
      error(err?.message || 'Failed to assign submissions')
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Judging assignments"
          description="Assign submissions to judges and monitor progress."
        />

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--color-black-800)]">Select judge</label>
              <select
                className="border border-[var(--color-gray-100)] rounded-xl px-3 py-2 bg-[var(--color-white)]"
                value={judgeId}
                onChange={(e) => setJudgeId(e.target.value)}
              >
                <option value="">Choose a judge</option>
                {judges.map((judge) => (
                  <option key={judge._id} value={judge._id}>
                    {judge.displayName}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAssign}
              className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
            >
              Assign selected
            </Button>
          </div>
        </Card>

        <Card>
          {submissions.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">No submissions to assign.</div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <label
                  key={submission._id}
                  className="flex items-center gap-3 p-3 border border-[var(--color-gray-100)] rounded-xl"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(submission._id)}
                    onChange={() => toggleSubmission(submission._id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--color-black-900)]">{submission.projectName}</p>
                    <p className="text-sm text-[var(--color-gray-400)]">{submission.team?.name}</p>
                  </div>
                  <Badge variant="default">{submission.status}</Badge>
                </label>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold text-[var(--color-black-900)] mb-3">Current assignments</h3>
          {assignments.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">No assignments yet.</div>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between p-3 border border-[var(--color-gray-100)] rounded-xl">
                  <span className="text-sm text-[var(--color-black-900)]">
                    {assignment.judge?.displayName || 'Unknown judge'}
                  </span>
                  <span className="text-sm text-[var(--color-gray-400)]">
                    {assignment.completedCount}/{assignment.totalCount} completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}
