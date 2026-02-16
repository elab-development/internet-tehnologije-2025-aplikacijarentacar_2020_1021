import { useCallback, useEffect, useState } from 'react'
import { Chart } from 'react-google-charts'
import { api } from '../lib/api'
import type { AdminStatsResponse, StatsTimeframe } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

const TIMEFRAME_OPTIONS: { value: StatsTimeframe; label: string }[] = [
  { value: 'today', label: 'Danas' },
  { value: 'last_7_days', label: 'Poslednjih 7 dana' },
  { value: 'last_30_days', label: 'Poslednjih 30 dana' },
  { value: 'all_time', label: 'Sve' },
]

export function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<StatsTimeframe>('last_30_days')
  const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<AdminStatsResponse>('/admin/stats')
      setStats(res.data)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="inline-block w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-red-600">{error || 'Nema podataka.'}</p>
      </div>
    )
  }

  const { counters, charts } = stats
  const revKey = timeframe === 'all_time' ? 'total_all_time' : timeframe
  const reservationsCount = counters.reservations[timeframe === 'all_time' ? 'all_time' : timeframe]
  const usersCount = counters.users[timeframe === 'all_time' ? 'all_time' : timeframe]
  const revenueValue = counters.revenue[revKey as keyof typeof counters.revenue]
  const revenue = typeof revenueValue === 'number' ? revenueValue : 0

  const revenueChartData = [
    ['Mesec', 'Prihod (€)'],
    ...[...(charts.revenue_history || [])]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((r) => [r.month, r.revenue]),
  ]

  const topVehiclesData = [
    ['Vozilo', 'Iznajmljivanja'],
    ...(charts.top_vehicles || []).map((v) => [v.name, v.rentals]),
  ]

  const revenueChartOptions = {
    title: '',
    hAxis: { title: 'Mesec' },
    vAxis: { title: 'Prihod (€)', minValue: 0 },
    legend: { position: 'none' },
    chartArea: { width: '70%', height: '65%' },
  }

  const topVehiclesChartOptions = {
    title: '',
    hAxis: { title: 'Broj iznajmljivanja', minValue: 0 },
    vAxis: { title: 'Vozilo' },
    legend: { position: 'none' },
    chartArea: { width: '60%', height: '75%' },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeframe === opt.value
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Rezervacije ({TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{reservationsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Novi korisnici ({TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{usersCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">
              Prihod ({TIMEFRAME_OPTIONS.find((o) => o.value === timeframe)?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{revenue.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-500">Ukupno vozila</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{counters.total_vehicles}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prihod po mesecima</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length <= 1 ? (
              <p className="text-slate-500 text-sm py-8 text-center">Nema podataka o prihodu.</p>
            ) : (
              <div className="h-64">
                <Chart
                  chartType="LineChart"
                  width="100%"
                  height="256px"
                  data={revenueChartData}
                  options={revenueChartOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 vozila po broju iznajmljivanja</CardTitle>
          </CardHeader>
          <CardContent>
            {topVehiclesData.length <= 1 ? (
              <p className="text-slate-500 text-sm py-8 text-center">Nema podataka.</p>
            ) : (
              <div className="h-64">
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="256px"
                  data={topVehiclesData}
                  options={topVehiclesChartOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
