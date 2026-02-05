import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Role, Base


def seed_data():
    db = SessionLocal()
    try:
        # 1. Definisanje uloga (Requirement: 3 tipa korisnika)
        roles = ["admin", "user", "guest"]

        for role_name in roles:
            # Proveri da li uloga već postoji
            exists = db.query(Role).filter(Role.name == role_name).first()
            if not exists:
                new_role = Role(name=role_name)
                db.add(new_role)
                print(f"Role inserted: {role_name}")

        db.commit()
        print("Initial seed successfully completed")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()