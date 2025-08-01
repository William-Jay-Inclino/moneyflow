#!/bin/bash

# Load environment variables from .env
source "$(dirname "$0")/../.env"

# Ensure backup file is provided
if [ -z "$1" ]; then
  echo "Error: No backup file provided."
  echo "Usage: ./restore_moneyflow_db.sh <backup_filename>"
  exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="$BACKUP_MONEYFLOW_DIR/$BACKUP_FILE"

# Check if the backup file exists
if [ ! -f "$BACKUP_PATH" ]; then
  echo "Error: Backup file does not exist at $BACKUP_PATH."
  exit 1
fi

# Docker container and database information
DB_CONTAINER_NAME=$DB_CONTAINER_NAME
DB_USER=$DB_USER
DB_MONEYFLOW_NAME=$DB_MONEYFLOW_NAME

# Start restore process
echo "$(date +'%Y-%m-%d %H:%M:%S') - Initializing moneyflow database restore..."

# Check if the database container is running
docker ps | grep -q "$DB_CONTAINER_NAME"
if [ $? -ne 0 ]; then
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Error: Database container $DB_CONTAINER_NAME is not running."
  exit 1
fi

# Copy the backup file into the Docker container
echo "$(date +'%Y-%m-%d %H:%M:%S') - Copying backup file to Docker container..."
docker cp "$BACKUP_PATH" "$DB_CONTAINER_NAME:/tmp/backup.dump"

# Run restore command inside Docker container
echo "$(date +'%Y-%m-%d %H:%M:%S') - Restoring database from /tmp/backup.dump..."
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_MONEYFLOW_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i "$DB_CONTAINER_NAME" pg_restore -U "$DB_USER" -d "$DB_MONEYFLOW_NAME" -v /tmp/backup.dump

# Check the restore status
if [ $? -eq 0 ]; then
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Successfully restored the database from $BACKUP_PATH."
else
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Failed to restore the database."
  exit 1
fi

echo "$(date +'%Y-%m-%d %H:%M:%S') - Moneyflow database restore process completed."
