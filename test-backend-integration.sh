#!/bin/bash

# Script para probar la integración del backend con la función de extraer cartas

echo "🧪 Probando integración del backend WrapSell..."
echo "=========================================="

# Configuración
API_URL="http://localhost:5000"
API_KEY="your_secret_key"
TEST_WALLET="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

echo "API URL: $API_URL"
echo "Testing with wallet: $TEST_WALLET"
echo ""

# Función para hacer requests con cURL
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ "$method" = "GET" ]; then
        curl -s -H "X-API-Key: $API_KEY" \
             -H "Content-Type: application/json" \
             "$API_URL$endpoint"
    else
        curl -s -X "$method" \
             -H "X-API-Key: $API_KEY" \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$API_URL$endpoint"
    fi
}

echo "1. Verificando conexión al backend..."
response=$(make_request "GET" "/")
if [[ $response == *"WrapSell"* ]]; then
    echo "✅ Backend conectado correctamente"
else
    echo "❌ Error conectando al backend"
    echo "Respuesta: $response"
    exit 1
fi
echo ""

echo "2. Creando usuario de prueba..."
user_data='{
    "wallet_address": "'$TEST_WALLET'",
    "wallet_type": "MetaMask",
    "username": "test_user",
    "email": "test@example.com"
}'

response=$(make_request "POST" "/users" "$user_data")
if [[ $response == *"exitosamente"* ]] || [[ $response == *"ya existe"* ]]; then
    echo "✅ Usuario creado/verificado"
else
    echo "⚠️  Respuesta del usuario: $response"
fi
echo ""

echo "3. Creando pool de prueba..."
pool_data='{
    "name": "Test Pokemon Pool",
    "description": "Pool de prueba para cartas Pokemon",
    "tcg": "Pokemon",
    "created_by": "'$TEST_WALLET'"
}'

response=$(make_request "POST" "/pools" "$pool_data")
echo "Pool creation response: $response"
pool_id=$(echo $response | grep -o '"pool_id":[0-9]*' | grep -o '[0-9]*')
echo "Pool ID: $pool_id"
echo ""

echo "4. Añadiendo carta usando URL de PriceCharting..."
card_data='{
    "url": "https://www.pricecharting.com/game/pokemon-ultra-prism/frost-rotom-41",
    "user_wallet": "'$TEST_WALLET'",
    "pool_id": '$pool_id'
}'

echo "Enviando datos de carta: $card_data"
response=$(make_request "POST" "/cards/add-by-url" "$card_data")
echo "Card addition response: $response"
echo ""

echo "5. Añadiendo múltiples cartas..."
batch_data='{
    "urls": [
        "https://www.pricecharting.com/game/pokemon-base-set/charizard-4",
        "https://www.pricecharting.com/game/pokemon-base-set/pikachu-58"
    ],
    "user_wallet": "'$TEST_WALLET'",
    "pool_id": '$pool_id'
}'

echo "Enviando lote de cartas..."
response=$(make_request "POST" "/cards/batch-add-by-urls" "$batch_data")
echo "Batch addition response: $response"
echo ""

echo "6. Obteniendo pools del dashboard..."
response=$(make_request "GET" "/dashboard/pools")
echo "Dashboard pools: $response"
echo ""

echo "7. Obteniendo resumen del usuario..."
response=$(make_request "GET" "/dashboard/user/$TEST_WALLET/summary")
echo "User summary: $response"
echo ""

echo "8. Obteniendo todas las cartas..."
response=$(make_request "GET" "/cards")
echo "All cards: $response"
echo ""

echo "9. Obteniendo cartas del usuario..."
response=$(make_request "GET" "/users/$TEST_WALLET/cards")
echo "User cards: $response"
echo ""

echo "🎉 ¡Pruebas completadas!"
echo ""
echo "Para usar la aplicación:"
echo "1. Inicia el backend: cd wrap-backend && python app.py"
echo "2. Inicia el frontend: cd wrap-frontend && npm run dev"
echo "3. Abre http://localhost:3000/dashboard"
echo ""
echo "El dashboard ahora está conectado a la base de datos PostgreSQL"
echo "y puede añadir cartas usando URLs de PriceCharting.com"
