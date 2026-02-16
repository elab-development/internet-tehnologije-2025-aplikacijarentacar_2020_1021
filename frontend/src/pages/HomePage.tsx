import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { Vehicle, VehicleListResponse, ReviewListResponse } from '../types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [reviewsByVehicle, setReviewsByVehicle] = useState<Record<number, ReviewListResponse['data']>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api<VehicleListResponse>('/vehicles')
        if (cancelled) return
        setVehicles(res.data ?? [])
        for (const v of res.data ?? []) {
          try {
            const rev = await api<ReviewListResponse>(`/reviews/vehicle/${v.id}`)
            if (cancelled) return
            setReviewsByVehicle((prev) => ({ ...prev, [v.id]: rev.data ?? [] }))
          } catch {
            setReviewsByVehicle((prev) => ({ ...prev, [v.id]: [] }))
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-800">Car Rental</h1>
        <p className="mt-2 text-slate-600 max-w-xl">
          Iznajmite vozilo po povoljnim cenama. Širok izbor vozila, jednostavna rezervacija i podrška 24/7.
        </p>
        {!isAuthenticated && (
          <p className="mt-2 text-slate-500 text-sm">
            <Link to="/login" className="text-slate-700 font-medium hover:underline">Prijavite se</Link>
            {' ili '}
            <Link to="/register" className="text-slate-700 font-medium hover:underline">registrujte</Link>
            {' da rezervišete.'}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Vozila</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600">
            <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            Učitavanje...
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-slate-600">Trenutno nema vozila.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
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
                <CardContent className="space-y-2">
                  <p className="text-slate-600 text-sm">
                    <span className="font-medium text-slate-800">{vehicle.price_per_day} €</span> / dan
                  </p>
                  <div className="text-sm">
                    <p className="font-medium text-slate-700 mb-1">Recenzije:</p>
                    {(reviewsByVehicle[vehicle.id] ?? []).length === 0 ? (
                      <p className="text-slate-500">Nema recenzija.</p>
                    ) : (
                      <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {(reviewsByVehicle[vehicle.id] ?? []).map((r) => (
                          <li key={r.id} className="text-slate-600">
                            <span className="font-medium">{r.rating}/5</span> – {r.comment}
                            <span className="text-slate-400 text-xs"> ({r.user.full_name})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {isAuthenticated && (
                    <Link to={`/vehicles?reserve=${vehicle.id}`}>
                      <Button variant="secondary">Rezerviši</Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
