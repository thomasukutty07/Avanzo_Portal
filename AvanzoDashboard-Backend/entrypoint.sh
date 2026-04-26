#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
python -c '
import socket, time, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# We parse from DATABASE_URL or assume "db" and 5432
db_url = os.environ.get("DATABASE_URL", "")
host = "db"
port = 5432
if "://" in db_url:
    try:
        # Very basic parsing for postgres://user:pass@host:port/db
        parts = db_url.split("@")[-1].split("/")[0].split(":")
        host = parts[0]
        if len(parts) > 1:
            port = int(parts[1])
    except:
        pass

while True:
    try:
        s.connect((host, port))
        s.close()
        break
    except socket.error:
        time.sleep(0.5)
'
echo "PostgreSQL started"

ROLE=${CONTAINER_ROLE:-web}

if [ "$ROLE" = "web" ]; then
    echo "Running shared schema migrations..."
    python manage.py migrate_schemas --shared
    
    echo "Running tenant migrations..."
    python manage.py migrate_schemas --tenant
    
    echo "Starting Daphne server..."
    exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
elif [ "$ROLE" = "celery_worker" ]; then
    echo "Starting Celery worker..."
    exec celery -A config worker -l INFO
elif [ "$ROLE" = "celery_beat" ]; then
    # Remove celerybeat.pid if it exists
    rm -f celerybeat.pid
    echo "Starting Celery beat..."
    exec celery -A config beat -l INFO
else
    # Allow executing custom commands (like python manage.py shell)
    exec "$@"
fi
