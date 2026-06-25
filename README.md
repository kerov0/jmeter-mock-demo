# JMeter Mock Performance Testing Demo

A small, controlled sandbox project for refreshing and demonstrating the end-to-end Apache JMeter performance testing workflow.

The purpose of this repository is not to build a complex backend application. The purpose is to make the full performance testing loop visible and repeatable:

1. run a predictable local API,
2. create JMeter scenarios in the GUI,
3. execute them from the CLI in non-GUI mode,
4. generate raw and HTML reports,
5. publish reports as CI/CD artifacts.

## Why this project exists

This project was created as a practical refresher for JMeter and performance testing fundamentals.

The immediate goal is to have a lightweight, hands-on setup that can be used to discuss performance testing workflow, tooling, and automation with colleagues without depending on a real client system or public website.

It focuses on the mechanics that matter in real performance testing work:

- controlled test target,
- clear test scenarios,
- assertions for functional correctness,
- parameterized load profiles,
- CLI execution,
- reproducible reports,
- CI/CD artifact handling.

## Project scope

This repository contains:

- a local Node.js/Fastify mock API,
- a project structure for JMeter test plans,
- a place for raw JMeter result files,
- a place for generated HTML reports,
- a GitHub Actions workflow skeleton for CI execution and report artifact publishing.

The current API is intentionally simple. It exists so JMeter scenarios can be developed safely and predictably.

## Project structure

```text
jmeter-mock-demo/
├── src/
│   └── server.js
├── tests/
│   └── mock-api-load-test.jmx
├── results/
│   └── results.jtl
├── reports/
│   └── html/
├── .github/
│   └── workflows/
│       └── jmeter.yml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Generated files under `results/` and `reports/` are ignored by Git. They should be produced locally or by CI and uploaded as artifacts when needed.

## Why use a local mock API?

Public websites and public APIs are not reliable or responsible targets for load testing. They may have rate limits, unstable response times, external network noise, or policies that prohibit automated load.

A local mock API provides:

- predictable behavior,
- controlled data,
- safe experimentation,
- no impact on real systems,
- reproducible test runs,
- a simple target for learning JMeter mechanics.

## Getting started

Install dependencies:

```bash
npm install
```

Start the mock API:

```bash
npm start
```

The API starts on:

```text
http://localhost:3000
```

## API endpoints

### `GET /health`

Health check endpoint to verify API availability.

Expected response: `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-06-23T10:27:36.731Z"
}
```

### `GET /products`

Returns a small static product list.

Expected response: `200 OK`

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

Creates a mock order.

Expected request:

```json
{
  "customerId": "cust-123",
  "productId": "p-001",
  "quantity": 2
}
```

Expected response: `201 Created`

```json
{
  "orderId": "order-1687519656731",
  "customerId": "cust-123",
  "productId": "p-001",
  "quantity": 2,
  "status": "created"
}
```

If required fields are missing, the endpoint returns `400 Bad Request`.

Required fields:

- `customerId`,
- `productId`,
- `quantity`.

## JMeter scenario goal

The first JMeter test plan should cover the basic happy path:

```text
Test Plan
└── Thread Group
    ├── HTTP Request Defaults
    ├── HTTP Header Manager
    ├── GET /health
    ├── GET /products
    ├── POST /orders
    ├── Response Assertion - health
    ├── Response Assertion - products
    ├── Response Assertion - orders
    └── View Results Tree / Summary Report
```

Initial load profile:

```text
Number of Threads: ${__P(users,5)}
Ramp-up period: ${__P(rampup,10)}
Loop Count: ${__P(loops,5)}
```

The test plan should be saved as:

```text
tests/mock-api-load-test.jmx
```

## Expected JMeter checks

### `GET /health`

- Method: `GET`
- Path: `/health`
- Expected response code: `200`
- Optional response body assertion: contains `ok`

### `GET /products`

- Method: `GET`
- Path: `/products`
- Expected response code: `200`
- Optional response body assertion: contains `products`

### `POST /orders`

- Method: `POST`
- Path: `/orders`
- Header: `Content-Type: application/json`
- Header: `Accept: application/json`
- Expected response code: `201`
- Optional response body assertion: contains `orderId`

Example body:

```json
{
  "customerId": "customer-${__Random(1000,9999)}",
  "productId": "p-001",
  "quantity": 1
}
```

## Running JMeter locally

Make sure the API is running first:

```bash
npm start
```

Then run JMeter in non-GUI mode:

```bash
jmeter -n -t tests/mock-api-load-test.jmx -l results/results.jtl -e -o reports/html
```

If JMeter is not available on `PATH`, run it through the full path to `jmeter` or `jmeter.bat`.

Example with custom load parameters:

```bash
jmeter -n \
  -t tests/mock-api-load-test.jmx \
  -l results/results.jtl \
  -e \
  -o reports/html \
  -Jusers=10 \
  -Jrampup=20 \
  -Jloops=10
```

## Cleaning local reports before rerun

JMeter expects the result file and report output directory to be clean.

On macOS/Linux:

```bash
rm -f results/results.jtl
rm -rf reports/html
mkdir -p reports/html
```

On Windows PowerShell:

```powershell
Remove-Item .\results\results.jtl -ErrorAction SilentlyContinue
Remove-Item .\reports\html -Recurse -Force -ErrorAction SilentlyContinue
mkdir .\reports\html
```

## CI/CD direction

The GitHub Actions workflow should eventually:

1. check out the repository,
2. install Node.js,
3. install Java,
4. install dependencies,
5. start the mock API,
6. wait until `/health` is available,
7. install JMeter,
8. run the JMeter plan in non-GUI mode,
9. generate the HTML dashboard,
10. upload the raw `.jtl` result and HTML dashboard as artifacts,
11. optionally fail the workflow when JMeter samples fail.

This makes the performance test output reviewable even when the pipeline fails.

## Future improvements

Possible next steps:

- add more realistic mock endpoints,
- add negative scenarios,
- add CSV-driven test data,
- add environment variables for host and port,
- add separate smoke/load/stress profiles,
- add threshold checks for error rate or response time,
- publish the report as a GitHub Pages artifact or workflow artifact,
- add a short architecture diagram or workflow overview.

## Current status

Initial repository and mock API are in place.

Next implementation step:

```text
Create and commit tests/mock-api-load-test.jmx from the JMeter GUI.
```
