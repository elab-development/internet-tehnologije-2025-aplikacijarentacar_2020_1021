from sqlalchemy.orm import Session
from models import Reservation


def link_guest_reservations(db: Session, email: str, user_id: int):
    """
    Finds all reservations made with a specific email that don't have a user_id
    assigned yet, and links them to the newly registered user.
    """
    db.query(Reservation).filter(
        Reservation.email == email, Reservation.user_id == None
    ).update({"user_id": user_id, "non_existing_user": False, "email": None, "full_name": None, "phone_number": None})
    db.commit()