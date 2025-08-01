#!/bin/bash

# Load .env file from the parent directory of scripts
source "$(dirname "$0")/../.env"

# Define backup file name with current date and time
BACKUP_FILE="$BACKUP_MONEYFLOW_DIR/moneyflow_db_backup_$(date +'%Y-%m-%d_%H-%M-%S').dump"

# Ensure the logs directory exists
LOG_DIR=$(dirname "$BACKUP_MONEYFLOW_LOG")
if [ ! -d "$LOG_DIR" ]; then
  mkdir -p "$LOG_DIR"
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Created logs directory: $LOG_DIR"
fi

# Log start of execution
echo "$(date +'%Y-%m-%d %H:%M:%S') - Initializing moneyflow database backup..." >> "$BACKUP_MONEYFLOW_LOG"

# Check if the backup directory exists
if [ ! -d "$BACKUP_MONEYFLOW_DIR" ]; then
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Backup directory does not exist. Creating directory..." >> "$BACKUP_MONEYFLOW_LOG"
  mkdir -p "$BACKUP_MONEYFLOW_DIR"
fi

# Remove the oldest backup files if the number of backups exceeds the limit
while [ "$(ls -1 "$BACKUP_MONEYFLOW_DIR" | wc -l)" -ge "$MAX_BACKUPS" ]; do
  OLDEST_BACKUP=$(ls -t "$BACKUP_MONEYFLOW_DIR" | tail -1)
  rm "$BACKUP_MONEYFLOW_DIR/$OLDEST_BACKUP"
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Removed old backup file: $OLDEST_BACKUP" >> "$BACKUP_MONEYFLOW_LOG"
done

# Display loading animation while the backup process is running
echo "Running backup process... "
SPINNER="/-\|"
while true; do   # Continuously show spinner until the backup process finishes
  echo -n "${SPINNER:i%4:1}"   # Display the current spinner frame
  sleep 0.25                  # Slow down the spinner to make it visible
  echo -ne "\b"               # Move cursor back to overwrite the spinner character
  docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_MONEYFLOW_NAME" -Fc -E utf-8 > "$BACKUP_FILE" && break
done

# Check if the backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Backup successful: $BACKUP_FILE" >> "$BACKUP_MONEYFLOW_LOG"
  echo "Backup completed successfully!"   # Display success message
else
  echo "$(date +'%Y-%m-%d %H:%M:%S') - Backup failed." >> "$BACKUP_MONEYFLOW_LOG"
  [ -f "$BACKUP_FILE" ] && rm "$BACKUP_FILE"
  echo "Backup failed!"    # Display failure message
fi
