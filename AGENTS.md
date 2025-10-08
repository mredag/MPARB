# Repository Guidelines

## Project Structure & Module Organization
- `workflows/` — n8n workflows (`*_intake.json`, `sender_*.json`, `processor.json`, `error_handler.json`).
- `templates/` — response templates (`templates.json`, UTF‑8, TR/EN keys).
- `scripts/` — automation (`import.sh`, `activate.sh`, `seed.sql`, validation/testing JS).
- `tests/` — Mocha/Chai integration tests (`<platform>_*_test.js`).
- `docs/` — product and developer docs; `.kiro/steering/` — enforced standards.
- Root: `docker-compose.yml`, `Makefile`, `.env.example`, `README.md`.

## Build, Test, and Development Commands
- `make up` — start PostgreSQL + n8n (Docker Compose).
- `make import` — import all workflows from `workflows/`.
- `make activate` — activate imported workflows; prints webhook URLs.
- `make test` — install test deps and run Mocha suite in `tests/`.
- `make logs` — follow service logs; `make psql` — open psql shell.
- `make down` / `make clean` — stop; stop and remove volumes.

## Coding Style & Naming Conventions
- Workflows: pretty‑printed JSON (2 spaces). Filenames: `instagram_intake.json`, `whatsapp_intake.json`, `sender_<platform>.json`. Webhook `path` uses kebab‑case (e.g., `instagram-intake`).
- Templates: keep Turkish diacritics (UTF‑8) and polite “Siz” form. Variables use `{snake_case}` (e.g., `{first_name}`).
- Scripts: Bash with `#!/bin/bash`, `set -e` (prefer POSIX‑safe code).
- Tests (JS): 2‑space indent, `camelCase` vars, Mocha + Chai `expect` style.

## Testing Guidelines
- Frameworks: Mocha/Chai. Run `make test` or `cd tests && npm test`.
- Targeted suites: `npm run test:instagram|whatsapp|google`.
- Ensure stack is running first: `make up && make import && make activate`. Optionally set `N8N_BASE_URL=http://localhost:5678`.
- Add tests for new/changed workflows and Turkish language compliance (<500 chars, proper diacritics, policy rules).

## Commit & Pull Request Guidelines
- Commits: imperative, concise subject; prefer Conventional Commits.
  Example: `feat(workflows): add instagram intake and sender`
- PRs: include summary, affected workflows/scripts, how to test (commands + expected webhooks), screenshots/logs, and link issues. Confirm `make test` passes.

## Security & Configuration Tips
- Never commit secrets. Copy `.env.example` to `.env` and fill: `N8N_ENCRYPTION_KEY` (32 chars), `OPENAI_API_KEY`, `FB_PAGE_TOKEN`, `WA_PERMANENT_TOKEN`, `META_VERIFY_TOKEN`, optional Google/Slack keys.
- Do not embed credentials in workflow JSON; use n8n credentials.
- After editing workflows: `make import && make activate` to apply safely.

