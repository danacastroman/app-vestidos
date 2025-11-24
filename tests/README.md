# Test Suite Documentation - GlamRent

Esta suite de tests de automatización E2E cubre las funcionalidades principales de la aplicación GlamRent usando Playwright.

## Estructura de Tests

### Page Objects (tests/pages/)
Los Page Objects encapsulan la lógica de interacción con las páginas:

- **HomePage.ts** - Página principal con navegación y búsqueda
- **SearchPage.ts** - Página de búsqueda y filtrado de catálogo
- **ItemDetailsPage.ts** - Página de detalles de un vestido
- **LoginPage.ts** - Página de login de administrador
- **AdminDashboardPage.ts** - Dashboard del administrador con inventario y rentals

### Test Data (tests/testData/)
- **urls.ts** - URLs de la aplicación
- **credentials.ts** - Credenciales de prueba

### Fixtures (tests/fixtures/)
- **auth.ts** - Fixture personalizado con sesión autenticada (`loggedInPage`)

## Archivos de Tests

### 1. home.spec.ts
Tests de la página principal:
- ✅ Display de secciones principales (hero, featured, how it works)
- ✅ Navegación entre páginas
- ✅ Búsqueda desde home page
- ✅ Links del footer y header
- ✅ Newsletter signup

**Total: 12 tests**

### 2. search.spec.ts
Tests de búsqueda y filtrado:
- ✅ Filtros por categoría, tamaño, color, estilo
- ✅ Búsqueda por texto
- ✅ Aplicación de múltiples filtros
- ✅ Display de items con información correcta
- ✅ Mensaje de "no results"
- ✅ Mantenimiento de valores de filtros

**Total: 15 tests**

### 3. item-details.spec.ts
Tests de detalles de items:
- ✅ Display de información del vestido (nombre, precio, categoría, tallas)
- ✅ Imágenes del producto
- ✅ Selección de fechas de alquiler
- ✅ Calendario de disponibilidad
- ✅ Navegación entre items
- ✅ Navegación de regreso al catálogo

**Total: 15 tests**

### 4. admin-login.spec.ts
Tests de autenticación de administrador:
- ✅ Login exitoso con credenciales válidas
- ✅ Logout
- ✅ Fallos con credenciales inválidas
- ✅ Campos vacíos
- ✅ Protección de rutas sin autenticación
- ✅ Persistencia de sesión después de refresh

**Total: 11 tests**

### 5. admin-dashboard.spec.ts
Tests del dashboard de admin (existente):
- ✅ Display de headers de inventario

**Total: 1 test**

### 6. admin-dashboard-full.spec.ts
Tests completos del dashboard de admin:
- ✅ Secciones de inventario y rentals
- ✅ Headers correctos en tablas
- ✅ Display de items de inventario con todos los campos
- ✅ Display de rentals activos y cancelados
- ✅ Información de clientes
- ✅ Botones de acción (Cancel) según estado
- ✅ Formato de precios y fechas
- ✅ Mensaje "No rentals yet"

**Total: 17 tests**

### 7. e2e-user-flows.spec.ts
Tests de flujos end-to-end completos:
- ✅ Flujo completo: home → search → item details
- ✅ Búsqueda desde home y visualización de resultados
- ✅ Filtrado y navegación a items
- ✅ Navegación entre múltiples items
- ✅ Búsqueda con múltiples filtros
- ✅ Navegación desde featured items
- ✅ Navegación con fechas
- ✅ Consistencia de navegación en toda la app

**Total: 13 tests**

### 8. login.spec.ts (existente)
Test básico de login/logout del admin.

**Total: 1 test**

### 9. loginpo.spec.ts (existente)
Probablemente test con Page Objects.

---

## Total de Tests: 85+ tests

## Comandos para Ejecutar Tests

### Ejecutar todos los tests
```bash
npm run test:e2e
```

### Ejecutar con UI Mode (recomendado para desarrollo)
```bash
npm run test:e2e:ui
```

### Ejecutar en modo headed (ver el navegador)
```bash
npm run test:e2e:headed
```

### Ejecutar en modo debug
```bash
npm run test:e2e:debug
```

### Ver el reporte de tests
```bash
npm run test:e2e:report
```

### Ejecutar un archivo específico
```bash
npx playwright test tests/home.spec.ts
```

### Ejecutar un test específico
```bash
npx playwright test tests/home.spec.ts -g "should display main heading"
```

### Ejecutar tests en un navegador específico
```bash
npx playwright test --project=chromium
```

## Configuración

La configuración de Playwright está en `playwright.config.ts`:

- **Base URL**: http://localhost:3000
- **Timeout**: 10s para acciones, 30s para navegación
- **Screenshots**: Solo en fallos
- **Traces**: En primer retry
- **Parallelización**: Habilitada
- **Web Server**: Se inicia automáticamente con `npm run dev`

## Estructura de Directorios

```
tests/
├── fixtures/
│   └── auth.ts              # Fixture con sesión autenticada
├── pages/
│   ├── AdminDashboardPage.ts
│   ├── HomePage.ts
│   ├── ItemDetailsPage.ts
│   ├── LoginPage.ts
│   └── SearchPage.ts
├── testData/
│   ├── credentials.ts       # Credenciales de prueba
│   └── urls.ts             # URLs de la app
├── admin-dashboard-full.spec.ts
├── admin-dashboard.spec.ts
├── admin-login.spec.ts
├── e2e-user-flows.spec.ts
├── home.spec.ts
├── item-details.spec.ts
├── login.spec.ts
├── loginpo.spec.ts
├── search.spec.ts
└── README.md               # Este archivo
```

## Mejores Prácticas Implementadas

1. **Page Object Pattern**: Separación de lógica de UI y tests
2. **Test Data Management**: Datos centralizados en archivos separados
3. **Fixtures personalizados**: Reutilización de estados (login)
4. **Assertions claras**: Uso de expect con mensajes descriptivos
5. **Waits explícitos**: Esperas por URLs y elementos visibles
6. **Tests independientes**: Cada test puede ejecutarse aisladamente
7. **Descriptores claros**: Nombres de tests descriptivos y organizados

## Cobertura de Funcionalidad

### Frontend Usuario
- ✅ Home page completa
- ✅ Sistema de búsqueda y filtrado
- ✅ Visualización de items
- ✅ Detalles de productos
- ✅ Navegación entre páginas
- ✅ Formularios de búsqueda

### Frontend Admin
- ✅ Sistema de autenticación
- ✅ Dashboard con inventario
- ✅ Gestión de rentals
- ✅ Visualización de clientes
- ✅ Acciones sobre rentals

### Flujos E2E
- ✅ Navegación completa de usuario
- ✅ Búsqueda y selección de productos
- ✅ Administración de inventario y rentals

## Notas

- Los tests asumen que la aplicación está corriendo en `http://localhost:3000`
- El servidor se inicia automáticamente antes de ejecutar los tests
- Las credenciales de admin están en `tests/testData/credentials.ts`
- Algunos tests validan tanto estados con datos como sin datos (ej: rentals)
