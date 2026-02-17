import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { UserAdminPanel } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminPanel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const list = await api<UserAdminPanel[]>('/admin/users')
      setUsers(Array.isArray(list) ? list : [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleDelete(userId: number, fullName: string) {
    if (!confirm(`Obrisati korisnika "${fullName}"?`)) return
    try {
      await api(`/admin/users/${userId}`, { method: 'DELETE' })
      fetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška pri brisanju.')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Korisnici</h1>
        <Input
          type="text"
          placeholder="Pretraži korisnike..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Učitavanje...
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-slate-600">
          {searchQuery ? 'Nema rezultata za pretragu.' : 'Nema korisnika.'}
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lista korisnika {searchQuery && `(${filteredUsers.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Ime</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Telefon</th>
                    <th className="px-4 py-3 font-medium">Uloga</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">{u.phone_number}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                          {u.role.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.is_active ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          className="text-sm"
                          onClick={() => handleDelete(u.id, u.full_name)}
                        >
                          Obriši
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
