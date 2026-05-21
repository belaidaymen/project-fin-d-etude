#!/bin/bash

APP_DIR="/home/runner/workspace/snipe-it-master"
MYSQL_DATA="/home/runner/mysql_data"
MYSQL_RUN="/home/runner/mysql_run"

mkdir -p "$MYSQL_RUN" "$MYSQL_DATA"

# Kill stale mysqld
pkill -x mysqld 2>/dev/null || true
sleep 1
rm -f "$MYSQL_RUN/mysql.sock" "$MYSQL_RUN/mysql.pid" "$MYSQL_RUN/mysql.sock.lock"

# Initialize MySQL data directory if needed
if [ ! -f "$MYSQL_DATA/ibdata1" ]; then
    echo "Initializing MySQL data directory..."
    mysqld --initialize-insecure --user=runner --datadir="$MYSQL_DATA" 2>&1
fi

# Start MySQL in background
echo "Starting MySQL..."
mysqld \
    --user=runner \
    --datadir="$MYSQL_DATA" \
    --socket="$MYSQL_RUN/mysql.sock" \
    --pid-file="$MYSQL_RUN/mysql.pid" \
    --port=3306 \
    --mysqlx=OFF \
    --bind-address=127.0.0.1 \
    >> "$MYSQL_DATA/mysqld.log" 2>&1 &

# Wait for socket to be ready
echo "Waiting for MySQL..."
for i in $(seq 1 30); do
    if [ -S "$MYSQL_RUN/mysql.sock" ] && mysqladmin -S "$MYSQL_RUN/mysql.sock" -u root ping 2>/dev/null | grep -q alive; then
        echo "MySQL ready!"
        break
    fi
    sleep 1
done

# Create DB and user
mysql -S "$MYSQL_RUN/mysql.sock" -u root <<'SQL' 2>/dev/null || true
CREATE DATABASE IF NOT EXISTS snipeit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'snipeit'@'127.0.0.1' IDENTIFIED BY 'snipeit_pass';
CREATE USER IF NOT EXISTS 'snipeit'@'localhost' IDENTIFIED BY 'snipeit_pass';
GRANT ALL PRIVILEGES ON snipeit.* TO 'snipeit'@'127.0.0.1';
GRANT ALL PRIVILEGES ON snipeit.* TO 'snipeit'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "Database configured."

cd "$APP_DIR"

# Generate app key if not set
if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    echo "Generating app key..."
    php artisan key:generate --force
fi

# Storage link
php artisan storage:link 2>/dev/null || true

# Fix storage permissions
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Run migrations
echo "Running migrations..."
php artisan migrate --force 2>&1

# Clear caches
php artisan config:clear 2>&1
php artisan cache:clear 2>&1

echo "Starting Laravel on 0.0.0.0:5000..."
exec php artisan serve --host=0.0.0.0 --port=5000
