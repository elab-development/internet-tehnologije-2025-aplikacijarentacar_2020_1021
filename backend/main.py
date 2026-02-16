from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from routers import auth, vehicle, reservations, review, admin
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Car Rental API",
    description="API za iznajmljivanje vozila",
    version="1.0.0"
)

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(vehicle.router)
app.include_router(reservations.router)
app.include_router(review.router)


@app.get("/")
def healthcheck():
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    error_msg = exc.errors()[0].get("msg")

    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": error_msg
        }
    )