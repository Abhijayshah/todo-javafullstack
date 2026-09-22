# Full-Stack Todo Application — Project History Log

This document chronicles the complete end-to-end development lifecycle of the Full-Stack Todo Application, detailing the technical decisions, architecture, files created/modified, and verification results across each phase and user prompt.

---

## Table of Contents
1. [Phase 1: Project Foundation & Architecture Setup](#phase-1-project-foundation--architecture-setup)
2. [Phase 2: Complete Todo CRUD Backend](#phase-2-complete-todo-crud-backend)
3. [Phase 3: React Frontend & REST API Integration](#phase-3-react-frontend--rest-api-integration)
4. [Phase 4: Advanced Search, Filtering, Sorting & Pagination](#phase-4-advanced-search-filtering-sorting--pagination)
5. [Phase 5: Spring Security, JWT Authentication & User Data Isolation](#phase-5-spring-security-jwt-authentication--user-data-isolation)
6. [Phase 6: Comprehensive Automated Testing Suite](#phase-6-comprehensive-automated-testing-suite)
7. [Phase 7: Containerization & Production Deployment (Docker Compose)](#phase-7-containerization--production-deployment-docker-compose)

---

## Phase 1: Project Foundation & Architecture Setup

### Objective
Establish a clean monorepo architecture separating the backend and frontend, configure Java 21 LTS with Spring Boot 3.3.4, set up PostgreSQL database connectivity using externalized environment variables, and scaffold the React 18 TypeScript frontend with Vite and Tailwind CSS.

### Key Changes Made
- **Monorepo Directory Layout:**
  - Created `/backend` (Maven-based Spring Boot enterprise service).
  - Created `/frontend` (Vite + React + TypeScript Single Page Application).
- **Backend Setup (`/backend`):**
  - Configured `pom.xml` targeting Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Jakarta Validation, and PostgreSQL JDBC driver.
  - Layered package structure: `config`, `controller`, `dto`, `entity`, `exception`, `repository`, `service`.
  - Configured `application.yml` with externalized environment variable interpolations and safe defaults.
  - Implemented initial system health diagnostic endpoint (`GET /api/health`) reporting database connection status and runtime JVM version.
  - Added CORS configuration allowing frontend origin communication.
- **Frontend Setup (`/frontend`):**
  - Initialized Vite with React 18 and TypeScript.
  - Configured Tailwind CSS with custom dark-mode aesthetic color tokens.
  - Added Axios API client with configurable base URL via `.env`.
  - Implemented responsive navigation header, status badges, and health diagnostics dashboard.
- **Root Configuration:**
  - Added `.gitignore` to prevent committing build artifacts, OS caches, and sensitive environment files.

### Artifacts & Files
- `backend/pom.xml`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/example/todo/TodoApplication.java`
- `backend/src/main/java/com/example/todo/controller/HealthController.java`
- `backend/src/main/java/com/example/todo/config/CorsConfig.java`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tailwind.config.js`
- `frontend/src/services/api.ts`
- `frontend/src/pages/HomePage.tsx`

---

## Phase 2: Complete Todo CRUD Backend

### Objective
Implement the complete Todo entity and REST API lifecycle following enterprise layered architecture, DTO pattern, Jakarta validation, and RFC 7807 global exception handling.

### Key Changes Made
- **Domain Modeling & Persistence:**
  - Created `Todo` JPA entity mapped to the `todos` table with fields: `id` (Long, PK), `title` (String), `description` (String), `completed` (Boolean), `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`), `dueDate` (LocalDate), `createdAt` (LocalDateTime), and `updatedAt` (LocalDateTime).
  - Configured Hibernate `@PrePersist` and `@PreUpdate` lifecycle callbacks for automatic timestamp management.
  - Created `TodoRepository` extending `JpaRepository<Todo, Long>`.
- **DTOs & Data Transfer:**
  - Created immutable Java records `TodoRequest` (with `@NotBlank`, `@Size(max = 255)` for title, `@Size(max = 2000)` for description, and non-null priority) and `TodoResponse`.
- **Service & Business Logic:**
  - Created `TodoService` interface and `TodoServiceImpl` handling transactions (`@Transactional`), DTO mapping, and business exception checks.
- **REST API Endpoints (`TodoController`):**
  - `POST /api/todos`: Create a new task (201 Created).
  - `GET /api/todos`: Retrieve all tasks (200 OK).
  - `GET /api/todos/{id}`: Retrieve task by ID (200 OK or 404 Not Found).
  - `PUT /api/todos/{id}`: Update task fields (200 OK).
  - `PATCH /api/todos/{id}/complete`: Toggle task completion state (200 OK).
  - `DELETE /api/todos/{id}`: Delete task (204 No Content).
- **Centralized Error Handling:**
  - Created `GlobalExceptionHandler` with `@RestControllerAdvice`.
  - Added `ResourceNotFoundException` returning RFC 7807 compliant error responses.
  - Added validation error formatting returning field-specific violation details.

### Artifacts & Files
- `backend/src/main/java/com/example/todo/entity/Todo.java`
- `backend/src/main/java/com/example/todo/entity/Priority.java`
- `backend/src/main/java/com/example/todo/repository/TodoRepository.java`
- `backend/src/main/java/com/example/todo/dto/TodoRequest.java`
- `backend/src/main/java/com/example/todo/dto/TodoResponse.java`
- `backend/src/main/java/com/example/todo/service/TodoService.java`
- `backend/src/main/java/com/example/todo/service/impl/TodoServiceImpl.java`
- `backend/src/main/java/com/example/todo/controller/TodoController.java`
- `backend/src/main/java/com/example/todo/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/example/todo/exception/ResourceNotFoundException.java`
- `backend/src/main/java/com/example/todo/exception/ErrorResponse.java`

---

## Phase 3: React Frontend & REST API Integration

### Objective
Build a modern, responsive React dashboard connected to the backend REST API with rich UI/UX, modals for CRUD operations, loading/error states, and real-time state synchronization.

### Key Changes Made
- **Centralized API Client:**
  - Configured Axios instance with interceptors, standardized error handling, and environment-driven `VITE_API_BASE_URL`.
  - Implemented typed API service functions for all Todo endpoints.
- **Components & UI Modals:**
  - `TodoModal`: Form for creating and editing tasks with title, description, priority radio buttons, and due date picker.
  - `TodoDetailsModal`: Read-only view showing timestamps, priority chips, status, and full description.
  - `DeleteConfirmModal`: Confirmation modal to prevent accidental task deletion.
- **Dashboard Views & Interactions:**
  - Implemented `DashboardPage` displaying statistical metric cards (Total, Pending, Completed %, High Priority).
  - Responsive task list cards with completion checkbox, priority color indicators, and quick action buttons.
  - Real-time strike-through text styling and completion toggle animations.
  - Graceful handling of loading spinners, empty state illustrations, and error alerts.

### Artifacts & Files
- `frontend/src/services/todoService.ts`
- `frontend/src/types/todo.ts`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/components/TodoModal.tsx`
- `frontend/src/components/TodoDetailsModal.tsx`
- `frontend/src/components/DeleteConfirmModal.tsx`
- `frontend/src/components/Navbar.tsx`

---

## Phase 4: Advanced Search, Filtering, Sorting & Pagination

### Objective
Implement server-side search, multi-field filtering, multi-attribute sorting, and pagination across both backend JPA specifications and the frontend React UI.

### Key Changes Made
- **Backend Spring Data JPA Specification:**
  - Implemented `TodoSpecification` using JPA Criteria API.
  - Dynamic multi-predicate query generation:
    - Text search matching case-insensitively across `title` and `description`.
    - Status filtering (`PENDING` vs `COMPLETED`).
    - Priority filtering (`LOW`, `MEDIUM`, `HIGH`).
  - Added pagination and multi-attribute sorting (`createdAt`, `dueDate`, `priority`, `title`) in ascending/descending order.
  - Updated `GET /api/todos` to accept pagination parameters (`page`, `size`, `search`, `status`, `priority`, `sortBy`, `sortDirection`) and return a `PageResponse<TodoResponse>`.
- **Frontend Filter Bar & Controls:**
  - Built custom debounced search input (`useDebounce`) to minimize redundant network requests.
  - Added status toggle pill buttons (`All`, `Pending`, `Completed`).
  - Added Priority filter dropdown and Sort By selector.
  - Implemented pagination footer controls displaying active page number, total pages, record counts, and items per page selector.

### Artifacts & Files
- `backend/src/main/java/com/example/todo/repository/TodoSpecification.java`
- `backend/src/main/java/com/example/todo/dto/PageResponse.java`
- `backend/src/main/java/com/example/todo/controller/TodoController.java`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/hooks/useDebounce.ts`

---

## Phase 5: Spring Security, JWT Authentication & User Data Isolation

### Objective
Secure the application with Spring Security 6, JWT token authentication, BCrypt password hashing, and user data isolation where every task belongs to a user and cross-tenant access is strictly forbidden.

### Key Changes Made
- **Security & User Entity Model:**
  - Created `User` entity mapped to the `users` table with fields `id`, `name`, `email` (unique), `password` (BCrypt hashed), `role` (`ROLE_USER`, `ROLE_ADMIN`), and `createdAt`.
  - Added `UserRepository` and implemented Spring Security `UserDetailsService`.
  - Added Many-to-One relationship from `Todo` to `User` (`user_id` foreign key).
- **Stateless JWT Security Architecture:**
  - Implemented `JwtService` using JJWT 0.12.6 with HMAC-SHA256 signing, claims extraction, and token expiration checks.
  - Implemented `JwtAuthenticationFilter` intercepting `Authorization: Bearer <token>` headers.
  - Configured `SecurityFilterChain` with stateless session management (`SessionCreationPolicy.STATELESS`), BCrypt password encoder, and secure route matchers.
  - Externalized JWT secret and expiration time to environment variables.
- **Authentication Endpoints:**
  - `POST /api/auth/register`: Create user account, hash password, and issue JWT.
  - `POST /api/auth/login`: Authenticate credentials and issue JWT.
  - `GET /api/auth/me`: Return authenticated profile details.
- **Multi-Tenancy & User Isolation:**
  - Scoped all Todo CRUD operations to the authenticated user.
  - Attempting to access, edit, complete, or delete another user's task ID returns `403 Forbidden`.
  - Allowed `ADMIN` role supervisory cross-tenant visibility.
  - Pre-seeded accounts in `DataInitializer`:
    - Demo User: `john@todo.com` / `password123` (Role: `USER`)
    - Administrator: `admin@todo.com` / `admin123` (Role: `ADMIN`)
- **Frontend Auth Integration:**
  - Built `AuthContext` managing token storage in `localStorage`, active user state, and session initialization.
  - Built `ProtectedRoute` routing component guarding authenticated views.
  - Built `LoginPage` with one-click demo account autofill buttons and `RegisterPage` with form validation.
  - Configured Axios request interceptor to automatically attach `Bearer <token>` to all protected calls.

### Artifacts & Files
- `backend/src/main/java/com/example/todo/entity/User.java`
- `backend/src/main/java/com/example/todo/entity/Role.java`
- `backend/src/main/java/com/example/todo/repository/UserRepository.java`
- `backend/src/main/java/com/example/todo/security/JwtService.java`
- `backend/src/main/java/com/example/todo/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/com/example/todo/security/SecurityConfig.java`
- `backend/src/main/java/com/example/todo/service/AuthService.java`
- `backend/src/main/java/com/example/todo/controller/AuthController.java`
- `backend/src/main/java/com/example/todo/config/DataInitializer.java`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`

---

## Phase 6: Comprehensive Automated Testing Suite

### Objective
Create a comprehensive automated testing suite covering unit tests, integration tests, validation edge cases, authorization isolation, and frontend component workflows.

### Key Changes Made
- **Backend Test Suite (49 Tests, 100% Pass Rate):**
  - `TodoServiceTest` (11 tests): Pure unit tests with Mockito verifying creation, updates, completion toggle, deletion, and user ownership isolation.
  - `AuthServiceTest` (6 tests): Unit tests verifying registration, duplicate email handling (409 Conflict), login authentication, and bad credentials rejection.
  - `JwtServiceTest` (5 tests): Tests verifying token generation, claims extraction, expired token rejection, and tampered signature detection.
  - `TodoControllerTest` (16 tests): MockMvc integration tests verifying endpoint status codes, 401 unauthenticated access, 403 cross-tenant access violation, validation constraints, and pagination.
  - `AuthControllerTest` (10 tests): MockMvc tests for register, login, profile, and validation constraints.
  - `HealthControllerTest` (1 test): System health diagnostics verification.
- **Frontend Test Suite (22 Tests, 100% Pass Rate):**
  - Setup Vitest with jsdom and React Testing Library.
  - `ProtectedRoute.test.tsx` (3 tests): Tests session spinner, unauthenticated redirect to `/login`, and protected view rendering.
  - `LoginPage.test.tsx` (6 tests): Form rendering, demo account autofill, empty field validation, successful login redirection, and bad credentials banner.
  - `RegisterPage.test.tsx` (5 tests): Password confirmation matching, short password validation, successful registration, and duplicate email error display.
  - `DashboardPage.test.tsx` (8 tests): Task list rendering, metric card counters, filter interactions, create modal submission, and status toggle.

### Test Results Summary
- **Total Tests:** 71
- **Passed:** 71 (100%)
- **Failed:** 0

### Artifacts & Files
- `backend/src/test/java/com/example/todo/TodoServiceTest.java`
- `backend/src/test/java/com/example/todo/AuthServiceTest.java`
- `backend/src/test/java/com/example/todo/JwtServiceTest.java`
- `backend/src/test/java/com/example/todo/TodoControllerTest.java`
- `backend/src/test/java/com/example/todo/AuthControllerTest.java`
- `backend/src/test/java/com/example/todo/HealthControllerTest.java`
- `frontend/src/components/__tests__/ProtectedRoute.test.tsx`
- `frontend/src/pages/__tests__/LoginPage.test.tsx`
- `frontend/src/pages/__tests__/RegisterPage.test.tsx`
- `frontend/src/pages/__tests__/DashboardPage.test.tsx`

---

## Phase 7: Containerization & Production Deployment (Docker Compose)

### Objective
Package the full-stack application into production-grade multi-stage Docker containers, configure Docker Compose orchestration with PostgreSQL data persistence, automate health checks, configure reverse proxying, and resolve host port collisions.

### Key Changes Made
- **Backend Container (`backend/Dockerfile`):**
  - Multi-stage build:
    - Stage 1: `maven:3.9-eclipse-temurin-21-alpine` caches dependencies (`mvn dependency:resolve -B`) and compiles executable JAR.
    - Stage 2: `eclipse-temurin:21-jre-alpine` creates minimal ~150MB runtime image.
  - Runs under unprivileged non-root user `spring:spring`.
  - JVM container memory tuning: `-XX:+UseG1GC -XX:MaxRAMPercentage=75.0`.
  - Integrated health check polling `curl -f http://localhost:8080/api/health`.
  - Production profile configuration: `application-prod.yml` with HikariCP tuning and `ddl-auto: update`.
- **Frontend Container (`frontend/Dockerfile` & `frontend/nginx.conf`):**
  - Multi-stage build:
    - Stage 1: `node:20-alpine` runs `npm ci` and builds optimized static bundle via `npm run build`.
    - Stage 2: `nginx:1.27-alpine` provides lightweight ~25MB production web server.
  - Nginx reverse proxies `/api/` to `http://backend:8080/api/`, eliminating cross-origin issues in production.
  - SPA client-side routing fallback (`try_files $uri $uri/ /index.html`).
  - Security headers enabled (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
  - Gzip compression for static text/js/css/json assets.
  - Native healthcheck polling `http://127.0.0.1:80/health`.
- **Database Container & Volume Persistence (`docker-compose.yml`):**
  - PostgreSQL 16 image (`postgres:16-alpine`).
  - Persistent named Docker volume `todo_postgres_data`.
  - Automated health check: `pg_isready -U postgres -d tododb`.
  - Orchestration dependencies with `condition: service_healthy`.
- **Host Port Management:**
  - Resolved port 3000 collision (where Antigravity IDE static server was bound) by mapping the frontend container to port **5173**.
  - PostgreSQL mapped to host port **5433** to avoid collisions with local native PostgreSQL on port 5432.
  - Backend mapped to port **8080**.
- **Data Persistence Verification:**
  - Created task *"Docker Volume Persistence Task"* via containerized API.
  - Executed `docker compose down` (removing containers and networks, keeping volume).
  - Executed `docker compose up -d`.
  - Successfully retrieved the task from the database intact, verifying data persistence across container restarts.

### Artifacts & Files
- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/src/main/resources/application-prod.yml`
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/nginx.conf`
- `docker-compose.yml`
- `.env.example`
- `.gitignore`
- `README.md`
- `walkthrough.md`
- `history_log.md`
