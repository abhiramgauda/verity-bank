# Verity Bank — Full-Stack Banking Application

A full-stack banking platform with a Spring Boot REST API and a React frontend, containerized with Docker and backed by MySQL. Built as a portfolio project demonstrating secure authentication, layered backend architecture, and a custom-designed frontend integrated into the same deployable artifact.

## Live Demo

_Add your deployed URL here once hosted (see Deployment section)._

## Screenshots

_Add screenshots of the sign-in screen, dashboard/overview, and transactions page here._

## Architecture

```
┌─────────────────────────────┐
│        Browser               │
│  React SPA (Vite build)      │
└──────────────┬───────────────┘
               │  HTTPS / JWT Bearer
               ▼
┌─────────────────────────────────────────┐
│           Spring Boot Application         │
│  ┌───────────────┐   ┌──────────────────┐ │
│  │ Static Assets  │   │  REST Controllers │ │
│  │ (React build)  │   │  /api/v1/**       │ │
│  └───────────────┘   └────────┬──────────┘ │
│                                │             │
│                    Spring Security + JWT     │
│                                │             │
│                       Service Layer          │
│                                │             │
│                    Spring Data JPA / Hibernate│
└────────────────────────────┬─────────────────┘
                              ▼
                    ┌───────────────────┐
                    │      MySQL 8        │
                    └───────────────────┘
```

The React app is compiled and served **from the same Spring Boot application** as static resources — one deployable unit, one port, no separate frontend server or CORS configuration needed in production.

## Tech Stack

**Backend**
- Java 17, Spring Boot
- Spring Security + JWT (stateless authentication)
- Spring Data JPA / Hibernate
- MySQL 8
- Maven

**Frontend**
- React 19 + Vite
- Vanilla CSS with a custom design system (no UI framework)
- Context API for auth/toast state (no external state library)

**Infrastructure**
- Docker multi-stage build (Maven build stage → slim JRE runtime image)
- Docker Compose (app + MySQL, networked, health-checked startup order)

## Features

- **JWT-based authentication** — register, sign in, stateless session via Bearer token
- **Accounts** — open and close bank accounts, IBAN-based
- **Transactions** — record deposits and transfers, full transaction ledger per user
- **Beneficiaries** — save frequent transfer recipients
- **Statistics** — account balance, highest transfer, highest deposit per user
- **Admin back office** — activate/deactivate user accounts (role-gated via `ROLE_ADMIN`)

## Project Structure

```
.
├── banking-fixed/                    # Spring Boot backend (deployable unit)
│   ├── src/main/java/com/bank/banking/
│   │   ├── controlleurs/             # REST controllers
│   │   ├── Services/                 # Service layer (interfaces + impl)
│   │   ├── models/                   # JPA entities
│   │   ├── dto/                      # Request/response DTOs
│   │   ├── config/                   # Security, JWT, CORS config
│   │   └── validator/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── static/                   # Compiled React build (served by Spring Boot)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pom.xml
│
└── frontend-react-source/            # React source (edit here, then rebuild into static/)
    ├── src/
    │   ├── pages/                    # Overview, Transactions, Contacts, Accounts, Admin, Settings
    │   ├── components/                # Sidebar, LedgerTable, shared UI
    │   ├── AuthContext.jsx
    │   ├── ToastContext.jsx
    │   └── api.js
    ├── vite.config.js
    └── package.json
```

## Getting Started

### Option A — Docker Compose (recommended)

Runs the full stack (app + MySQL) with one command. Requires Docker Desktop.

```bash
cd banking-fixed
docker compose up --build
```

Then open **http://localhost:8083/**.

> If port `3306` is already in use on your machine (e.g. a local MySQL install), edit the `ports` mapping under the `mysql` service in `docker-compose.yml` — only the host-side port needs to change; the app connects to MySQL over the internal Docker network regardless.

### Option B — Run locally without Docker

Requires Java 17, Maven, and a running MySQL instance.

```bash
cd banking-fixed
# update src/main/resources/application.properties with your local MySQL credentials
mvn spring-boot:run
```

### Frontend development (hot reload)

The compiled React app already lives in `banking-fixed/src/main/resources/static/` and is served automatically — you don't need Node.js just to run the app. Only set this up if you're editing the frontend:

```bash
cd frontend-react-source
npm install
npm run dev
```

This starts Vite on `http://localhost:5173` with a dev proxy to the backend on `8083` (configured in `vite.config.js`). When done, rebuild and re-integrate:

```bash
npm run build
# copy the contents of dist/ into banking-fixed/src/main/resources/static/
```

## API Overview

All endpoints are under `/api/v1`. Authenticated endpoints require an `Authorization: Bearer <token>` header, obtained from `/auth/authenticate` or `/auth/register`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account, returns a JWT |
| POST | `/auth/authenticate` | Sign in, returns a JWT |
| GET | `/accounts` | List all accounts |
| POST | `/accounts` | Open an account for a user |
| DELETE | `/accounts/{id}` | Close an account |
| GET | `/transactions/user/{userId}` | List a user's transactions |
| POST | `/transactions` | Record a deposit or transfer |
| GET | `/contacts/user/{userId}` | List a user's saved beneficiaries |
| POST | `/contacts` | Add a beneficiary |
| DELETE | `/contacts/{id}` | Remove a beneficiary |
| GET | `/statistics/{userId}` | Balance, highest transfer, highest deposit |
| GET | `/admin/users/active` | List active users (admin only) |
| GET | `/admin/users/inactive` | List inactive users (admin only) |
| PATCH | `/users/validate/{id}` | Activate a user (admin only) |
| PATCH | `/users/invalidate/{id}` | Deactivate a user (admin only) |

## Notes / Design Decisions

- JWTs are stateless (`SessionCreationPolicy.STATELESS`); no server-side session storage.
- JWT expiration is set to 24 hours in `application.properties`.
- The React build is committed to the repository under `static/` rather than built as part of the Docker image — this keeps the Dockerfile focused on the backend and avoids requiring Node.js in the image. Frontend changes must be rebuilt and re-copied before committing.

## License

This project is for portfolio and educational purposes.
