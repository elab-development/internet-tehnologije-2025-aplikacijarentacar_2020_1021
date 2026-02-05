import os
from sqlalchemy.orm import Session

from utils.auth import get_password_hash
from database import SessionLocal, engine
from models import Role, Base, User


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

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        admin_user = db.query(User).filter(User.email == "admin@carrental.com").first()
        if not admin_user:
            admin_user = User(
                full_name="Admin",
                email="admin@carrental.com",
                password_hash=get_password_hash("admin123"),
                role_id=admin_role.id,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user successfully created: admin@admin.com / admin123")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()