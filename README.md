# Full-Stack Todo Application (Java 21 + Spring Boot 3 + React + PostgreSQL)

A production-quality Full-Stack Todo Web Application built using modern enterprise Java and React best practices.

---

## Architecture Overview

The repository is organized as a clean monorepo:

```text
to-do-java/
├── backend/                  # Spring Boot 3.x REST API
│   ├── src/main/java/com/example/todo/
│   │   ├── config/           # CORS & MVC configuration beans
│   │   ├── controller/       # REST API endpoints & HTTP request handling
│   │   ├── service/          # Business logic & transaction boundaries (Phase 2)
│   │   ├── repository/       # Spring Data JPA interfaces (Phase 2)
│   │   ├── entity/           # Hibernate JPA database entities (Phase 2)
│   │   ├── dto/              # Immutable DTO records (Requests & Responses)
│   │   ├── exception/        # Global exception handling & error models
│   │   └── TodoApplication.java # Spring Boot entry point
│   ├── src/main/resources/
│   │   └── application.yml   # Externalized configuration with env var fallbacks
│   ├── pom.xml               # Maven configuration (Java 21, Spring Boot 3.3.4)
│   └── .env.example          # Environment variables template
├── frontend/                 # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, StatusBadge, etc.)
│   │   ├── pages/            # Page views (HomePage, Dashboard, etc.)
│   │   ├── services/         # Centralized Axios API client
│   │   ├── types/            # TypeScript interfaces & types
│   │   ├── App.tsx           # React Router & shell layout
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
- **Build Tool:** Maven
- **Modules:**
  - Spring Web (REST controllers, CORS filter)
  - Spring Data JPA & Hibernate (Database ORM)
  - Jakarta Bean Validation (Declarative input validation)
  - PostgreSQL JDBC Driver (Database connectivity)
  - Spring Boot Test / JUnit 5 / MockMvc (Automated testing)

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Tooling & Bundler:** Vite
- **Styling:** Tailwind CSS (Utility-first styling with custom palette)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Centralized client with response interceptors)
- **Routing:** React Router v6

### Database
- **Database Engine:** PostgreSQL 16+

---

## Backend Layered Architecture

The backend strictly adheres to layered architecture principles to decouple concerns:

1. **Controller Layer (`controller/`)**: Exposes REST endpoints, handles HTTP status codes, and accepts validated DTOs.
2. **Service Layer (`service/`)**: Contains core business logic, domain rules, and transaction boundaries (`@Transactional`).
3. **Repository Layer (`repository/`)**: Spring Data JPA repositories interfacing with PostgreSQL.
4. **Entity Layer (`entity/`)**: Relational database entities mapped via Hibernate.
5. **DTO Layer (`dto/`)**: Java 21 `record` classes used for requests and responses. JPA entities are **never** exposed directly to API consumers.
6. **Exception Layer (`exception/`)**: Centralized `@RestControllerAdvice` producing RFC 7807-compliant structured error responses.
7. **Config Layer (`config/`)**: Global application configuration such as CORS policies and web MVC settings.

---

## Environment Variables

### Backend (`/backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port for Spring Boot server | `8080` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/tododb` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password | `postgres` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |

### Frontend (`/frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for backend REST API | `http://localhost:8080/api` |

---

## Getting Started

### Prerequisites
- **Java 21** (`openjdk@21`)
- **Maven 3.9+**
- **Node.js 20+** & **npm 10+**
- **PostgreSQL 16+**

### 1. Database Setup
Create the PostgreSQL database:
```bash
createdb tododb
# Or via psql:
# CREATE DATABASE tododb;
```

### 2. Running the Backend
From the repository root:
```bash
cd backend
mvn spring-boot:run
```
The backend will start at `http://localhost:8080`.

Verify the health endpoint:
```bash
curl -s http://localhost:8080/api/health | jq
```

Expected response:
```json
{
  "status": "UP",
  "message": "Todo API is operational",
  "timestamp": "2026-09-22T00:00:00Z",
  "environment": "development",
  "details": {
    "service": "todo-backend",
    "version": "0.0.1-SNAPSHOT",
    "javaVersion": "21.0.12",
    "database": "CONNECTED"
  }
}
```

### 3. Running the Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The dashboard will automatically ping the backend health endpoint and display live system diagnostics.

---

## Development Roadmap

- **Phase 1: Project Foundation & Architecture** *(Current)*
  - Monorepo structure, Spring Boot 3 + Java 21, React + Vite + Tailwind, Axios, CORS, `GET /api/health`.
- **Phase 2: Todo CRUD Backend**
  - Todo entity, repository, service, controller, DTOs, validation, exception handling.
- **Phase 3: React Frontend CRUD**
  - Dashboard, Todo list, create/edit modals, status toggle, delete confirmation.
- **Phase 4: Search, Filter & Pagination**
  - Title/description search, status & priority filters, sorting, Spring Data JPA pagination.
- **Phase 5: Authentication & Authorization**
  - Spring Security, JWT authentication, user registration/login, user-scoped Todos.
- **Phase 6: Automated Testing**
  - Comprehensive unit and integration test suite (JUnit 5, Mockito, MockMvc).
- **Phase 7: Docker & Production Deployment**
  - Multi-stage Dockerfiles, docker-compose orchestration, persistent database volume.
