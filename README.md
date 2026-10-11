# MobileChat Gateway

The **API Gateway** of the MobileChat messenger — a single **HTTP/JSON** entry point built
with **NestJS 12**. It fronts the separate backend microservices and hides them from clients:

- **Auth** — proxied to the `MobileChat-Auth` gRPC microservice (`auth.v1`)
- **Chat** — proxied to the chat gRPC service (`chat.v1`)
- **Mail** — published to RabbitMQ (`send_code`) and consumed by `MobileChatBackend`
- **Search / send-code** — served locally via **Prisma (PostgreSQL)**

Swagger UI is available at `/docs`.

---

## Tech stack

| Layer        | Tool                                         |
| ------------ | -------------------------------------------- |
| Framework    | NestJS 12                                    |
| HTTP         | Express (`@nestjs/platform-express`)         |
| gRPC client  | `@tumy/mobile-chat-grpc` (ts-proto, nestJs)  |
| Messaging    | RabbitMQ (`amqp-connection-manager`)         |
| Database     | PostgreSQL via Prisma 7 (`prisma-client`)    |
| Auth         | JWT (access/refresh) validation via Auth RPC |
| Docs         | Swagger / OpenAPI                            |
| Language     | TypeScript 6, ESM                            |
| Linting      | oxlint                                      |
| Package      | yarn (Plug'n'Play)                           |

## Architecture

```
                 ┌─────────────────────────────┐
  Browser / RN ─►│  MobileChat Gateway (HTTP)  │
                 └──────┬──────────┬───────────┘
                        │          │
                 gRPC   │          │ RabbitMQ
              (auth.v1)│          │ "send_code"
                        ▼          ▼
                MobileChat-Auth     MobileChatBackend
                (register/login/)   (mail queue worker)
                   refresh/me
                        │
                        │ gRPC (chat.v1)
                        ▼
                   Chat service
                        │
              local Prisma (PostgreSQL)
              ├── search-people
              └── user_code upsert (send-code)
```

## HTTP API

| Method | Path            | Auth        | Description                              |
| ------ | --------------- | ----------- | ---------------------------------------- |
| POST   | `/auth/register`| no          | Register a user (via Auth gRPC)          |
| POST   | `/auth/login`   | no          | Login by name + password                 |
| POST   | `/auth/refresh` | no          | Rotate refresh token                     |
| POST   | `/auth/logout`  | no          | Revoke refresh token                     |
| GET    | `/auth/me`      | Bearer JWT  | Current user profile                     |
| POST   | `/send-code`    | no          | Issue/save email code (RabbitMQ + DB)    |
| GET    | `/search-people`| Bearer JWT  | Search confirmed users by nick           |
| GET    | `/chats`        | Bearer JWT  | Chat list (via chat gRPC service)        |
| GET    | `/`             | no          | Health / hello                          |
| GET    | `/docs`         | no          | Swagger UI                              |

Protected routes use a `JwtAuthGuard` that validates the token **remotely** by calling the
Auth service's `Me` RPC (`src/common/auth.guard.ts`).

## Project structure

```
src/
├── main.ts
├── app.module.ts · app.controller.ts · app.service.ts
├── prisma/
│   ├── prisma.module.ts · prisma.service.ts   # global Prisma provider
│   └── schema.prisma                           # User, UserCode
├── common/
│   ├── auth.guard.ts                           # remote JWT guard (Auth gRPC Me)
│   └── nick.ts
└── module/
    ├── auth/            # auth.v1 gRPC client (register/login/refresh/logout/me)
    │   ├── auth.grpc.ts · auth.controller.ts · auth.module.ts
    │   └── dto/
    ├── send-code/       # RabbitMQ client + user_code persistence
    │   ├── send-code.rmq.ts · send-code.controller.ts · send-code.module.ts
    │   └── dto/
    ├── chat/            # chat.v1 gRPC client
    │   ├── chat.grcp.ts · chat.controller.ts · chat.module.ts
    └── search-people/   # local Prisma search
        ├── search-people.controller.ts · search-people.service.ts · search-people.module.ts
        └── dto/
```

## Getting started

### Prerequisites

- Node.js 20+ with `corepack`
- PostgreSQL database with applied Prisma migrations
- Running `MobileChat-Auth`, `MobileChatBackend` (RabbitMQ), chat service
- RabbitMQ server

### Install & run

```bash
corepack enable
yarn install
npx prisma migrate dev            # apply migrations locally
yarn start:dev                    # http://localhost:3000  ·  Swagger: /docs
```

## Configuration (`.env`)

| Variable           | Default   | Description                                  |
| ------------------ | --------- | -------------------------------------------- |
| `PORT`             | `3000`    | HTTP port                                    |
| `DATABASE_URL`     | _(required)_ | PostgreSQL connection string              |
| `AUTH_SERVICE_URL` | _(required)_ | gRPC address of the Auth microservice     |
| `URL`              | _(required)_ | gRPC address of the Chat service          |
| `RABBITMQ_URL`     | `amqp://guest:guest@localhost:5672` | RabbitMQ connection string |

## Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `yarn build`     | `nest build`              |
| `yarn start`     | `nest start`              |
| `yarn start:dev` | `nest start --watch`      |
| `yarn start:prod`| `node dist/main.js`      |

## Notes

- This service reads the DB directly for `search-people` (and `user_code`) — that DB is
  shared with the Auth service. In a fully decoupled architecture this read-only access is
  a candidate for extraction into its own service.
- CORS is currently limited to `http://localhost:8081` (the RN dev client).