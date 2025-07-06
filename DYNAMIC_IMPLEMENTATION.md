# 🚀 WrapSell - Implementación Dinámica

## 📋 Resumen de Cambios

Se ha transformado el frontend de WrapSell para que sea completamente dinámico, conectándose al backend Flask para obtener datos reales de la base de datos PostgreSQL.

## 🔧 Archivos Modificados/Creados

### 1. Variables de Entorno
- **`wrap-frontend/.env`**: Agregadas variables para conexión al backend
- **`wrap-backend/.env`**: Ya existía con configuración correcta

### 2. Servicios de API
- **`src/services/api.ts`**: Servicio completo para comunicación con el backend
  - Interfaces TypeScript para todas las entidades
  - Métodos para usuarios, cartas, pools y dashboard
  - Hook personalizado `useApiCall` para manejo de estado

### 3. Hooks Personalizados
- **`src/hooks/useDashboard.ts`**: Hook especializado para el dashboard
  - `useDashboard`: Obtiene datos completos del dashboard
  - `useWalletBalance`: Maneja el balance de la wallet
  - `useFormattedPools`: Formatea pools para el UI

### 4. Componentes UI
- **`src/components/ui/Loading.tsx`**: Componente de carga reutilizable
- **`src/components/ui/ErrorDisplay.tsx`**: Componente de error reutilizable

### 5. Dashboard Dinámico
- **`src/app/dashboard/dashboard.tsx`**: Completamente refactorizado
  - Conexión con API real
  - Estados de carga y error
  - Datos dinámicos para pools, estadísticas y actividad
  - Botón de refresh para actualizar datos

### 6. Scripts de Prueba
- **`test-backend-connection.sh`**: Script para probar conexión al backend

## 🌐 Variables de Entorno

### Frontend (`wrap-frontend/.env`)
```bash
# Reown/WalletConnect
NEXT_PUBLIC_REOWN_PROJECT_ID=abcbdd1f38a3ea48c7d95723e6740cb2

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_secret_key

# Database Configuration (for direct connections if needed)
DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
```

### Backend (`wrap-backend/.env`)
```bash
DATABASE_URL="postgresql://user:password@db:5432/mydatabase"
API_SECRET_KEY="your_secret_key"
ADMIN_WALLETS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
```

## 🚀 Cómo Ejecutar

### 1. Iniciar Backend (Base de Datos + API)
```bash
cd /home/ignatus/Documentos/Github/WrapSell
docker-compose up -d
```

### 2. Verificar Backend
```bash
./test-backend-connection.sh
```

### 3. Iniciar Frontend
```bash
cd wrap-frontend
npm install
npm run dev
```

## 🔄 Funcionalidades Dinámicas

### Dashboard
- ✅ **Pools reales** desde `/dashboard/pools`
- ✅ **Estadísticas del usuario** desde `/dashboard/user/{wallet}/summary`
- ✅ **Actividad reciente** desde los datos del usuario
- ✅ **Estados de carga** y manejo de errores
- ✅ **Refresh manual** de datos

### Conexión con Backend
- ✅ **API Service** con autenticación via API Key
- ✅ **Error handling** robusto
- ✅ **TypeScript interfaces** para type safety
- ✅ **Hooks personalizados** para reutilización

### Estados de la UI
- ✅ **Loading states** con spinner animado
- ✅ **Error states** con opción de retry
- ✅ **Empty states** para cuando no hay datos
- ✅ **Wallet disconnected** state

## 📊 Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/dashboard/pools` | GET | Obtiene pools para dashboard |
| `/dashboard/user/{wallet}/summary` | GET | Resumen del usuario |
| `/users/{wallet}` | GET | Datos del usuario |
| `/cards` | GET | Todas las cartas |
| `/pools` | GET | Todos los pools |
| `/total_value` | GET | Valor total de colección |

## 🎯 Próximos Pasos

### Para Mejorar la Integración:
1. **Web3 Real**: Conectar con MetaMask/WalletConnect
2. **Autenticación**: Implementar firma de mensajes para auth
3. **Tiempo Real**: WebSockets para updates en vivo
4. **Cache**: Implementar React Query para mejor performance
5. **Paginación**: Para listas grandes de cartas/pools

### Para el Backend:
1. **CORS**: Configurar para producción
2. **Rate Limiting**: Proteger endpoints
3. **Validación**: Mejorar validación de datos
4. **Logs**: Implementar logging estructurado

## 🐛 Solución de Problemas

### Error: "API key requerida o inválida"
- Verificar que `API_SECRET_KEY` coincida en frontend y backend
- Asegurarse de que el header `X-API-Key` se esté enviando

### Error: "Connection refused"
- Verificar que el backend esté ejecutándose: `docker-compose ps`
- Verificar la URL del backend en `.env`

### Error: "Usuario no encontrado"
- Normal en primera ejecución, el usuario se crea automáticamente
- Verificar que la wallet address sea válida

### Problemas de CORS
- Agregar configuración CORS en el backend Flask
- Verificar que las URLs coincidan exactamente

## 📚 Recursos

- [Documentación del Backend](./wrap-backend/docks.md)
- [Flask API Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
