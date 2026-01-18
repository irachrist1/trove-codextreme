import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

type Criterion = {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
}

export function AdminEventRubricPage() {
  const { id } = useParams({ from: '/admin/events/$id/rubric' })
  const { success, error } = useToast()
  const rubric = useQuery(api.judging.getRubric, { eventId: id as any })
  const createRubric = useMutation(api.judging.createRubric)
  const updateRubric = useMutation(api.judging.updateRubric)
  const [criteria, setCriteria] = useState<Criterion[]>([])

  useEffect(() => {
    if (rubric?.criteria) {
      setCriteria(rubric.criteria as Criterion[])
    }
  }, [rubric])

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, name: 'New criterion', description: '', maxScore: 10, weight: 1 },
    ])
  }

  const updateField = (index: number, field: keyof Criterion, value: string | number) => {
    setCriteria((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const saveRubric = async () => {
    try {
      if (rubric?._id) {
        await updateRubric({ rubricId: rubric._id, criteria })
      } else {
        await createRubric({ eventId: id as any, criteria })
      }
      success('Rubric saved')
    } catch (err: any) {
      error(err?.message || 'Failed to save rubric')
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Rubric"
          description="Define judging criteria and weights."
          actions={<Button onClick={addCriterion}>Add criterion</Button>}
        />

        <Card>
          {criteria.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">
              No rubric yet. Add criteria to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={criterion.id} className="grid md:grid-cols-5 gap-3 p-4 border border-[var(--color-gray-100)] rounded-xl">
                  <Input
                    label="Name"
                    value={criterion.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={criterion.description}
                    onChange={(e) => updateField(index, 'description', e.target.value)}
                  />
                  <Input
                    label="Max score"
                    type="number"
                    value={criterion.maxScore}
                    onChange={(e) => updateField(index, 'maxScore', Number(e.target.value))}
                  />
                  <Input
                    label="Weight"
                    type="number"
                    value={criterion.weight}
                    onChange={(e) => updateField(index, 'weight', Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button
              className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
              onClick={saveRubric}
            >
              Save rubric
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  )
}
