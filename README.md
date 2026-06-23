# JMeter Mock Performance Testing Demo

This project demonstrates a minimal performance testing workflow using Apache JMeter with a local, predictable mock API for safe load testing and experimentation.

## Project Overview

A complete example of:
- **Mock API**: Lightweight Node.js/Fastify server with realistic endpoints
- **Performance Testing**: Apache JMeter test plans for load and stress testing
- **Test Execution**: Non-GUI mode for CI/CD integration
- **Reporting**: HTML dashboards and metrics visualization
- **Automation**: GitHub Actions workflow for test runs and artifact management

## Why local mock API?

Public sites and public APIs are not reliable or responsible targets for load testing. A local mock API provides:
- **Predictable behavior** - consistent response times and data
- **Controlled environment** - no impact on production systems
- **Safe experimentation** - unlimited testing without rate limits or bans
- **Reproducible results** - identical conditions across test runs

## Getting Started

### Run mock API

```bash
npm install
npm start
```

The API will start on `http://localhost:3000`

## API Endpoints

### `GET /health`
Health check endpoint to verify API availability.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-23T10:27:36.731+02:00"
}
```

### `GET /products`
Retrieve available products.

**Response (200):**
```json
{
  "products": [
    { "id": "p-001", "name": "Desk", "price": 129 },
    { "id": "p-002", "name": "Chair", "price": 89 },
    { "id": "p-003", "name": "Lamp", "price": 24 }
  ]
}
```

### `POST /orders`
Create a new order.

**Request:**
```json
{
  "customerId": "cust-123",
  "productId": "p-001",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "orderId": "order-1687519656731",
  "customerId": "cust-123",
  "productId": "p-001",
  "quantity": 2,
  "status": "created"
}
```

**Response (400):** Missing required fields (`customerId`, `productId`, `quantity`)

## Performance Testing

### Test Coverage

*(Performance test details and results will be added soon)*

- Load testing scenarios
- Stress testing limits
- Response time analysis
- Throughput metrics

### Running Tests

*(Instructions for running JMeter tests will be documented)*
