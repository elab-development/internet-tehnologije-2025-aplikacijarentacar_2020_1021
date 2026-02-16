import stripe
import os
from fastapi import HTTPException
from dotenv import load_dotenv
import os

load_dotenv()


"""Load stripe key from env variable"""
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
# Stripe redirects here after payment; use same origin as frontend (e.g. http://localhost:5173 for Vite)
fe_url = os.getenv("FRONTEND_URL", "http://localhost:5173")


class PaymentService:
    @staticmethod
    def create_checkout_session(reservation_id: int, amount: float, vehicle: str):

        try:
            """Create stripe checkout session"""
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {'name': f"Rezervacija #{reservation_id}", 'description': vehicle},
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{fe_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&res_id={reservation_id}",
                cancel_url=f"{fe_url}/payment-cancelled",
            )
            return session.url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    @staticmethod
    def verify_stripe_session(session_id: str):
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except Exception:
            return None