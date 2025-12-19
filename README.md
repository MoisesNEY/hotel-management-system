# <div align="center">Sistema de Gestión Hotelera</div>

## Descripción del Proyecto

Sistema integral de gestión hotelera desarrollado en Spring Boot (backend) y React + TypeScript (frontend). El sistema permite la administración completa de reservas, habitaciones, servicios y clientes.

![pajina de inicio para el Grand Hotel](/capturas-de-pantalla/PaginaDeInicioNuevo.png)
![pajina de login](/capturas-de-pantalla/PaginaDeLogin.png)
![pajina de perfil mostrando el perfil Admin](/capturas-de-pantalla/PaginaDePerfilAdmin.png)
![pajina Administrativo del Grand Hotrl mostrando el Admin Dashboard](/capturas-de-pantalla/PaginaDeAdminDashboard.png)

En la página web del sistema de gestión tiene diferentes controles y páginas modificables y escalables para diferentes roles de usuario. La pantalla de inicio tiene opciones para iniciar sesión o registrarse en la esquina, y tambien tiene información sobre habitaciones, servicios y más sobre el hotel, todo personalisable por el admin. Después de iniciar sesión o registrarse el cliente puede buscar habitaciones vacios en días específicos, hacer reservaciones y solicitar servicios del hotel. Usuarios administradores o empleados tienen acceso más profundo al sistema, y los admin tienen acceso administrativo a las reservas, habitaciones, servicios, clientes. Todas las paginas de hotel son modificables por el admin y todos usuarios pueden cambiar y personalizar su perfil desde la pantalla de perfil.  

---

## <div align="center">Arquitectura y Decisiones de Diseño</div>

### Descripción de la Arquitectura

El sistema se genero usando la **plantilla de microservicios** generada con JHipster,
pero en esta primera versión se implementa y despliega un solo servicio backend que expone la API REST, organizada en tres capas principales: **capa REST** (controladores que exponen endpoints y manejan las peticiones HTTP), **capa de servicio** (lógica de negocio que procesa reservas, habitaciones y servicios del hotel), y **capa de persistencia** (repositorios que interactúan con PostgreSQL mediante JPA/Hibernate). El **frontend** es una aplicación React con TypeScript construida con Vite, que se conecta al backend consumiendo la API REST. La **seguridad** está centralizada con Keycloak mediante OAuth2, gestionando autenticación y autorización basada en roles (Admin, Employee, Client). La **base de datos** PostgreSQL almacena todas las entidades del dominio hotelero (reservas, habitaciones, clientes, servicios) con migraciones controladas por Liquibase.

### Decisiones de Diseño

- **Plantilla de microservicios con un solo servicio**: Se optó por mantener la arquitectura que trae JHipster en microservicios, pero actualmente solo se implementa un servicio backend. manteniendo la separación en capas (REST → Service → Repository) y dejando abierta la posibilidad de escalar a más servicios en el futuro.

- **Patrón DTO (Data Transfer Object)**: Se utilizan DTOs para desacoplar las entidades de dominio de la API REST. Esto permite exponer solo la información necesaria al frontend, protege la estructura interna de la base de datos y facilita validaciones específicas en cada capa. MapStruct genera automáticamente los mapeos entre entidades y DTOs, reduciendo código boilerplate.

- **Entidades del dominio hotelero**: Se diseñaron seis entidades principales (`CustomerDetails`, `RoomType`, `Room`, `Booking`, `HotelService`, `ServiceRequest`) siguiendo el modelo de negocio real de un hotel. Las relaciones son: un `Room` tiene un `RoomType`, una `Booking` referencia un `Room` y un `CustomerDetails`, y una `ServiceRequest` pertenece a una `Booking`. Esta estructura permite gestionar reservas, asignar habitaciones por tipo y capacidad, y solicitar servicios adicionales.

- **OAuth2 + Keycloak para autenticación**: Se eligió Keycloak en lugar de gestión de usuarios propia porque separa la responsabilidad de seguridad del backend, permite autenticación federada futura (Google, GitHub), y facilita la gestión de roles y permisos mediante un realm preconfigurado (`jhipster-realm`).

- **PostgreSQL como base de datos**: Se prefirió PostgreSQL sobre otras opciones por su robustez en sistemas transaccionales, soporte nativo de JSON para posibles extensiones futuras, y por ser una solución de código abierto madura que se integra perfectamente con Spring Boot y JPA.

- **React + Vite para el frontend**: El frontend se generó como un proyecto independiente usando Vite con React y TypeScript, separado del generador de frontend de JHipster, tipado fuerte con TypeScript que previene errores en tiempo de compilación, y un ecosistema moderno con amplio soporte de librerías.

---

## <div align="center">Guía de Ejecución del Proyecto</div>

### Prerrequisitos

- **Java JDK**: 17 o 21
- **Maven**: 3.2.5 o superior
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Docker** y **Docker Compose**: Para Keycloak y PostgreSQL

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/MoisesNEY/hotel-management-system.git
cd hotel-management-system
```

### Paso 2: Configuración de la Base de Datos

#### Opción A: Usar Docker Compose (Recomendado)

El backend de Spring Boot ya está configurado para iniciar PostgreSQL automáticamente mediante Docker Compose.

```bash
cd apps/api
```

El archivo `src/main/docker/postgresql.yml` contiene la configuración:
- **Usuario**: `hotelBackend`
- **Puerto**: `5433` (mapeado desde el contenedor)
- **Base de datos**: Se crea automáticamente

#### Opción B: PostgreSQL Local

Si prefieres usar PostgreSQL instalado localmente:

1. Instala PostgreSQL 17.4
2. Crea la base de datos:
```sql
CREATE DATABASE hotelbackend;
CREATE USER hotelBackend WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hotelbackend TO hotelBackend;
```
3. Actualiza `src/main/resources/config/application-dev.yml` con tus credenciales

### Paso 3: Configuración e Inicio de Keycloak

Keycloak es esencial para la autenticación OAuth2.

```bash
cd apps/api
docker compose -f src/main/docker/keycloak.yml up -d
```

**Configuración de Keycloak**:
- **URL**: http://localhost:9080
- **Admin Console**: http://localhost:9080/admin
- **Usuario Admin**: `admin`
- **Contraseña Admin**: `admin`
- **Realm**: `jhipster` (se importa automáticamente desde `src/main/docker/realm-config/jhipster-realm.json`)

### Paso 4: Ejecutar el Backend

```bash
cd apps/api

# Compilar e iniciar
./mvnw spring-boot:run

# O en Windows
mvnw.cmd spring-boot:run
```

El backend estará disponible en:
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

### Paso 5: Ejecutar el Frontend

```bash
cd apps/web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### Paso 6: Acceder al Sistema

1. Abre el navegador en http://localhost:5173

   
