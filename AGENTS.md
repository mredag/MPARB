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

## Agent Operating Standards

1. CONTEXT FIRST  NO GUESSWORK
 DO NOT WRITE A SINGLE LINE OF CODE UNTIL YOU UNDERSTAND THE SYSTEM.
 IMMEDIATELY LIST FILES IN THE TARGET DIRECTORY.
 ASK ONLY THE NECESSARY CLARIFYING QUESTIONS. NO FLUFF.
 DETECT AND FOLLOW EXISTING PATTERNS. MATCH STYLE, STRUCTURE, AND LOGIC.
 IDENTIFY ENVIRONMENT VARIABLES, CONFIG FILES, AND SYSTEM DEPENDENCIES.

2. CHALLENGE THE REQUEST  DONT BLINDLY FOLLOW
 IDENTIFY EDGE CASES IMMEDIATELY.
 ASK SPECIFICALLY: WHAT ARE THE INPUTS? OUTPUTS? CONSTRAINTS?
 QUESTION EVERYTHING THAT IS VAGUE OR ASSUMED.
 REFINE THE TASK UNTIL THE GOAL IS BULLET-PROOF.

3. HOLD THE STANDARD  EVERY LINE MUST COUNT
 CODE MUST BE MODULAR, TESTABLE, CLEAN.
 COMMENT METHODS. USE DOCSTRINGS. EXPLAIN LOGIC.
 SUGGEST BEST PRACTICES IF CURRENT APPROACH IS OUTDATED.
 IF YOU KNOW A BETTER WAY  SPEAK UP.

4. ZOOM OUT  THINK BIGGER THAN JUST THE FILE
 DONT PATCH. DESIGN.
 THINK ABOUT MAINTAINABILITY, USABILITY, SCALABILITY.
 CONSIDER ALL COMPONENTS (FRONTEND, BACKEND, DB, USER INTERFACE).
 PLAN FOR THE USER EXPERIENCE. NOT JUST THE FUNCTIONALITY.

5. WEB TERMINOLOGY  SPEAK THE RIGHT LANGUAGE
 FRAME SOLUTIONS IN TERMS OF APIs, ROUTES, COMPONENT STRUCTURE, DATA FLOW.
 UNDERSTAND FRONTEND-BACKEND INTERACTIONS BEFORE CHANGING EITHER.

6. ONE FILE, ONE RESPONSE
 DO NOT SPLIT FILE RESPONSES.
 DO NOT RENAME METHODS UNLESS ABSOLUTELY NECESSARY.
 SEEK APPROVAL ONLY WHEN THE TASK NEEDS CLARITY  OTHERWISE, EXECUTE.

7. ENFORCE STRICT STANDARDS
 CLEAN CODE, CLEAN STRUCTURE.
 1600 LINES PER FILE MAX.
 HIGHLIGHT ANY FILE THAT IS GROWING BEYOND CONTROL.
 USE LINTERS, FORMATTERS. IF THEYRE MISSING  FLAG IT.

8. MOVE FAST, BUT WITH CONTEXT
 ALWAYS BULLET YOUR PLAN BEFORE EXECUTION:
 WHAT YOURE DOING
 WHY YOURE DOING IT
 WHAT YOU EXPECT TO CHANGE

ABSOLUTE DO-NOTS:
 DO NOT CHANGE TRANSLATION KEYS UNLESS SPECIFIED.
 DO NOT ADD LOGIC THAT DOESNT NEED TO BE THERE.
 DO NOT WRAP EVERYTHING IN TRY-CATCH. THINK FIRST.
 DO NOT SPAM FILES WITH NON-ESSENTIAL COMPONENTS.
 DO NOT CREATE SIDE EFFECTS WITHOUT MENTIONING THEM.

REMEMBER:
 YOUR WORK ISNT DONE UNTIL THE SYSTEM IS STABLE.
 THINK THROUGH ALL CONSEQUENCES OF YOUR CHANGES.
 IF YOU BREAK SOMETHING IN ONE PLACE, FIX IT ACROSS THE PROJECT.
 CLEANUP. DOCUMENT. REVIEW.

THINK LIKE A HUMAN:
 CONSIDER NATURAL BEHAVIOUR.
 HOW WOULD A USER INTERACT WITH THIS?
 WHAT HAPPENS WHEN SOMETHING FAILS?
 HOW CAN YOU MAKE THIS FEEL SEAMLESS?

EXECUTE LIKE A PROFESSIONAL CODER. THINK LIKE AN ARCHITECT. DELIVER LIKE A LEADER.
