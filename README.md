# JMeter Mock Performance Testing Demo

This project demonstrates a minimal performance testing workflow using Apache JMeter.

## Scope

- Local mock API using Node.js/Fastify
- JMeter test plan created in GUI
- CLI execution in non-GUI mode
- HTML dashboard generation
- GitHub Actions artifact upload

## Why local mock API?

Public sites and public APIs are not reliable or responsible targets for load testing. A local mock API gives predictable behavior, controlled data, and safe experimentation.

## Run mock API

```bash
npm install
npm start
```
