# 🤖 Creación Automática de Usuarios - WrapSell

## 📋 Descripción

Se ha implementado la funcionalidad de **creación automática de usuarios** que se ejecuta cuando un usuario conecta su wallet a la aplicación. Esta funcionalidad utiliza el endpoint `POST /users` del backend Flask.

## 🔧 Funcionamiento

### Flujo de Creación Automática

1. **Conexión de Wallet**: Usuario conecta su wallet usando WalletConnect/Reown
2. **Detección Automática**: El frontend detecta la conexión (`useAccount` de wagmi)
3. **Verificación de Usuario**: Se verifica si el usuario ya existe en la base de datos
4. **Creación de Usuario**: Si no existe, se crea automáticamente con datos básicos
5. **Redirección**: Una vez creado, redirige al dashboard

### Datos del Usuario Creado

```typescript
const userData = {
  wallet_address: "0x1234...",           // Dirección de la wallet conectada
  wallet_type: "ethereum",               // Tipo de blockchain (detectado automáticamente)
  username: "User_0x123456",             // Username generado automáticamente
  email: undefined                       // Email opcional (null por defecto)
};
```

## 🔄 Estados de la UI

### 1. **Creando Usuario**
```
🔄 Creating User Account...
Setting up your account in our database...
```

### 2. **Usuario Existente**
```
✅ User account found!
Usuario ya existente en la base de datos
```

### 3. **Usuario Creado**
```
🎉 User account created successfully!
Cuenta creada exitosamente
```

### 4. **Error de Creación**
```
❌ Error creating user: [mensaje de error]
Muestra el error específico del backend
```

### 5. **Redirección**
```
🎉 Wallet connected! Redirecting to dashboard...
✅ Account ready!
```

## 🛠️ Implementación Técnica

### Componentes Principales

#### `createUserAutomatically()` - Función Principal
```typescript
const createUserAutomatically = async (walletAddress: string) => {
  // 1. Verificar si usuario ya existe
  // 2. Si no existe, crear nuevo usuario
  // 3. Manejar errores appropriadamente
  // 4. Actualizar estados de UI
};
```

#### `UserCreationStatus` - Componente UI
```typescript
interface UserCreationStatusProps {
  isCreatingUser: boolean;
  userCreated: boolean;
  isRedirecting: boolean;
  error?: string;
}
```

### Endpoints Utilizados

#### GET `/users/{wallet_address}`
- **Propósito**: Verificar si el usuario existe
- **Respuesta 200**: Usuario existe
- **Respuesta 404**: Usuario no encontrado

#### POST `/users`
- **Propósito**: Crear nuevo usuario
- **Headers**: `X-API-Key: your_secret_key`
- **Body**:
  ```json
  {
    "wallet_address": "0x123...",
    "wallet_type": "ethereum",
    "username": "User_0x123456",
    "email": null
  }
  ```

## 🔍 Testing

### Script de Pruebas Automatizadas
```bash
# Ejecutar pruebas del backend
./test-user-creation.sh
```

### Pruebas Manuales
1. **Conectar Wallet Nueva**:
   - Conectar wallet que no existe en BD
   - Verificar creación automática
   - Verificar redirección al dashboard

2. **Conectar Wallet Existente**:
   - Conectar wallet que ya existe
   - Verificar mensaje de "usuario encontrado"
   - Verificar redirección inmediata

3. **Error de Backend**:
   - Desconectar backend
   - Conectar wallet
   - Verificar manejo de errores

### Verificación en Base de Datos
```sql
-- Verificar usuarios creados
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Verificar por wallet específica
SELECT * FROM users WHERE wallet_address = '0x123...';
```

## 🎯 Casos de Uso

### Usuario Nuevo
```
1. Visita la aplicación
2. Click en "Connect Wallet"
3. Autoriza conexión en MetaMask
4. ✅ Usuario creado automáticamente
5. Redirigido al dashboard
```

### Usuario Existente
```
1. Visita la aplicación 
2. Click en "Connect Wallet"
3. Autoriza conexión
4. ✅ Usuario encontrado
5. Redirigido al dashboard inmediatamente
```

### Error de Red/Backend
```
1. Visita la aplicación
2. Click en "Connect Wallet"
3. Backend no disponible
4. ❌ Error mostrado al usuario
5. Opción de reintentar
```

## 🚨 Manejo de Errores

### Errores Comunes

#### "API key requerida o inválida"
- **Causa**: `API_SECRET_KEY` no configurada o incorrecta
- **Solución**: Verificar variables de entorno

#### "Usuario ya existe"
- **Causa**: Wallet ya registrada en BD
- **Manejo**: Se trata como éxito, no como error

#### "Error al conectar a la base de datos"
- **Causa**: Backend no disponible o BD desconectada
- **Solución**: Verificar estado del backend

#### "Invalid wallet address"
- **Causa**: Dirección de wallet malformada
- **Solución**: Validar formato de dirección

### Logs de Debug
```typescript
// Console logs para debugging
console.log("Creating user with data:", userData);
console.log("User created:", newUser);
console.error("Error creating user:", error);
```

## 📊 Métricas y Monitoreo

### Eventos a Trackear
- Conexiones de wallet exitosas
- Usuarios nuevos creados
- Usuarios existentes reconectados
- Errores de creación de usuario
- Tiempo de creación de usuario

### Analytics Recomendados
```typescript
// Ejemplo con analytics
analytics.track('User Created Automatically', {
  wallet_address: userData.wallet_address,
  wallet_type: userData.wallet_type,
  creation_time: Date.now() - startTime
});
```

## 🔮 Mejoras Futuras

### Funcionalidades Adicionales
1. **Detección de Tipo de Wallet**: Ethereum, Polygon, BSC, etc.
2. **Username Personalizable**: Permitir al usuario cambiar su username
3. **Verificación de Email**: Proceso opcional de verificación
4. **Perfil Completo**: Formulario para completar perfil después de creación
5. **Analytics Avanzados**: Tracking detallado de conversión

### Optimizaciones
1. **Cache de Usuarios**: Evitar llamadas repetidas a la API
2. **Batch Operations**: Crear múltiples usuarios en lote
3. **Offline Support**: Manejar creación cuando no hay conexión
4. **Progressive Enhancement**: Funcionalidad gradual según disponibilidad

## 🔧 Configuración

### Variables de Entorno Requeridas
```bash
# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_secret_key

# Backend (.env)
DATABASE_URL=postgresql://user:password@host:port/database
API_SECRET_KEY=your_secret_key
```

### Dependencias
```json
// Frontend
{
  "@reown/appkit": "^1.0.0",
  "wagmi": "^2.0.0",
  "next": "^14.0.0"
}
```

## 📞 Soporte

### Para Desarrolladores
- Verificar logs del navegador (F12 > Console)
- Verificar Network tab para llamadas API
- Revisar estado de Redux/Context si aplica

### Para Debugging
- Activar logs detallados en `localStorage.debug = '*'`
- Usar React DevTools para inspeccionar estados
- Verificar backend con `./test-user-creation.sh`

---

*Documentación de Creación Automática de Usuarios - WrapSell v1.0*
