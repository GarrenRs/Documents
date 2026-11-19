# Environment baseline — captured 2026-11-19

## Commands and observed output (transcribed)

- `py -3.11 --version` → Python 3.11.9
- `py -3.15 --version` → Python 3.15.2
- `py -3.11 -m pip --version` → pip 24.0
- `node --version` → v26.13.0
- `npm --version` → 11.20.0
- `Test-Path D:\Codexx-Academy-F-VV-main\.git` → False
- `Get-Command git` → no source returned
- Lockfile/test-config recursive search → no matches outside `AUDIT/`
- DB file recursive search (`*.db`, `*.sqlite`, `*.sqlite3`) → no matches
- JSON data files outside `AUDIT/` → `data.json` (11,301 bytes), `security\ip_log.json` (34,507 bytes)
- Relevant env vars (`DATABASE*`, `PG*`, `SESSION_SECRET`, `ADMIN_*`, `TELEGRAM*`, `SMTP*`, `FLASK_*`) → none present

## Root listing

`AUDIT`, `AUDIT.zip`, `README.md`, `app.py`, `audit_plan.md`, `build.sh`, `config.py`, `data.json`, `maintenance_strategy.md`, `models.py`, `Procfile`, `render.yaml`, `replit.md`, `requirements.txt`, `security`, `static`, `templates`, `templates_analysis.md`, `ux_overhaul_plan.md`.

## Isolation artifacts created outside source

- `C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace`
- `...\venv` (application dependency environment)
- `...\pw-venv` (Playwright tooling environment)
- `...\app-copy` (disposable application copy)
- `...\run_isolated.py`
- `...\make_synthetic_data.py`
- `...\discovery_tests.py`
- `...\pip-install.log`
- `...\playwright-install.log`
- `...\playwright-browser-install.log`

## Safety note

No application source, template, JS/CSS, configuration, data file, dependency manifest, database, schema, deployment descriptor, or Git state in `D:\Codexx-Academy-F-VV-main` was modified during baseline or isolation setup.
