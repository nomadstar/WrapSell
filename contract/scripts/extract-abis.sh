#!/bin/bash

# Script para extraer ABIs de los contratos compilados y copiarlos al frontend

echo "🔧 Extrayendo ABIs de contratos compilados..."

# Directorio de destino en el frontend
FRONTEND_DIR="../wrap-frontend/src/lib"

# Verificar si el directorio del frontend existe
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Directorio del frontend no encontrado: $FRONTEND_DIR"
  exit 1
fi

# Extraer ABI de WrapPool
echo "📄 Extrayendo ABI de WrapPool..."
cat artifacts/contracts/WrapPool.sol/WrapPool.json | jq '.abi' > temp_wrappool_abi.json

# Extraer ABI de WrapSell
echo "📄 Extrayendo ABI de WrapSell..."
cat artifacts/contracts/WrapSell.sol/WrapSell.json | jq '.abi' > temp_wrapsell_abi.json

# Extraer ABI de SimpleStorage
echo "📄 Extrayendo ABI de SimpleStorage..."
cat artifacts/contracts/SimpleStorage.sol/SimpleStorage.json | jq '.abi' > temp_simplestorage_abi.json

echo "✅ ABIs extraídos exitosamente!"
echo "📝 Archivos temporales creados:"
echo "   - temp_wrappool_abi.json"
echo "   - temp_wrapsell_abi.json" 
echo "   - temp_simplestorage_abi.json"

echo ""
echo "🔗 Para usar estos ABIs en el frontend, puedes copiar su contenido"
echo "   y actualizar el archivo contracts.ts en el frontend."

# Mostrar resumen de funciones principales
echo ""
echo "📋 Funciones principales de WrapPool:"
cat temp_wrappool_abi.json | jq -r '.[] | select(.type == "function") | .name' | sort

echo ""
echo "📋 Funciones principales de WrapSell:"
cat temp_wrapsell_abi.json | jq -r '.[] | select(.type == "function") | .name' | sort
