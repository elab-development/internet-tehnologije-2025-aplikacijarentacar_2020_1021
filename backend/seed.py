from utils.auth import get_password_hash
from database import SessionLocal, engine
from models import Role, Base, User


def seed_data():
    db = SessionLocal()
    try:
        roles = ["admin", "customer", "manager"]

        for role_name in roles:
            exists = db.query(Role).filter(Role.name == role_name).first()
            if not exists:
                new_role = Role(name=role_name)
                db.add(new_role)
                print(f"Role inserted: {role_name}")

        db.commit()
        print("Initial seed successfully completed")

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        manager_role = db.query(Role).filter(Role.name == "manager").first()
        customer_role = db.query(Role).filter(Role.name == "customer").first()
        admin_user = db.query(User).filter(User.email == "admin@admin.com").first()
        manager_user = db.query(User).filter(User.email == "manager@manager.com").first()
        customer_user = db.query(User).filter(User.email == "customer@customer.com").first()
        if not admin_user:
            admin_user = User(
                full_name="Admin",
                email="admin@admin.com",
                password_hash=get_password_hash("admin123"),
                phone_number="+5555555555",
                role_id=admin_role.id,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user successfully created: admin@admin.com / admin123")
        if not manager_user:
            manager_user = User(
                full_name="Manager",
                email="manager@manager.com",
                password_hash=get_password_hash("manager123"),
                phone_number="+5555555555",
                role_id=manager_role.id,
                is_active=True
            )
            db.add(manager_user)
            db.commit()
            print("Manager user successfully created: manager@manager.com / manager123")
        if not customer_user:
            manager_user = User(
                full_name="Customer",
                email="customer@customer.com",
                password_hash=get_password_hash("customer123"),
                phone_number="+5555555555",
                role_id=customer_role.id,
                is_active=True
            )
            db.add(manager_user)
            db.commit()
            print("Customer user successfully created: customer@customer.com / customer123")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()