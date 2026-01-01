#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load .env file if it exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Get database configuration from environment variables with defaults
DB_TYPE=${DB_TYPE:-postgres}
DB_USER=${DB_USER:-avenir_user}
DB_NAME=${DB_NAME:-avenir_db}
DB_PASSWORD=${DB_PASSWORD:-avenir_password}

# Validate DB_TYPE
if [ "$DB_TYPE" != "postgres" ] && [ "$DB_TYPE" != "mysql" ]; then
    echo -e "${RED}Invalid DB_TYPE: $DB_TYPE. Must be 'postgres' or 'mysql'${NC}"
    exit 1
fi

# Set container name and database paths based on DB_TYPE
if [ "$DB_TYPE" = "postgres" ]; then
    CONTAINER_NAME="avenir-postgres"
    DB_DIR="infrastructure/database/postgres"
    PROFILE="postgres"
    DB_TYPE_DISPLAY="PostgreSQL"
else
    CONTAINER_NAME="avenir-mysql"
    DB_DIR="infrastructure/database/mysql"
    PROFILE="mysql"
    DB_TYPE_DISPLAY="MySQL"
fi

echo -e "${BLUE}Resetting ${DB_TYPE_DISPLAY} database...${NC}"
echo -e "${YELLOW}Using: DB_USER=$DB_USER, DB_NAME=$DB_NAME${NC}"

# Check if container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${RED}Container $CONTAINER_NAME is not running${NC}"
    echo -e "${YELLOW}Start it with: docker compose --profile $PROFILE up -d${NC}"
    exit 1
fi

echo -e "${YELLOW}Dropping and recreating database...${NC}"

# Drop and recreate database
if [ "$DB_TYPE" = "postgres" ]; then
    # PostgreSQL: Drop and recreate database
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres <<EOF
-- Terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();

-- Drop and recreate database
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF
else
    # MySQL: Drop and recreate database
    docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASSWORD <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to reset database${NC}"
    exit 1
fi

echo -e "${GREEN}Database dropped and recreated${NC}"

echo -e "${YELLOW}Applying initial schema (init.sql)...${NC}"

# Apply init.sql
if [ "$DB_TYPE" = "postgres" ]; then
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < $DB_DIR/init.sql
else
    docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $DB_DIR/init.sql
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to apply initial schema${NC}"
    exit 1
fi

echo -e "${GREEN}Initial schema applied${NC}"

echo -e "${YELLOW}Applying migrations...${NC}"

# Apply migrations in order
for migration in $DB_DIR/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo -e "${YELLOW}  Applying $(basename $migration)...${NC}"
        
        if [ "$DB_TYPE" = "postgres" ]; then
            docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$migration"
        else
            docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "$migration"
        fi

        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to apply migration: $(basename $migration)${NC}"
            exit 1
        fi

        echo -e "${GREEN}  Applied $(basename $migration)${NC}"
    fi
done

echo -e "${GREEN}All migrations applied${NC}"

echo -e "${YELLOW}Loading fixtures (seed data)...${NC}"

# Define fixtures in correct dependency order
# 1. users first (everything depends on users)
# 2. stocks (portfolios, order_book, trades depend on stocks)
# 3. portfolios, order_book, trades, user_actions (depend on users and stocks)
# 4. chat last (depends on users)
FIXTURES=(
    "users_fixtures.sql"
    "stocks_fixtures.sql"
    "portfolios_fixtures.sql"
    "order_book_fixtures.sql"
    "trades_fixtures.sql"
    "hugo_laurent_trades_fixtures.sql"
    "user_actions_fixtures.sql"
    "chat_fixtures.sql"
)

# Apply fixtures in the specified order
for fixture_name in "${FIXTURES[@]}"; do
    fixture="$DB_DIR/fixtures/$fixture_name"
    if [ -f "$fixture" ]; then
        echo -e "${YELLOW}  Loading $fixture_name...${NC}"

        if [ "$DB_TYPE" = "postgres" ]; then
            docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$fixture"
        else
            docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < "$fixture"
        fi

        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to load fixture: $fixture_name${NC}"
            exit 1
        fi

        echo -e "${GREEN}  Loaded $fixture_name${NC}"
    else
        echo -e "${YELLOW}  Skipping $fixture_name (file not found)${NC}"
    fi
done

echo -e "${GREEN}All fixtures loaded${NC}"

echo -e "${GREEN}Database reset complete!${NC}"
echo -e "${BLUE}Database is ready with schema + migrations + fixtures${NC}"
