# Full-Stack Todo Application (Java 21 + Spring Boot 3 + React + PostgreSQL)

A production-quality Full-Stack Todo Web Application built using modern enterprise Java and React best practices, featuring Spring Security 6 with JWT authentication, role-based authorization, and user data isolation.

---

## Architecture Overview

The repository is organized as a clean monorepo:

```text
to-do-java/
├── backend/                  # Spring Boot 3.x REST API
│   ├── src/main/java/com/example/todo/
│   │   ├── config/           # CORS, MVC & DataInitializer beans
│   │   ├── controller/       # Auth & Todo REST API endpoints
│   │   ├── service/          # Business logic & transaction boundaries (Todo, Auth)
│   │   ├── repository/       # Spring Data JPA repositories & JPA Specifications
│   │   ├── entity/           # Hibernate entities (User, Todo, Role)
│   │   ├── dto/              # Immutable DTO records (Requests & Responses)
│   │   ├── security/         # Spring Security, JWT Service & Auth Filter
│   │   ├── exception/        # Centralized RFC 7807 global exception handling
│   │   └── TodoApplication.java # Spring Boot entry point
│   ├── src/main/resources/
│   │   └── application.yml   # Externalized configuration with env var fallbacks
│   ├── pom.xml               # Maven configuration (Java 21, Spring Boot 3.3.4)
│   └── .env.example          # Environment variables template
├── frontend/                 # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, Modals, ProtectedRoute, etc.)
│   │   ├── context/          # React AuthContext (token storage, session revalidation)
│   │   ├── pages/            # Views (Dashboard, Login, Register, System Health)
│   │   ├── services/         # Centralized Axios API client with JWT interceptors
│   │   ├── types/            # TypeScript interfaces (Todo, Auth, User, Health)
│   │   ├── App.tsx           # React Router & protected route guards
│   │   ├── main.tsx          # Application mount point
│   │   └── index.css         # Tailwind CSS directives & global typography
│   ├── index.html            # HTML entry point with Inter font
│   ├── package.json          # Node dependencies & build scripts
│   ├── tailwind.config.js    # Tailwind theme tokens & color palette
│   └── .env.example          # Frontend environment variables template
├── .gitignore                # Root gitignore for OS, IDE, build artifacts
└── README.md                 # Project documentation & setup instructions
```

---

## Tech Stack

### Backend
- **Language & Runtime:** Java 21 (LTS)
- **Framework:** Spring Boot 3.3.4
- **Security & Tokens:** Spring Security 6, JJWT 0.12.6, BCrypt Password Encoder
- **Build Tool:** Maven
- **Modules:**
  - Spring Web (REST controllers, CORS filter)
  - Spring Security (Stateless JWT authentication, RBAC authorization)
  - Spring Data JPA & Hibernate (Database ORM & dynamic criteria specifications)
  - Jakarta Bean Validation (Declarative input validation)
  - PostgreSQL JDBC Driver (Database connectivity)
  - Spring Boot Test / JUnit 5 / MockMvc (Automated testing)

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Tooling & Bundler:** Vite
- **Styling:** Tailwind CSS (Utility-first styling with custom palette)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Centralized client with JWT request & 401 response interceptors)
- **Routing:** React Router v6 with `<ProtectedRoute>` wrapper

### Database
- **Database Engine:** PostgreSQL 16+

---

## Authentication & Security Features (Phase 5)

1. **Stateless JWT Authentication:** HMAC-SHA256 tokens generated on login/registration with configurable expiration and secrets (`app.jwt.secret`, `app.jwt.expiration-ms`).
2. **BCrypt Password Hashing:** Passwords are never stored in plaintext and are hashed using BCrypt.
3. **Role-Based Access Control (RBAC):**
   - `USER`: Regular users who can create, view, update, complete, and delete their own tasks.
   - `ADMIN`: Administrators with elevated privileges and cross-tenant task visibility.
4. **Tenant Isolation:**
   - Every `Todo` belongs to a `User` (`user_id` foreign key).
   - Changing the task ID in the URL to access another user's task returns `403 Forbidden`.
   - Dynamic search, filters, and pagination queries automatically apply user ownership filtering in `TodoSpecification`.
5. **Default Pre-Seeded Accounts:**
   - **Administrator:** `admin@todo.com` / `admin123` (Role: `ADMIN`)
   - **Demo User:** `john@todo.com` / `password123` (Role: `USER`)

---

## API Endpoints

### Authentication Endpoints (`/api/auth/**`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account and receive JWT | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated (`Bearer <token>`) |

### Todo Endpoints (`/api/todos/**`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/todos` | List user's tasks with search, filters, sorting & pagination | Authenticated (`Bearer <token>`) |
| `POST` | `/api/todos` | Create a new task assigned to authenticated user | Authenticated (`Bearer <token>`) |
| `GET` | `/api/todos/{id}` | Get task details (enforces ownership) | Authenticated (Owner or `ADMIN`) |
| `PUT` | `/api/todos/{id}` | Update task details (enforces ownership) | Authenticated (Owner or `ADMIN`) |
| `PATCH`| `/api/todos/{id}/complete` | Toggle completion status (enforces ownership) | Authenticated (Owner or `ADMIN`) |
| `DELETE`| `/api/todos/{id}` | Delete task (enforces ownership) | Authenticated (Owner or `ADMIN`) |

### Health & Diagnostics (`/api/health`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | System health check (PostgreSQL status, Java version) | Public |

---

## Environment Variables

### Backend (`/backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port for Spring Boot server | `8080` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/tododb` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET` | 256-bit+ HMAC secret key | Externalized in application.yml |
| `JWT_EXPIRATION_MS` | Token validity in milliseconds | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |

### Frontend (`/frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for backend REST API | `http://localhost:8080/api` |

---

## Testing & Verification

### Running Automated Backend Tests
#### Backend Tests (JUnit 5, Mockito, MockMvc)
```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH
mvn test
```
**49 backend tests pass (100%)**, covering:
- Pure unit tests for `TodoService` and `AuthService` with Mockito.
- JJWT token creation, expiration, and signature tampering verification.
- MockMvc integration tests for validation, 404 not found, and 401 unauthenticated requests.
- User data isolation: regular users accessing another user's task ID receives `403 Forbidden`.
- Admin privileges: elevated cross-tenant visibility.

#### Frontend Tests (Vitest, React Testing Library)
```bash
cd frontend
npm test
```
**22 frontend tests pass (100%)**, covering:
- Protected routes and session initialization guards.
- Login & Register views with form validation and demo account autofill.
- Task CRUD: list rendering, create modal, edit modal, status toggle, and delete confirmation.
- Status and Priority filtering.

### Quick Curl Verification Examples

**1. Login as John Doe:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@todo.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

**2. Fetch User Profile:**
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/auth/me | jq
```

**3. Fetch User's Scoped Tasks:**
```bash
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/todos?priority=HIGH" | jq
```

**4. Attempt Cross-User Access (returns 403 Forbidden):**
```bash
curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/todos/999
```

---

## Running with Docker Compose (Production Setup)

The application includes production-ready multi-stage Docker builds and Docker Compose orchestration for one-command deployment.

### 1. Prerequisites
- Docker Engine & Docker Compose (or Colima / Docker Desktop)

### 2. Environment Configuration
Copy the environment template and customize as needed:
```bash
cp .env.example .env
```
Default configuration:
- `POSTGRES_PORT=5433` (maps container PostgreSQL 5432 to host 5433, avoiding local port conflicts)
- `BACKEND_PORT=8080`
- `FRONTEND_PORT=3000`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/tododb`
- `VITE_API_BASE_URL=/api` (Nginx proxies `/api` directly to backend container)

### 3. Build & Launch Services
Build images and start containers in the background:
```bash
docker compose up --build -d
```

Check container status and health:
```bash
docker compose ps
```
All three services (`todo-postgres`, `todo-backend`, `todo-frontend`) will report `(healthy)`.

### 4. Access the Application
- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:8080/api](http://localhost:8080/api)
- **Health Check Endpoint:** [http://localhost:8080/api/health](http://localhost:8080/api/health) or [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Nginx Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

### 5. Verify PostgreSQL Data Persistence
PostgreSQL data is mounted to a named Docker volume (`todo_postgres_data`):
```bash
# Stop containers (volume remains intact)
docker compose down

# Restart containers
docker compose up -d
```
All users, authentication data, and tasks persist seamlessly across container restarts.

To stop containers and completely remove volumes (reset database):
```bash
docker compose down -v
```

---

## Docker Architecture & Multi-Stage Builds

### Backend (`backend/Dockerfile`)
- **Stage 1 (Builder):** `maven:3.9-eclipse-temurin-21-alpine`
  - Caches dependencies using `COPY pom.xml` and `mvn dependency:resolve -B`.
  - Compiles source code and packages executable fat JAR with `mvn clean package -DskipTests -B`.
- **Stage 2 (Runtime):** `eclipse-temurin:21-jre-alpine`
  - Minimal Alpine Linux JRE image (~150MB).
  - Unprivileged non-root user `spring:spring` for container security.
  - Container-aware JVM memory tuning (`-XX:+UseG1GC -XX:MaxRAMPercentage=75.0`).
  - Active profile set to `prod` (`application-prod.yml`).
  - Docker health check polling `/api/health`.

### Frontend (`frontend/Dockerfile` & `frontend/nginx.conf`)
- **Stage 1 (Builder):** `node:20-alpine`
  - Clean reproducible install with `npm ci`.
  - Builds optimized static assets using Vite (`npm run build`).
- **Stage 2 (Runtime):** `nginx:1.27-alpine`
  - High-performance, lightweight web server (~25MB).
  - Reverse proxy `/api/` requests to `http://backend:8080/api/` (eliminates CORS in production).
  - SPA client-side routing fallback (`try_files $uri $uri/ /index.html`).
  - Production security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
  - Gzip compression enabled for HTML, CSS, JS, SVG, and JSON.
  - Dedicated `/health` endpoint for Docker container probes.

### PostgreSQL Database (`postgres:16-alpine`)
- Persisted with named volume `todo_postgres_data`.
- Automated health check via `pg_isready -U postgres -d tododb`.
- Network isolated on internal Docker bridge network `todo_network`.

---

## Running the Application Locally (Native Development)

### 1. Database Setup
Ensure PostgreSQL is running:
```bash
createdb tododb
```

### 2. Start Backend Server
```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`.

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
Navigate to `http://localhost:5173` to test the login page with pre-seeded demo accounts!
