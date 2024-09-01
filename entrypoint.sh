#!/bin/bash
set -e

# Wait for the database to be available
/app/wait-for-it.sh db:3306 -- echo "Database is up"

# Run Prisma migrations
npx prisma migrate dev --name init --skip-generate

# Seed the database
npm run seed

# Start the application
exec npm run dev
