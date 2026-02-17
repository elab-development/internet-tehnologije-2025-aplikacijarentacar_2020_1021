import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { ReviewListResponse, ReviewData } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

export function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api<ReviewListResponse>('/reviews')
      setReviews(res.data ?? [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška u učitavanju.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Recenzije</h1>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Učitavanje...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-600">Nema recenzija.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {review.vehicle.brand} {review.vehicle.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-800">{review.rating}/5</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? 'text-amber-400' : 'text-slate-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{review.comment}</p>
                <p className="text-slate-400 text-xs">— {review.user.full_name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
