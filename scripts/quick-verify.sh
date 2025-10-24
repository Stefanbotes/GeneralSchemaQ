
#!/bin/bash
# Quick verification script for post-deployment checks

echo "🔍 Running quick verification checks..."
echo ""

# Test 1: Question count
echo "📊 Test 1: Total questions"
TOTAL=$(curl -s http://localhost:3000/api/assessment/questions | jq '.questions | length')
if [ "$TOTAL" = "54" ]; then
  echo "✅ PASS: Found 54 questions"
else
  echo "❌ FAIL: Expected 54, got $TOTAL"
  exit 1
fi

# Test 2: Failure schema
echo ""
echo "📊 Test 2: Failure schema"
FAILURE=$(curl -s http://localhost:3000/api/assessment/questions | jq '.questions[].schema' | grep -i failure | wc -l)
if [ "$FAILURE" -ge 3 ]; then
  echo "✅ PASS: Found $FAILURE Failure schema questions"
else
  echo "❌ FAIL: Expected at least 3, got $FAILURE"
  exit 1
fi

# Test 3: Enmeshment schema
echo ""
echo "📊 Test 3: Enmeshment/Undeveloped Self schema"
ENMESHMENT=$(curl -s http://localhost:3000/api/assessment/questions | jq '.questions[].schema' | grep -i -E 'enmeshment|undeveloped' | wc -l)
if [ "$ENMESHMENT" -ge 3 ]; then
  echo "✅ PASS: Found $ENMESHMENT Enmeshment questions"
else
  echo "❌ FAIL: Expected at least 3, got $ENMESHMENT"
  exit 1
fi

# Test 4: Grandiosity count
echo ""
echo "📊 Test 4: Grandiosity schema"
GRANDIOSITY=$(curl -s http://localhost:3000/api/assessment/questions | jq '.questions[].schema' | grep -i grandiosity | wc -l)
if [ "$GRANDIOSITY" = "3" ]; then
  echo "✅ PASS: Grandiosity has exactly 3 items"
else
  echo "❌ FAIL: Expected 3, got $GRANDIOSITY"
  exit 1
fi

# Test 5: Metadata
echo ""
echo "📊 Test 5: Metadata check"
SCHEMAS=$(curl -s http://localhost:3000/api/assessment/questions | jq '.metadata.schemas')
DOMAINS=$(curl -s http://localhost:3000/api/assessment/questions | jq '.metadata.domains')
echo "   Schemas: $SCHEMAS"
echo "   Domains: $DOMAINS"
if [ "$SCHEMAS" = "18" ] && [ "$DOMAINS" = "5" ]; then
  echo "✅ PASS: Metadata correct"
else
  echo "❌ FAIL: Expected 18 schemas and 5 domains"
  exit 1
fi

echo ""
echo "✅ All quick verification checks passed!"
