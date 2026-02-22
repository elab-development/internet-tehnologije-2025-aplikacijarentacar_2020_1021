import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db
from models import User, Role, Vehicle, Reservation
from utils.auth import get_password_hash, create_access_token

# ============================================
# TEST DATABASE SETUP
# ============================================

"""
SQLite in-memory db for tests
"""
TEST_DATABASE_URL = "sqlite:///:memory:"


test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


# ============================================
# FIXTURES - Database
# ============================================

@pytest.fixture(scope="function")
def db_session():
    """
    Creates a new database for each test. (scope="function")
    """
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        """This drops all the tables after the test"""
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ============================================
# FIXTURES - Test Data
# ============================================

@pytest.fixture
def create_roles(db_session):
    """
    This function adds roles to the db table
    :param db_session:
    :return:
    """
    roles = ["admin", "manager", "customer"]
    role_responses = {}
    for role_name in roles:
        role = Role(name=role_name)
        db_session.add(role)
        db_session.commit()
        db_session.refresh(role)
        role_responses[role_name] = role

    return role_responses


@pytest.fixture
def admin_user(db_session, create_roles):
    role_admin = create_roles["admin"]
    """Create an admin user"""
    user = User(
        email="admin@test.com",
        password_hash=get_password_hash("admin123"),
        full_name="Admin User",
        phone_number="+11111112",
        role_id=role_admin.id,
        is_active=True
    )
    user_inactive = User(
        email="admin_inactive@test.com",
        password_hash=get_password_hash("admin123"),
        full_name="Admin User",
        phone_number="+11111112",
        role_id=role_admin.id,
        is_active=False
    )
    db_session.add(user)
    db_session.add(user_inactive)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(user_inactive)
    return {
        "user_active": user,
        "user_inactive": user_inactive
    }


@pytest.fixture
def manager_user(db_session, create_roles):
    role_manager = create_roles["manager"]
    """Create a manager user"""
    user = User(
        email="manager@test.com",
        password_hash=get_password_hash("manager123"),
        full_name="Manager User",
        phone_number="+111111111",
        role_id=role_manager.id,
        is_active=True
    )
    user_inactive = User(
        email="manager_inactive@test.com",
        password_hash=get_password_hash("manager123"),
        full_name="Manager User",
        phone_number="+111111111",
        role_id=role_manager.id,
        is_active=False
    )
    db_session.add(user)
    db_session.add(user_inactive)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(user_inactive)
    return {
        "user_active": user,
        "user_inactive": user_inactive
    }


@pytest.fixture
def customer_user(db_session, create_roles):
    role_customer = create_roles["customer"]
    """Create one active and one inactive customer user"""
    user = User(
        email="customer@test.com",
        password_hash=get_password_hash("customer123"),
        full_name="Customer User",
        phone_number="+381601234568",
        role_id=role_customer.id,
        is_active=True
    )
    user_inactive = User(
        email="customer_inactive@test.com",
        password_hash=get_password_hash("customer123"),
        full_name="Customer User",
        phone_number="+381601234568",
        role_id=role_customer.id,
        is_active=False
    )
    db_session.add(user)
    db_session.add(user_inactive)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(user_inactive)
    return {
        "user_active": user,
        "user_inactive": user_inactive
    }


@pytest.fixture
def user_tokens(admin_user, manager_user, customer_user):
    """Generate JWT tokens for all user types"""
    return {
        "admin_token": create_access_token(data={"user_id": admin_user["user_active"].id}),
        "manager_token": create_access_token(data={"user_id": manager_user["user_active"].id}),
        "customer_token": create_access_token(data={"user_id": customer_user["user_active"].id})
    }


@pytest.fixture
def vehicle(db_session):
    """Create a test vehicle"""
    vehicle = Vehicle(
        brand="Audi",
        model="A7",
        price_per_day=50.00,
        available=True
    )
    db_session.add(vehicle)
    db_session.commit()
    db_session.refresh(vehicle)
    return vehicle


@pytest.fixture
def reservation(db_session, customer_user, vehicle):
    """Create a test reservation"""
    from datetime import datetime, timedelta

    reservation = Reservation(
        user_id=customer_user.id,
        vehicle_id=vehicle.id,
        start_date=datetime.utcnow() + timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=5),
        price=200.00,
        total_days=4,
        status="confirmed"
    )
    db_session.add(reservation)
    db_session.commit()
    db_session.refresh(reservation)
    return reservation


# ============================================
# FIXTURES - Mock External Services
# ============================================

@pytest.fixture
def mock_stripe_checkout(monkeypatch):
    """Mock Stripe checkout session"""

    def mock_create_session(*args, **kwargs):
        class MockSession:
            url = "https://checkout.stripe.com/test-session"
            id = "test_session_id"
            payment_status = "paid"

        return MockSession()

    # Mock stripe.checkout.Session.create
    import stripe
    monkeypatch.setattr(
        stripe.checkout.Session,
        "create",
        mock_create_session
    )

    return mock_create_session


@pytest.fixture
def mock_stripe_retrieve(monkeypatch):
    """Mock Stripe session retrieve"""

    def mock_retrieve_session(session_id):
        class MockSession:
            id = session_id
            payment_status = "paid"

        return MockSession()

    import stripe
    monkeypatch.setattr(
        stripe.checkout.Session,
        "retrieve",
        mock_retrieve_session
    )

    return mock_retrieve_session


@pytest.fixture
def mock_telegram(monkeypatch):
    """Mock Telegram notification service"""

    def mock_send_message(message):
        return {"success": True, "message": "Message sent"}

    from service import notification_service
    monkeypatch.setattr(
        notification_service.NotificationService,
        "send_telegram_message",
        mock_send_message
    )

    return mock_send_message


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_auth_headers(token: str) -> dict:
    """
    Help function to create authorization headers
    :param token:
    :return Authorization header:
    """
    return {"Authorization": f"Bearer {token}"}