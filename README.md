# CMPA Task Manager

> Plataforma de gestión de proyectos y tareas — React, Node.js, PostgreSQL

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![SonarCloud](https://img.shields.io/badge/SonarCloud-F3702A?style=for-the-badge&logo=sonarcloud&logoColor=white)

---

## Demo en producción

| Servicio | URL |
|----------|-----|
| Frontend | https://cmpa-frontend.onrender.com |
| Backend API | https://cmpa-backend.onrender.com/api |
| Swagger Docs | https://cmpa-backend.onrender.com/api/docs |

> **Nota:** El backend está desplegado en Render con plan gratuito. La primera petición puede tardar ~30 segundos en despertar si estuvo inactivo.

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@cmpa.dev | Password123! |
| Member | alice@cmpa.dev | Password123! |
| Member | bob@cmpa.dev | Password123! |

---

## Descripción

CMPA Task Manager es una aplicación full-stack de gestión de proyectos y tareas que permite:

- Crear y gestionar proyectos personales o de equipo
- Invitar miembros a proyectos de equipo con sistema de invitaciones
- Organizar tareas en un tablero Kanban con drag & drop
- Asignar tareas a miembros del proyecto
- Control de permisos por rol dentro del proyecto (owner puede crear, editar y eliminar — miembros solo pueden cambiar el estado)
- Visualizar métricas y estadísticas en un dashboard interactivo
- Exportar reportes en PDF
- Gestionar comentarios por tarea
- Control de acceso por roles (admin / member)

---

## Arquitectura

```
cmpa_task_manager/
├── apps/
│   ├── backend/          # API REST — Node.js + Express + TypeScript
│   │   └── src/
│   │       ├── modules/  # auth | projects | tasks | comments | members
│   │       │   ├── *.controller.ts
│   │       │   ├── *.service.ts
│   │       │   ├── *.repository.ts
│   │       │   ├── *.routes.ts
│   │       │   └── *.schemas.ts
│   │       ├── middleware/
│   │       ├── db/
│   │       │   ├── migrations/
│   │       │   └── seeds/
│   │       └── index.ts
│   └── frontend/         # SPA — React + Vite + TypeScript
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           ├── store/
│           └── types/
├── .github/workflows/    # CI/CD — GitHub Actions
├── docker-compose.yml
└── sonar-project.properties
```

### Diagrama de arquitectura

![Arquitectura](docs/imgs/Diagrama%20de%20arquitectura.png)

---

## Modelo de datos

### Diagrama entidad-relación

![ERD](docs/imgs/Diagrama%20entidad-relaci%C3%B3n.png)

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema con roles (admin/member) |
| `projects` | Proyectos con tipo personal/equipo y estado activo/archivado |
| `project_members` | Miembros de proyectos de equipo con estado de invitación (pending/accepted/rejected) |
| `tasks` | Tareas asociadas a proyectos con estado, prioridad y asignado |
| `task_comments` | Comentarios por tarea |
| `audit_log` | Registro de acciones del sistema |

---

## Stack tecnológico

### Backend
- **Node.js + Express** — servidor HTTP y API REST
- **TypeScript** — tipado estático
- **Knex.js** — query builder y migraciones
- **PostgreSQL** — base de datos relacional
- **JWT** — autenticación con access token + refresh token
- **Zod** — validación de esquemas
- **Helmet + CORS** — seguridad HTTP
- **Swagger** — documentación de la API

### Frontend
- **React 18** — interfaz de usuario
- **Vite** — bundler
- **TypeScript** — tipado estático
- **TailwindCSS** — estilos
- **React Query** — gestión de estado del servidor
- **Zustand** — estado global del cliente
- **React Hook Form + Zod** — formularios y validación
- **@hello-pangea/dnd** — drag and drop
- **Recharts** — gráficas
- **jsPDF** — exportación a PDF

### DevOps
- **Docker + Docker Compose** — entorno local
- **GitHub Actions** — CI/CD pipeline
- **SonarCloud** — análisis de calidad de código (+80% cobertura)
- **Render** — despliegue en producción

---

## Seguridad

- Autenticación con JWT (access token 15min + refresh token 7 días)
- Contraseñas hasheadas con bcrypt (salt rounds: 12)
- Helmet para headers HTTP seguros
- CORS configurado por origen
- Rate limiting en endpoints de auth
- Validación de entrada con Zod en backend y frontend
- Control de acceso por roles en rutas protegidas

---

## Tests y calidad

- **Jest + Supertest** — tests de integración del backend (auth, projects, tasks, comments, members)
- **Vitest + Testing Library** — tests del frontend
- **SonarCloud** — análisis estático con Quality Gate configurado al 80% de cobertura
- Pipeline de CI corre los tests en cada push a `main` y `develop`

---

## Ejecución local

### Prerrequisitos
- Docker y Docker Compose instalados
- Node.js 20+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/cmpiedrahita/cmpa_task_manager.git
cd cmpa_task_manager

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Levantar la base de datos con Docker
docker-compose up -d

# 5. Correr migraciones y seeds
npm run migrate
npm run seed

# 6. Levantar el backend
cd apps/backend && npm run dev

# 7. En otra terminal, levantar el frontend
cd apps/frontend && npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Swagger: http://localhost:3000/api/docs

> **Recomendación:** Si no quieres configurar el entorno local, la aplicación está completamente desplegada en Render y lista para usar con las credenciales de prueba indicadas arriba.

---

## CI/CD

![Despliegue](docs/imgs/Diagrama%20de%20despliegue.png)

El pipeline de GitHub Actions se ejecuta en cada push a `main` y `develop` y en cada Pull Request:

1. **Backend Tests** — levanta PostgreSQL, corre migraciones y ejecuta los tests con coverage
2. **Frontend Build** — verifica que el frontend compile sin errores y corre los tests
3. **SonarCloud** — análisis de calidad (solo en Pull Requests y push a `develop`)

El deploy a Render se realiza automáticamente cuando se mergea a `main`.

---

## API Reference

La documentación completa de la API está disponible en Swagger:

**Producción:** https://cmpa-backend.onrender.com/api/docs  
**Local:** http://localhost:3000/api/docs

### Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/refresh` | Renovar access token |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/projects` | Listar proyectos |
| POST | `/api/projects` | Crear proyecto |
| PATCH | `/api/projects/:id` | Actualizar proyecto |
| DELETE | `/api/projects/:id` | Eliminar proyecto |
| GET | `/api/projects/:id/tasks` | Listar tareas del proyecto |
| POST | `/api/projects/:id/tasks` | Crear tarea |
| PATCH | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/tasks/all` | Todas las tareas del usuario |
| GET | `/api/tasks/:id/comments` | Comentarios de una tarea |
| POST | `/api/tasks/:id/comments` | Agregar comentario |
| DELETE | `/api/tasks/:taskId/comments/:id` | Eliminar comentario |
| GET | `/api/projects/:id/members` | Listar miembros del proyecto |
| POST | `/api/projects/:id/members` | Invitar usuario al proyecto |
| GET | `/api/invitations` | Ver invitaciones pendientes |
| PATCH | `/api/invitations/:id` | Aceptar o rechazar invitación |
| GET | `/api/users/search` | Buscar usuarios por nombre o email |

---

## Decisiones de diseño

### Proyectos personales y de equipo
Al crear un proyecto se elige entre tipo personal (solo el creador) o de equipo. Los proyectos de equipo permiten invitar usuarios registrados en la plataforma. Las invitaciones se gestionan con un sistema de aceptar/rechazar accesible desde el navbar. Los miembros aceptados pueden ver el proyecto y cambiar el estado de las tareas, pero solo el owner puede crear, editar y eliminar tareas.

### Polling para invitaciones en tiempo real
En lugar de WebSockets, las invitaciones pendientes se actualizan automáticamente cada 30 segundos mediante `refetchInterval` de React Query. Esto resuelve el problema de sincronización con una solución simple y sin infraestructura adicional.

### Arquitectura en capas (backend)
Cada módulo sigue el patrón **Controller → Service → Repository**, aplicando el principio de responsabilidad única (SRP) de SOLID. El controller maneja HTTP, el service contiene la lógica de negocio y el repository abstrae el acceso a datos.

### Monorepo con npm workspaces
Frontend y backend comparten el mismo repositorio para simplificar el desarrollo y el CI/CD, manteniendo independencia de dependencias entre workspaces.

### Estado local en el Kanban
El board Kanban maneja las tareas en estado local del componente (`localTasks`) y sincroniza con el servidor en segundo plano. Esto elimina el parpadeo visual al hacer drag & drop sin necesidad de WebSockets.

### React Query para estado del servidor
Se usa React Query para cachear las respuestas del servidor, con `staleTime: 0` en las tareas para garantizar datos frescos al navegar entre páginas.

---

## Autor

**Carlos Piedrahita**

---

> Desarrollado como prueba técnica — Full Stack Developer
