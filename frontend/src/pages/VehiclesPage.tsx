import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type {
  Vehicle,
  VehicleListResponse,
  VehicleCreatePayload,
  ReservationCreatePayload,
} from '../types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function VehiclesPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const reserveVehicleId = searchParams.get('reserve')

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null)

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api<VehicleListResponse>('/vehicles')
      setVehicles(res.data ?? [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  useEffect(() => {
    if (reserveVehicleId && vehicles.length > 0) {
      const id = Number(reserveVehicleId)
      const v = vehicles.find((x) => x.id === id)
      if (v) {
        setReserveVehicle(v)
        setReserveModalOpen(true)
        setSearchParams({}, { replace: true })
      }
    }
  }, [reserveVehicleId, vehicles, searchParams, setSearchParams])

  const openReserveModal = (vehicle: Vehicle) => {
    setReserveVehicle(vehicle)
    setReserveModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Vozila</h1>
        {isAdmin && (
          <Button onClick={() => setAddModalOpen(true)}>Dodaj vozilo</Button>
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Učitavanje...
        </div>
      ) : vehicles.length === 0 ? (
        <p className="text-slate-600">Nema vozila.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              onReserve={() => openReserveModal(vehicle)}
              onDelete={fetchVehicles}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <AddVehicleModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false)
            fetchVehicles()
          }}
        />
      )}

      {isAuthenticated && (
        <ReserveModal
          open={reserveModalOpen}
          onClose={() => {
            setReserveModalOpen(false)
            setReserveVehicle(null)
          }}
          vehicle={reserveVehicle}
          onSuccess={() => {
            setReserveModalOpen(false)
            setReserveVehicle(null)
            navigate('/reservations')
          }}
        />
      )}
    </div>
  )
}

function VehicleCard({
  vehicle,
  isAdmin,
  isAuthenticated,
  onReserve,
  onDelete,
}: {
  vehicle: Vehicle
  isAdmin: boolean
  isAuthenticated: boolean
  onReserve: () => void
  onDelete: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleDelete() {
    if (!confirm(`Obrisati vozilo ${vehicle.brand} ${vehicle.model}?`)) return
    setDeleting(true)
    try {
      await api(`/vehicles/${vehicle.id}`, { method: 'DELETE' })
      onDelete()
    } catch {
      setDeleting(false)
    }
  }

  async function handleToggleStatus() {
    setToggling(true)
    try {
      await api(`/vehicles/${vehicle.id}/status?new_status=${!vehicle.available}`, {
        method: 'PUT',
      })
      onDelete()
    } catch {
      setToggling(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          {vehicle.brand} {vehicle.model}
        </CardTitle>
        <span
          className={`text-xs px-2 py-1 rounded ${
            vehicle.available ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {vehicle.available ? 'Dostupno' : 'Zauzeto'}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm">
          <span className="font-medium text-slate-800">{vehicle.price_per_day} €</span> / dan
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {isAuthenticated && (
          <Button
            variant="secondary"
            onClick={onReserve}
            disabled={!vehicle.available}
          >
            Rezerviši
          </Button>
        )}
        {isAdmin && (
          <>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={handleToggleStatus}
              disabled={toggling}
            >
              {vehicle.available ? 'Označi zauzeto' : 'Označi dostupno'}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              isLoading={deleting}
            >
              Obriši
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

function AddVehicleModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [available, setAvailable] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const price = parseFloat(pricePerDay)
    if (Number.isNaN(price) || price < 0) {
      setError('Cena mora biti pozitivan broj.')
      return
    }
    setSubmitting(true)
    try {
      await api('/vehicles', {
        method: 'POST',
        json: {
          brand,
          model,
          price_per_day: price,
          available,
        } as VehicleCreatePayload,
      })
      onSuccess()
      setBrand('')
      setModel('')
      setPricePerDay('')
      setAvailable(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Dodaj vozilo">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <Input
          label="Marka"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />
        <Input
          label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <Input
          label="Cena po danu (€)"
          type="number"
          step="0.01"
          min="0"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="available"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="rounded border-slate-300"
          />
          <label htmlFor="available" className="text-sm text-slate-700">
            Dostupno
          </label>
        </div>
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

const RESERVE_SUCCESS_DELAY_MS = 1800

function ReserveModal({
  open,
  onClose,
  vehicle,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSuccess: () => void
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vehicle) return
    setError('')
    setSuccessMessage(false)
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      setError('Datum završetka mora biti posle datuma početka.')
      return
    }
    setSubmitting(true)
    try {
      await api('/reservations', {
        method: 'POST',
        json: {
          vehicle_id: vehicle.id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        } as ReservationCreatePayload,
      })
      setSuccessMessage(true)
      setStartDate('')
      setEndDate('')
      setTimeout(() => {
        onSuccess()
        setSuccessMessage(false)
      }, RESERVE_SUCCESS_DELAY_MS)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Greška.'
      const isUnavailable =
        /already booked|already booked for|is already booked/i.test(msg) ||
        /overlap|zauzet|unavailable/i.test(msg)
      setError(
        isUnavailable
          ? 'Izabrani auto nije dostupan za izabrani period. Izaberite druge datume ili drugo vozilo.'
          : msg
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!vehicle) return null

  return (
    <Modal open={open} onClose={onClose} title={`Rezervacija: ${vehicle.brand} ${vehicle.model}`}>
      <div className="p-4">
        {successMessage ? (
          <p className="text-green-700 bg-green-50 px-3 py-4 rounded-lg font-medium">
            Rezervacija je uspešno kreirana.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <p className="text-slate-600 text-sm">
              {vehicle.price_per_day} € / dan
            </p>
            <Input
              label="Datum početka"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Datum završetka"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Odustani
              </Button>
              <Button type="submit" isLoading={submitting}>
                Rezerviši
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
