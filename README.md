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
```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH
mvn clean test
```
All 17 integration tests pass, covering:
- User registration and duplicate email conflicts (`409 Conflict`).
- User authentication and bad credential handling (`401 Unauthorized`).
- User isolation: regular users accessing another user's task ID receives `403 Forbidden`.
- Search, filter, sorting, and pagination queries.

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

## Running the Application Locally

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
