import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const resId = searchParams.get('res_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const verifyCalled = useRef(false)

  useEffect(() => {
    if (!sessionId || !resId) {
      setStatus('error')
      setMessage('Nedostaju parametri sa Stripe preusmeravanja.')
      return
    }
    if (verifyCalled.current) return
    verifyCalled.current = true
    api<{ status?: string; message?: string }>(
      `/reservations/verify?session_id=${encodeURIComponent(sessionId)}&res_id=${encodeURIComponent(resId)}`
    )
      .then(() => {
        setStatus('success')
      })
      .catch((e) => {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Verifikacija plaćanja nije uspela.')
      })
  }, [sessionId, resId])

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Obrada plaćanja...'}
            {status === 'success' && 'Plaćanje uspešno'}
            {status === 'error' && 'Greška'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Verifikujemo plaćanje...
            </div>
          )}
          {status === 'success' && (
            <p className="text-slate-600">
              Rezervacija je potvrđena. Status je ažuriran na „Plaćeno”.
            </p>
          )}
          {status === 'error' && <p className="text-red-600">{message}</p>}
        </CardContent>
        <CardFooter>
          <Link to="/reservations">
            <Button variant="primary">Nazad na rezervacije</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
