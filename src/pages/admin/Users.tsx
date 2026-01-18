import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const roleOptions = ['admin', 'organizer', 'judge', 'hacker']

export function AdminUsersPage() {
  const { success, error } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const searchResults = useQuery(
    api.users.search,
    searchTerm ? { searchTerm } : undefined
  )
  const defaultUsers = useQuery(api.users.listByRole, { role: 'hacker' }) || []
  const users = useMemo(() => (searchTerm ? searchResults || [] : defaultUsers), [searchTerm, searchResults, defaultUsers])
  const updateRoles = useMutation(api.users.updateRoles)

  const handleRoleToggle = async (userId: string, role: string, currentRoles: string[]) => {
    const nextRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role]
    try {
      await updateRoles({ userId: userId as any, roles: nextRoles })
      success('Roles updated')
    } catch (err: any) {
      error(err?.message || 'Failed to update roles')
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Users"
          description="Search users and manage roles."
          actions={
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          }
        />

        <Card>
          {users.length === 0 ? (
            <div className="text-sm text-[var(--color-gray-400)]">No users found.</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user._id} className="p-4 border border-[var(--color-gray-100)] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-[var(--color-black-900)]">{user.displayName}</p>
                      <p className="text-sm text-[var(--color-gray-400)]">{user.email}</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      Active
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map((role) => (
                      <label key={role} className="flex items-center gap-2 text-sm text-[var(--color-black-800)]">
                        <input
                          type="checkbox"
                          checked={user.roles.includes(role)}
                          onChange={() => handleRoleToggle(user._id, role, user.roles)}
                        />
                        {role}
                      </label>
                    ))}
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
