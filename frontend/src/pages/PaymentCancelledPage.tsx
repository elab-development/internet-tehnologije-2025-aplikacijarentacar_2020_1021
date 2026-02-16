import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function PaymentCancelledPage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Plaćanje otkazano</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Plaćanje na Stripe-u je otkazano. Rezervacija je i dalje u statusu „Potvrđena” i možeš je platiti kasnije ili je otkazati.
          </p>
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
