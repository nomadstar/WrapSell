#!/bin/bash

# Script para probar la creación automática de usuarios en WrapSell
echo "🧪 Testing WrapSell User Creation..."

# URL del backend
BACKEND_URL="http://localhost:5000"
API_KEY="your_secret_key"

echo "📡 Backend URL: $BACKEND_URL"
echo "🔑 API Key: $API_KEY"
echo ""

# Test wallet addresses
TEST_WALLETS=(
    "0x1234567890123456789012345678901234567890"
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    "0x9876543210987654321098765432109876543210"
)

echo "1️⃣ Testing user creation endpoint..."

for wallet in "${TEST_WALLETS[@]}"; do
    echo ""
    echo "🔍 Testing wallet: $wallet"
    
    # Crear usuario
    echo "📝 Creating user..."
    curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"wallet_address\": \"$wallet\",
            \"wallet_type\": \"ethereum\",
            \"username\": \"User_${wallet:0:8}\",
            \"email\": \"user@example.com\"
        }" \
        "$BACKEND_URL/users" | jq . 2>/dev/null || echo "❌ User creation failed or invalid JSON"
    
    echo ""
    echo "🔍 Checking if user exists..."
    curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/users/$wallet" | jq . 2>/dev/null || echo "❌ User retrieval failed"
    
    echo "----------------------------------------"
done

echo ""
echo "2️⃣ Testing duplicate user creation..."
TEST_WALLET="${TEST_WALLETS[0]}"
echo "🔄 Attempting to create duplicate user: $TEST_WALLET"

curl -s -X POST \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"wallet_address\": \"$TEST_WALLET\",
        \"wallet_type\": \"ethereum\",
        \"username\": \"Duplicate_User\",
        \"email\": \"duplicate@example.com\"
    }" \
    "$BACKEND_URL/users" | jq . 2>/dev/null || echo "❌ Expected duplicate error"

echo ""
echo "3️⃣ Testing user listing..."
echo "📋 Getting all users..."
curl -s -H "X-API-Key: $API_KEY" "$BACKEND_URL/users" 2>/dev/null | jq . || echo "❌ User listing endpoint not available"

echo ""
echo "✅ User creation testing completed!"
echo ""
echo "💡 To test the frontend user creation:"
echo "   1. Start the backend: docker-compose up -d"
echo "   2. Start the frontend: cd wrap-frontend && npm run dev"
echo "   3. Connect a wallet in the browser"
echo "   4. Check the browser console and network tab"
