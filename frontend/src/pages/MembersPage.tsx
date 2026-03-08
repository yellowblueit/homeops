import { useState } from 'react'
import { useHomeContext } from '@/contexts/HomeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Mail, Loader2 } from 'lucide-react'
import { MEMBER_ROLES } from '@/lib/constants'

export function MembersPage() {
  const { selectedHome } = useHomeContext()
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'contributor' | 'viewer'>('contributor')

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', selectedHome?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_members')
        .select(`
          *,
          profile:profiles(full_name, email, avatar_url)
        `)
        .eq('home_id', selectedHome!.id)
      if (error) throw error
      return data
    },
    enabled: !!selectedHome,
  })

  const createInvitation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !selectedHome) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('invitations')
        .insert({
          home_id: selectedHome.id,
          invited_by: user.id,
          invited_email: inviteEmail,
          role: inviteRole,
        })
      if (error) throw error
    },
    onSuccess: () => {
      setShowInvite(false)
      setInviteEmail('')
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  if (!selectedHome) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Select a home to manage members</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Invite a Member</h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              createInvitation.mutate()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-input py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as 'contributor' | 'viewer')}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {MEMBER_ROLES.filter(r => r.value !== 'owner').map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label} - {r.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createInvitation.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {createInvitation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Current Members</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members?.map((member) => {
              const profile = member.profile as any
              return (
                <div key={member.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {(profile?.full_name?.[0] || profile?.email?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{profile?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                    {member.role}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
