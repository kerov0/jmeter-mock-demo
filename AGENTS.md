# AGENTS.md

## Project purpose

This repository is a small performance testing sandbox for refreshing and demonstrating the Apache JMeter workflow.

The project should stay lightweight and focused. It is not meant to become a full backend application or a production-grade service. The main value is showing the complete performance testing loop:

1. local mock API,
2. JMeter GUI test plan creation,
3. CLI/non-GUI execution,
4. raw `.jtl` results,
5. HTML dashboard generation,
6. CI/CD artifact publishing.

## Current stack

* Node.js
* Fastify
* Apache JMeter
* GitHub Actions

## Repository structure

Expected structure:

```
jmeter-mock-demo/
├── src/
│   └── server.js
├── tests/
│   └── mock-api-load-test.jmx
├── results/
├── reports/
│   └── html/
├── .github/
│   └── workflows/
│       └── jmeter.yml
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── AGENTS.md
```

## Development principles

Keep changes small, explicit, and easy to review.

Prefer simple code over clever abstractions. This repo is a learning/demo project, so readability is more important than overengineering.

Do not introduce frameworks, build tooling, TypeScript migration, linting stacks, databases, or complex application architecture unless explicitly requested. Docker is acceptable as a later, deliberate improvement when the local JMeter workflow is already working and the goal is to make the mock API runtime more reproducible.

## Mock API guidelines

The API lives in:

`src/server.js`

Current endpoints:

```
GET  /health
GET  /products
POST /orders
```

When adding endpoints:

* keep them deterministic unless randomness is intentionally part of the test,
* return clear status codes,
* keep response bodies simple and JMeter-friendly,
* document the endpoint in `README.md`,
* add or update JMeter scenarios if relevant.

For validation errors, return clear `400` responses.

For successful creates, return realistic but simple identifiers.

## JMeter guidelines

JMeter test plans should live in:

`tests/`

The primary test plan should be:

`tests/mock-api-load-test.jmx`

Use the JMeter GUI for creating and debugging `.jmx` plans.

Use CLI/non-GUI mode for execution:

```bash
jmeter -n -t tests/mock-api-load-test.jmx -l results/results.jtl -e -o reports/html
```

Prefer parameterized load settings:

```
${__P(users,5)}
${__P(rampup,10)}
${__P(loops,5)}
```

This allows CLI and CI runs like:

```
jmeter -n \
  -t tests/mock-api-load-test.jmx \
  -l results/results.jtl \
  -e \
  -o reports/html \
  -Jusers=10 \
  -Jrampup=20 \
  -Jloops=10
```

## JMeter scenario expectations

The initial scenario should cover:

```
GET  /health
GET  /products
POST /orders
```

Each request should have basic assertions.

Expected assertions:

```
GET /health:
- response code 200
- optional body contains ok
GET /products:
- response code 200
- optional body contains products
POST /orders:
- response code 201
- optional body contains orderId
```

Keep GUI listeners minimal. `View Results Tree` and `Summary Report` are acceptable for local debugging, but serious execution should happen in CLI/non-GUI mode.

## Results and reports

Generated runtime output should not be committed.

Expected generated paths:

```
results/results.jtl
reports/html/
```

These should stay ignored by Git and be uploaded as CI artifacts when produced in GitHub Actions.

Before rerunning local reports, clean old output.

macOS/Linux:

```
rm -f results/results.jtl
rm -rf reports/html
mkdir -p reports/html
```

Windows PowerShell:

```
Remove-Item .\results\results.jtl -ErrorAction SilentlyContinue
Remove-Item .\reports\html -Recurse -Force -ErrorAction SilentlyContinue
mkdir .\reports\html
```

## GitHub Actions guidelines

The workflow file should live in:

`.github/workflows/jmeter.yml`

The workflow should eventually:

1. check out the repo,
2. set up Node.js,
3. set up Java,
4. install npm dependencies,
5. start the mock API,
6. wait for `/health`,
7. install JMeter,
8. run the `.jmx` plan in non-GUI mode,
9. generate the HTML dashboard,
10. upload `results/results.jtl`,
11. upload `reports/html`,
12. optionally fail if JMeter samples failed.

Artifact upload should use `if: always()` so reports are still available when the test fails.

## Pass/fail checks

A simple first pass/fail check can inspect the `.jtl` file for failed samples.

Example:

```
if grep -q 's="false"' results/results.jtl; then
  echo "JMeter test contains failed samples"
  exit 1
fi
```

This is acceptable for a first demo. Later improvements can check:

* error percentage,
* p95 response time,
* p99 response time,
* throughput,
* endpoint-specific thresholds.

## What not to do without explicit request

Do not:

* migrate the project to TypeScript,
* add Docker before the basic local JMeter workflow is working,
* add a database,
* add authentication,
* add complex routing layers,
* add unnecessary test frameworks,
* commit generated JMeter reports,
* replace the simple Fastify server with a larger app structure.

## Preferred assistant behavior

When modifying this project:

* make surgical changes,
* explain what changed and why,
* avoid broad refactors,
* keep commands copy-pasteable,
* preserve the learning/demo nature of the repo,
* prefer practical next steps over abstract theory.

## Implementation priorities

Work in this order unless explicitly instructed otherwise:

1. keep the mock API runnable with `npm start`,
2. create or refine `tests/mock-api-load-test.jmx` in the JMeter GUI,
3. prove local CLI execution works,
4. generate `results/results.jtl`,
5. generate `reports/html`,
6. commit the stable `.jmx` plan,
7. improve the GitHub Actions workflow,
8. upload reports and raw results as artifacts,
9. add basic pass/fail logic,
10. only then consider runtime improvements such as Docker.

Do not skip ahead to infrastructure improvements before the local JMeter loop works end-to-end.

## Docker guidance

Docker can be useful for this project, but it is not the first milestone.

A Docker setup may make sense later for:

* running the mock API in a reproducible container,
* avoiding differences between Windows and macOS runtime behavior,
* making CI startup more predictable,
* demonstrating a more realistic performance testing target setup.

If Docker is added later, keep it minimal:

* one `Dockerfile` for the mock API,
* optional `docker-compose.yml` only if it clearly improves local usage,
* no multi-service architecture unless explicitly requested,
* no database container unless a future scenario genuinely needs persistent or queryable data.

The first useful Docker milestone would be:

```text
Build image → run container → hit /health → run JMeter against localhost/container port
```

Do not containerize JMeter itself unless the project goal explicitly changes toward fully containerized test execution.

## Recommended local workflow

Use this flow while developing:

```bash
npm install
npm start
```

Then, in another terminal, run or debug the JMeter plan.

After saving the `.jmx` file from the JMeter GUI, run:

```bash
rm -f results/results.jtl
rm -rf reports/html
mkdir -p reports/html
jmeter -n -t tests/mock-api-load-test.jmx -l results/results.jtl -e -o reports/html
```

Verify:

```text
results/results.jtl exists
reports/html/index.html exists
all key samples passed
```

## Recommended Git workflow

Generated outputs should stay uncommitted.

Commit source and configuration files such as:

```text
src/server.js
tests/mock-api-load-test.jmx
.github/workflows/jmeter.yml
README.md
AGENTS.md
package.json
package-lock.json
.gitignore
.gitattributes
```

Do not commit:

```text
node_modules/
results/
reports/
*.log
```

Use small commits with clear messages, for example:

```text
Add initial JMeter test plan
Add GitHub Actions JMeter workflow
Document local JMeter execution flow
Add basic JMeter failure check
```

## Current project status

The repository has been created and pushed to GitHub.

The mock Fastify API exists and is the current performance testing target.

The next important milestone is to create the first working JMeter plan in the GUI, save it under `tests/mock-api-load-test.jmx`, run it locally from the CLI, and generate the HTML report.

After that, the CI workflow can be validated and improved.

## Continuation context for future agents

The user is using this repository as a practical performance testing refresher and demonstration project. The project was created after a tech lead suggested refreshing JMeter knowledge.

The preferred direction is pragmatic:

* start small,
* prove the workflow locally,
* make the project easy to explain,
* then improve CI/CD and reporting.

Avoid turning the project into an abstract platform or a large backend exercise. The value is in demonstrating performance testing workflow clearly.