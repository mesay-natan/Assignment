NestJS service that manages **users**, **products**, and a **transaction history**.

- Runtime: Node.js + NestJS
- Database: PostgreSQL (Docker Compose)
- ORM: TypeORM
- Migrations: TypeORM migrations (`src/migrations/*`)
- Validation: `class-validator` + global `ValidationPipe`

## Quick Start (Docker)

### 1) Start API + DB

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Postgres: `localhost:5435` (container port `5432`)

### 2) Verify API is up

```bash
curl -i http://localhost:3000/
```

## Local Development (without Docker API container)

### 1) Start Postgres

```bash
docker compose up -d postgres
```

### 2) Configure env

`.env` (example)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5435
DB_USER=embed
DB_PASS=embed
DB_NAME=assignment
```

### 3) Install + run migrations + start API

```bash
npm install
npm run migration:run
npm run start:dev
```

## Migrations

### Generate migration

```bash
npm run migration:generate
```

### Apply migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## Tests

```bash
npm test
```

E2E tests (if present):
```bash
npm run test:e2e
```

## API Documentation (Swagger-style)

Base URL: `http://localhost:3000`

### Conventions

- All request/response bodies are JSON.
- IDs in routes are integers (invalid IDs return `400`).
- Validation errors return `400` with a structured error body.
- Not found resources return `404`.

### Users

#### `POST /users`
Create a user.

Request body:
```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com"
}
```

Responses:
- `201 Created` → created user
- `400 Bad Request` → validation error

Example:
```bash
curl -i -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@example.com"}'
```

#### `GET /users`
List all users.

Responses:
- `200 OK` → array of users

Example:
```bash
curl -i http://localhost:3000/users
```

#### `GET /users/:id`
Get a single user.

Responses:
- `200 OK` → user
- `404 Not Found`

Example:
```bash
curl -i http://localhost:3000/users/1
```

#### `PATCH /users/:id`
Update a user (partial update).

Request body (any subset):
```json
{ "firstName": "Grace" }
```

Responses:
- `200 OK` → updated user
- `400 Bad Request` → validation error
- `404 Not Found`

#### `DELETE /users/:id`
Delete a user.

Responses:
- `204 No Content`
- `404 Not Found`

---

### Products

#### `POST /products`
Create a product.

Request body:
```json
{
  "name": "iPhone 15",
  "description": "256GB",
  "price": 999.99,
  "stockQuantity": 10
}
```

Responses:
- `201 Created` → created product
- `400 Bad Request` → validation error

Example:
```bash
curl -i -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"iPhone 15","description":"256GB","price":999.99,"stockQuantity":10}'
```

#### `GET /products`
List all products.

Responses:
- `200 OK`

#### `GET /products/:id`
Get a single product.

Responses:
- `200 OK`
- `404 Not Found`

#### `PUT /products/adjust`
Adjust product stock by a delta (positive or negative). Implemented as an atomic DB transaction with row locking.

Request body:
```json
{
  "productId": 1,
  "delta": -2
}
```

Rules:
- `delta` must not be `0`
- final stock must not be negative

Responses:
- `200 OK` → updated product
- `400 Bad Request` → invalid delta / insufficient stock
- `404 Not Found`

Example:
```bash
curl -i -X PUT http://localhost:3000/products/adjust \
  -H 'Content-Type: application/json' \
  -d '{"productId":1,"delta":-2}'
```

#### `GET /status/:productId`
Returns a minimal product status view.

Response body:
```json
{
  "productId": 1,
  "stockQuantity": 10,
  "inStock": true
}
```

Responses:
- `200 OK`
- `404 Not Found`

Example:
```bash
curl -i http://localhost:3000/status/1
```

---

### Transactions

#### `POST /transactions`
Create a transaction. On create/update, product stock is adjusted inside a DB transaction with `pessimistic_write` locks.

Request body:
```json
{
  "userId": 1,
  "productId": 1,
  "quantity": 2
}
```

Notes:
- `unitPrice` is captured from the product at the time of purchase (snapshot).

Responses:
- `201 Created` → created transaction
- `400 Bad Request` → insufficient stock / validation error
- `404 Not Found` → product not found

Example:
```bash
curl -i -X POST http://localhost:3000/transactions \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"productId":1,"quantity":2}'
```

#### `GET /transactions`
List all transactions.

Responses:
- `200 OK`

Example:
```bash
curl -i http://localhost:3000/transactions
```

#### `GET /transactions/:id`
Get a single transaction.

Responses:
- `200 OK`
- `404 Not Found`

#### `PATCH /transactions/:id`
Update a transaction. Handles stock adjustments safely:
- If quantity increases → requires additional stock
- If quantity decreases → returns stock
- If product changes → returns stock to old product, deducts from new product

Responses:
- `200 OK`
- `400 Bad Request` → insufficient stock / invalid quantity
- `404 Not Found`

#### `DELETE /transactions/:id`
Delete a transaction.

Responses:
- `204 No Content`
- `404 Not Found`

## Assumptions / Trade-offs

- Stock changes are enforced using DB transactions + row locks for correctness under concurrency.
- Transaction `unitPrice` is stored as a snapshot (product price may change later).
- This README documents the current implemented routes. If you need the exact required routes from the prompt (e.g. `GET /status/:productId` at root), adjust the controller routes accordingly.
