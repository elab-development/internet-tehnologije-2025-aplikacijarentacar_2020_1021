import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type {
  ReservationListResponse,
  ReservationResponse,
  ReservationStatus,
  ReservationCreatePayload,
} from '../types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Potvrđena',
  cancelled: 'Otkazana',
  completed: 'Završena',
  payment_processed: 'Plaćeno',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function ReservationsPage() {
  const { isAdmin } = useAuth()
  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReservations = useCallback(async () => {
    try {
      const res = await api<ReservationListResponse>('/reservations')
      setReservations(res.data ?? [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Rezervacije</h1>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Učitavanje...
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-slate-600">Nema rezervacija.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reservations.map((res) => (
            <ReservationCard
              key={res.id}
              reservation={res}
              isAdmin={isAdmin}
              onUpdate={fetchReservations}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReservationCard({
  reservation,
  isAdmin,
  onUpdate,
}: {
  reservation: ReservationResponse
  isAdmin: boolean
  onUpdate: () => void
}) {
  const [statusLoading, setStatusLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  async function handleStatusChange(newStatus: ReservationStatus) {
    setStatusLoading(true)
    try {
      await api(`/reservations/${reservation.id}/status`, {
        method: 'PUT',
        json: { status: newStatus },
      })
      onUpdate()
    } catch {
      setStatusLoading(false)
    }
  }

  async function handlePay() {
    setPayLoading(true)
    try {
      const res = await api<{ checkout_url: string }>(`/reservations/${reservation.id}/pay`, {
        method: 'POST',
      })
      if (res.checkout_url) {
        window.location.href = res.checkout_url
        return
      }
      setPayLoading(false)
    } catch {
      setPayLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Obrisati ovu rezervaciju?')) return
    setDeleteLoading(true)
    try {
      await api(`/reservations/${reservation.id}`, { method: 'DELETE' })
      onUpdate()
    } catch {
      setDeleteLoading(false)
    }
  }

  const canCancel = reservation.status === 'confirmed'
  const canPay = reservation.status === 'confirmed'

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {reservation.vehicle.brand} {reservation.vehicle.model}
          </CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded ${
              reservation.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : reservation.status === 'payment_processed' || reservation.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
            }`}
          >
            {STATUS_LABELS[reservation.status] ?? reservation.status}
          </span>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-slate-600">
            {formatDate(reservation.start_date)} – {formatDate(reservation.end_date)}
          </p>
          <p className="font-medium text-slate-800">{reservation.price} €</p>
          {isAdmin && (
            <p className="text-slate-500">
              {reservation.user.full_name} · {reservation.user.email}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={() => setEditModalOpen(true)}
              >
                Izmeni
              </Button>
              <StatusSelect
                value={reservation.status as ReservationStatus}
                disabled={statusLoading}
                onChange={handleStatusChange}
              />
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteLoading}
                isLoading={deleteLoading}
              >
                Obriši
              </Button>
            </>
          )}
          {!isAdmin && canCancel && (
            <Button
              variant="danger"
              onClick={() => handleStatusChange('cancelled')}
              disabled={statusLoading}
              isLoading={statusLoading}
            >
              Otkaži
            </Button>
          )}
          {!isAdmin && canPay && (
            <Button
              variant="primary"
              onClick={handlePay}
              disabled={payLoading}
              isLoading={payLoading}
            >
              Plati
            </Button>
          )}
        </CardFooter>
      </Card>

      {isAdmin && (
        <EditReservationModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          reservation={reservation}
          onSuccess={() => {
            setEditModalOpen(false)
            onUpdate()
          }}
        />
      )}
    </>
  )
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: ReservationStatus
  disabled: boolean
  onChange: (status: ReservationStatus) => void
}) {
  const statuses: ReservationStatus[] = ['confirmed', 'cancelled', 'completed', 'payment_processed']
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ReservationStatus)}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}

function EditReservationModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  reservation: ReservationResponse
  onSuccess: () => void
}) {
  const [startDate, setStartDate] = useState(() =>
    reservation.start_date.slice(0, 10)
  )
  const [endDate, setEndDate] = useState(() =>
    reservation.end_date.slice(0, 10)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      setError('Datum završetka mora biti posle datuma početka.')
      return
    }
    setSubmitting(true)
    try {
      await api(`/reservations/${reservation.id}`, {
        method: 'PUT',
        json: {
          vehicle_id: reservation.vehicle.id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        } as ReservationCreatePayload,
      })
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Greška.'
      const isUnavailable =
        /already booked|already booked for|is already booked/i.test(msg) ||
        /overlap|zauzet|unavailable/i.test(msg)
      setError(
        isUnavailable
          ? 'Izabrani auto nije dostupan za izabrani period. Izaberite druge datume.'
          : msg
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Izmena rezervacije">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <p className="text-slate-600 text-sm">
          Vozilo: {reservation.vehicle.brand} {reservation.vehicle.model}
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <Input
          label="Datum početka"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          label="Datum završetka"
          type="date"
          min={startDate}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Odustani
          </Button>
          <Button type="submit" isLoading={submitting}>
            Sačuvaj
          </Button>
        </div>
      </form>
    </Modal>
  )
}
