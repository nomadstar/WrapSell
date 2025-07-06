#!/bin/bash

# Script para probar los endpoints administrativos del backend WrapSell

echo "🔐 Probando endpoints administrativos del backend WrapSell..."
echo "============================================================"

# Configuración
API_URL="http://localhost:5000"
API_KEY="your_secret_key"
ADMIN_WALLET="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
TEST_USER_WALLET="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

echo "API URL: $API_URL"
echo "Admin wallet: $ADMIN_WALLET"
echo "Test user wallet: $TEST_USER_WALLET"
echo ""

# Función para hacer requests con cURL
make_admin_request() {
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
response=$(make_admin_request "GET" "/")
if [[ $response == *"WrapSell"* ]]; then
    echo "✅ Backend conectado correctamente"
else
    echo "❌ Error conectando al backend"
    echo "Respuesta: $response"
    exit 1
fi
echo ""

echo "2. Creando usuario de prueba para admin..."
user_data='{
    "wallet_address": "'$TEST_USER_WALLET'",
    "wallet_type": "MetaMask",
    "username": "test_user_admin",
    "email": "admin@test.com"
}'

response=$(make_admin_request "POST" "/users" "$user_data")
echo "Respuesta: $response"
echo ""

echo "3. Probando añadir carta por URL (admin)..."
card_data='{
    "admin_wallet": "'$ADMIN_WALLET'",
    "url": "https://www.pricecharting.com/game/pokemon-ultra-prism/frost-rotom-41",
    "user_wallet": "'$TEST_USER_WALLET'"
}'

response=$(make_admin_request "POST" "/cards_admin/add-by-url" "$card_data")
echo "Respuesta: $response"

# Extraer el card_id de la respuesta
card_id=$(echo $response | grep -o '"card_id":[0-9]*' | cut -d':' -f2)
echo "Card ID obtenido: $card_id"
echo ""

echo "4. Probando añadir carta manualmente (admin)..."
manual_card_data='{
    "admin_wallet": "'$ADMIN_WALLET'",
    "name": "Pikachu",
    "card_id": "25",
    "edition": "Base Set",
    "user_wallet": "'$TEST_USER_WALLET'",
    "market_value": 150.00,
    "url": "https://example.com/pikachu"
}'

response=$(make_admin_request "POST" "/cards_admin/add-manual" "$manual_card_data")
echo "Respuesta: $response"

# Extraer el segundo card_id
card_id_2=$(echo $response | grep -o '"card_id":[0-9]*' | cut -d':' -f2)
echo "Card ID 2 obtenido: $card_id_2"
echo ""

if [ -n "$card_id" ]; then
    echo "5. Probando editar carta (admin)..."
    edit_data='{
        "admin_wallet": "'$ADMIN_WALLET'",
        "market_value": 200.00,
        "name": "Frost Rotom Updated"
    }'
    
    response=$(make_admin_request "PUT" "/cards_admin/edit/$card_id" "$edit_data")
    echo "Respuesta: $response"
    echo ""
    
    echo "6. Probando marcar carta como removida (admin)..."
    remove_data='{
        "admin_wallet": "'$ADMIN_WALLET'"
    }'
    
    response=$(make_admin_request "DELETE" "/cards_admin/remove/$card_id" "$remove_data")
    echo "Respuesta: $response"
    echo ""
    
    echo "7. Probando restaurar carta (admin)..."
    response=$(make_admin_request "PUT" "/cards_admin/restore/$card_id" "$remove_data")
    echo "Respuesta: $response"
    echo ""
fi

if [ -n "$card_id" ] && [ -n "$card_id_2" ]; then
    echo "8. Probando actualización masiva de precios (admin)..."
    batch_update_data='{
        "admin_wallet": "'$ADMIN_WALLET'",
        "card_ids": ['$card_id', '$card_id_2']
    }'
    
    response=$(make_admin_request "PUT" "/cards_admin/batch-update-prices" "$batch_update_data")
    echo "Respuesta: $response"
    echo ""
fi

echo "9. Probando con wallet NO autorizada..."
unauthorized_data='{
    "admin_wallet": "0x1234567890123456789012345678901234567890",
    "url": "https://www.pricecharting.com/game/pokemon-ultra-prism/test-1",
    "user_wallet": "'$TEST_USER_WALLET'"
}'

response=$(make_admin_request "POST" "/cards_admin/add-by-url" "$unauthorized_data")
echo "Respuesta (debe ser error 403): $response"
echo ""

echo "🎉 Prueba de endpoints administrativos completada!"
echo "Verifica que:"
echo "- Las cartas se añadieron correctamente"
echo "- Las ediciones funcionaron"
echo "- El soft delete y restore funcionaron"
echo "- Los wallets no autorizados fueron rechazados"
