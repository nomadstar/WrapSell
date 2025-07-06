#!/bin/bash

# Script para probar la conexión al backend de WrapSell
echo "🧪 Testing WrapSell Backend Connection..."

# URL del backend
BACKEND_URL="http://localhost:5000"
API_KEY="your_secret_key"

echo "📡 Backend URL: $BACKEND_URL"
echo "🔑 API Key: $API_KEY"
echo ""

# Test 1: Health check - página principal
echo "1️⃣ Testing main endpoint..."
curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/?api_key=$API_KEY" | jq . 2>/dev/null || echo "❌ Main endpoint failed or invalid JSON"
echo ""

# Test 2: Get all pools
echo "2️⃣ Testing pools endpoint..."
curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/dashboard/pools" | jq . 2>/dev/null || echo "❌ Pools endpoint failed or invalid JSON"
echo ""

# Test 3: Get all cards
echo "3️⃣ Testing cards endpoint..."
curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/cards" | jq . 2>/dev/null || echo "❌ Cards endpoint failed or invalid JSON"
echo ""

# Test 4: Test user summary (this might fail if user doesn't exist)
echo "4️⃣ Testing user summary endpoint..."
TEST_WALLET="0x1234567890123456789012345678901234567890"
curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/dashboard/user/$TEST_WALLET/summary" | jq . 2>/dev/null || echo "⚠️ User summary failed (expected if user doesn't exist)"
echo ""

echo "✅ Backend testing completed!"
echo ""
echo "💡 To start the backend with Docker Compose:"
echo "   cd /home/ignatus/Documentos/Github/WrapSell"
echo "   docker-compose up -d"
echo ""
echo "💡 To start the frontend:"
echo "   cd /home/ignatus/Documentos/Github/WrapSell/wrap-frontend"
echo "   npm install && npm run dev"
