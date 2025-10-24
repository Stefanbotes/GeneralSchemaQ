#!/bin/bash

# Production Question Seeding Script
# This script calls the protected API endpoint to seed questions in production

set -e

echo "🌱 NTAQV2 Production Question Seeding"
echo "======================================"
echo ""

# Check if required environment variables are set
if [ -z "$PRODUCTION_URL" ]; then
    echo "❌ Error: PRODUCTION_URL environment variable not set"
    echo "   Example: export PRODUCTION_URL=https://your-app.vercel.app"
    exit 1
fi

if [ -z "$ADMIN_SECRET_KEY" ]; then
    echo "❌ Error: ADMIN_SECRET_KEY environment variable not set"
    echo "   This should match the ADMIN_SECRET_KEY in your Vercel environment variables"
    exit 1
fi

echo "🔍 Checking current seed status..."
echo ""

# Check current status
STATUS_RESPONSE=$(curl -s "$PRODUCTION_URL/api/admin/seed-questions")
echo "Current Status:"
echo "$STATUS_RESPONSE" | jq .
echo ""

# Check if already seeded
IS_SEEDED=$(echo "$STATUS_RESPONSE" | jq -r '.data.isSeeded')

if [ "$IS_SEEDED" = "true" ]; then
    echo "✅ Database is already seeded with questions!"
    echo "   Questions in database: $(echo "$STATUS_RESPONSE" | jq -r '.data.questionsInDatabase')"
    echo "   LASBI items in database: $(echo "$STATUS_RESPONSE" | jq -r '.data.lasbiItemsInDatabase')"
    echo ""
    read -p "Do you want to continue anyway? This will fail unless you manually clear the database first. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
fi

echo "🌱 Seeding questions into production database..."
echo ""

# Call the seeding endpoint
SEED_RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/admin/seed-questions" \
    -H "x-admin-secret: $ADMIN_SECRET_KEY" \
    -H "Content-Type: application/json")

echo "Seed Response:"
echo "$SEED_RESPONSE" | jq .
echo ""

# Check if successful
SUCCESS=$(echo "$SEED_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Successfully seeded production database!"
    echo ""
    echo "📊 Summary:"
    echo "   Questions created: $(echo "$SEED_RESPONSE" | jq -r '.data.questionsCreated')"
    echo "   LASBI items created: $(echo "$SEED_RESPONSE" | jq -r '.data.lasbiItemsCreated')"
    echo "   Version: $(echo "$SEED_RESPONSE" | jq -r '.data.version')"
    echo "   Domains: $(echo "$SEED_RESPONSE" | jq -r '.data.domains')"
    echo ""
    echo "🎉 Your assessment questions are now live in production!"
else
    echo "❌ Failed to seed questions"
    echo "   Error: $(echo "$SEED_RESPONSE" | jq -r '.error')"
    echo "   Details: $(echo "$SEED_RESPONSE" | jq -r '.details')"
    exit 1
fi
