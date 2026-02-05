FROM python:3.11-slim

# Instaliraj netcat (treba nam za nc komandu u entrypoint-u)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Daj dozvolu za izvršavanje skripte
RUN chmod +x scripts/migrations_initializer.sh


# Pokreni entrypoint umesto direktno uvicorn-a
ENTRYPOINT ["sh", "./scripts/migrations_initializer.sh"]