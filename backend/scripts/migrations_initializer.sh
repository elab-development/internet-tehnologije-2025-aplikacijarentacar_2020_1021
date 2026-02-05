#!/bin/sh


while ! nc -z db 5432; do
  sleep 0.1
done

echo "Starting migrations"
alembic upgrade head

echo "
Inserting data..."
python seed.py

echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload