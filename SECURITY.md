# 🔒 Guía de Seguridad - WrapSell

## ⚠️ INFORMACIÓN SENSIBLE - NUNCA COMMITEAR

### 🚫 Archivos que NUNCA deben estar en el repositorio:

#### Variables de Entorno
- `.env` (todas las variantes)
- `.env.local`, `.env.production`, etc.
- Cualquier archivo con credenciales

#### Claves Privadas
- `private-key*`
- `mnemonic*`
- `seed*`
- `wallet.json`
- Archivos en `keystore/` o `wallets/`

#### Configuraciones de Contratos
- `deployed_addresses.json` con direcciones reales
- `hardhat.config.local.js/ts`
- Archivos de deployment con información sensible

#### APIs y Credenciales
- Archivos con sufijos `-key.json`, `-credentials.json`
- `secrets.json`, `config.json` con datos reales
- Tokens de API de servicios externos

## ✅ Buenas Prácticas de Seguridad

### 1. Variables de Entorno
```bash
# ✅ Correcto - usar variables de entorno
NEXT_PUBLIC_WC_PROJECT_ID=tu_project_id

# ❌ Incorrecto - hardcodear en código
const projectId = "abc123def456";
```

### 2. Claves Privadas
```bash
# ✅ Correcto - variable de entorno
DEPLOYER_PRIVATE_KEY=0x...

# ❌ Incorrecto - en hardhat.config.js
accounts: ["0x1234567890abcdef..."]
```

### 3. Direcciones de Contratos
```bash
# ✅ Correcto - configuración dinámica
CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000..."

# ❌ Incorrecto - hardcodeado
const contractAddress = "0x1234567890abcdef...";
```

## 🛡️ Configuración Segura para Heroku

### Variables de Entorno Requeridas:
```bash
# Configurar en Heroku Dashboard o CLI
heroku config:set NEXT_PUBLIC_WC_PROJECT_ID=tu_id --app tu-app
heroku config:set NEXT_PUBLIC_CHAIN_ID=8453 --app tu-app
heroku config:set DATABASE_URL=postgres://... --app tu-app
```

### Variables Opcionales (solo si usas contratos reales):
```bash
heroku config:set NEXT_PUBLIC_WRAP_SELL_ADDRESS=0x... --app tu-app
heroku config:set NEXT_PUBLIC_POKEMON_POOL_ADDRESS=0x... --app tu-app
```

## 🔍 Verificación de Seguridad

### Antes de hacer commit:
```bash
# Verificar que no hay archivos sensibles
git status
git diff --cached

# Revisar .gitignore
cat .gitignore

# Buscar posibles claves privadas
grep -r "private" --exclude-dir=node_modules .
grep -r "0x[a-fA-F0-9]{64}" --exclude-dir=node_modules .
```

### Comando de limpieza:
```bash
# Remover archivos sensibles del historial si es necesario
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all
```

## 🚨 Qué hacer si se filtra información sensible:

1. **Inmediatamente:**
   - Cambiar todas las claves/passwords comprometidas
   - Revocar API keys expuestas
   - Generar nuevas claves privadas

2. **Limpiar repositorio:**
   - Usar `git filter-branch` o BFG Repo-Cleaner
   - Forzar push para reescribir historial
   - Notificar a colaboradores

3. **Prevenir futuras filtraciones:**
   - Actualizar `.gitignore`
   - Usar pre-commit hooks
   - Revisar configuraciones de CI/CD

## 📋 Checklist de Seguridad

- [ ] `.env` en `.gitignore`
- [ ] `.env.example` creado sin valores reales
- [ ] Variables de entorno configuradas en Heroku
- [ ] Sin claves privadas en código
- [ ] Sin direcciones hardcodeadas
- [ ] Archivos de deployment excluidos
- [ ] APIs keys como variables de entorno
- [ ] Configuración de desarrollo vs producción separada

## 🔗 Enlaces Útiles

- [Heroku Config Vars](https://devcenter.heroku.com/articles/config-vars)
- [WalletConnect Dashboard](https://cloud.reown.com/)
- [Git Filter Branch](https://git-scm.com/docs/git-filter-branch)
- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
