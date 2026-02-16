# Car Rental System

A modern web application for vehicle rentals, built with a client-server architecture focusing on automated payment processing and real-time administrative notifications.

## Key Features
- **Full CRUD Operations:** Manage vehicles, users, and reservations.
- **Secure Payments:** Integrated **Stripe API** (Checkout Flow).
- **Instant Notifications:** Automated **Telegram Bot** system for real-time payment alerts.
- **Containerization:** Entire environment is orchestrated using **Docker & Docker Compose**.
- **Self-Documenting API:** Interactive Swagger UI for testing backend endpoints.

---

## Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic

### Frontend
- **Framework:** React
- **State Management:** [e.g., Redux / Context API]
- **Styling:** [e.g., Tailwind CSS]

### External API Integrations
1. **Stripe API:** Handles secure credit card processing and checkout session management.
2. **Telegram Bot API:** Dispatches transactional messages to the administrator upon successful payment.

---

## Getting Started

The system is fully dockerized, meaning all dependencies (Database, Backend, and Frontend) are pre-configured.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/car-rental-system.git](https://github.com/your-username/car-rental-system.git)
cd car_rental_system
```

### 2. Configure Environment variables
Create a .env file in the root directory:

``` code_fragment
#Frontend URL
FRONTEND_URL="https://localhost:3000"

#Secret Key for JWT tokens
SECRET_KEY=your_secret_key

#Stripe credentials
STRIPE_SECRET_KEY=sk_test_your_secret_key

#Database Configuration
DATABASE_URL_ALEMBIC="postgresql+psycopg2://user:password@db:5432/car_rental"
DATABASE_URL="postgresql://user:password@db:5432/car_rental"

#Telegram Bot Credentials
TELEGRAM_BOT_API_TOKEN=your_bot_token
TELEGRAM_BOT_CHAT_ID=your_chat_id
```

### 3. Run the application
```bash
docker-compose up --build
```

Once the build is complete, the services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs (Swagger UI)


## Project structure
```plain_text
.
├── backend/            # FastAPI application (Logic, DB, API)
│   |
│   │── models/     # SQL Database Models
|   |── migrations/ # Alembic migrations
│   ├── routers/    # API Route Handlers
│   ├── services/   # External Integrations (Stripe, Telegram)
│   └── main.py
│   └── Dockerfile
├── frontend/           # Client-side application
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml  # Multi-container orchestration
└── .env        # Environment variable template
```

## Payment and Notification Flow
1. Reservation: The user selects a vehicle and creates a booking.
2. Payment Initiation: The backend generates a Stripe Checkout session and returns a secure URL.
3. Verification: Upon payment, Stripe redirects the user to the /verify route.
4. Automation: The backend verifies the session with Stripe, updates the database status to payment_processed, and triggers a Telegram notification to the admin with transaction details.