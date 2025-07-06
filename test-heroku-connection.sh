#!/bin/bash

# Script para probar la conexión con el backend de Heroku
echo "🧪 Probando conexión con backend de Heroku..."

BACKEND_URL="https://wrap-back-crawl-05c4908a33e4.herokuapp.com"
API_KEY="17ff88865c1b61d0ed9cdc665afdfa9a4fc60c6b6c05590a6461aead3e9843e7"

echo "📡 Backend URL: $BACKEND_URL"
echo "🔑 API Key: $API_KEY"
echo ""

echo "1️⃣ Probando endpoint raíz..."
curl -s -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -H "X-API-Key: $API_KEY" \
  "$BACKEND_URL/" || echo "❌ Error de conexión"

echo ""
echo "2️⃣ Probando endpoint de usuarios con POST..."
curl -s -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "wallet_address": "0x742D35cC6EAb4DC4b6D9E5C90e86F79F6AC0c39a",
    "wallet_type": "ethereum",
    "username": "test_user",
    "email": "test@example.com"
  }' \
  "$BACKEND_URL/users" || echo "❌ Error al crear usuario"

echo ""
echo "3️⃣ Probando obtener usuario..."
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-API-Key: $API_KEY" \
  "$BACKEND_URL/users/0x742D35cC6EAb4DC4b6D9E5C90e86F79F6AC0c39a" || echo "❌ Error al obtener usuario"

echo ""
echo "✅ Pruebas completadas"
