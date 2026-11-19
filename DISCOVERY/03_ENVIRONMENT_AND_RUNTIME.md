# 03 — Environment and Runtime

**Discovery date:** 2026-11-19
**Status:** Final. Dependency installation, isolated launch, health checks, and safety controls were executed and verified.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in the supplied environment or controlled isolated runtime. |
| DOCUMENTED INTENT | Stated in docs/deployment descriptors. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Repository and workspace baseline

| Item | Finding | Classification |
| --- | --- | --- |
| Working directory | `D:\Codexx-Academy-F-VV-main` | VERIFIED FACT |
| Repository identity | UNKNOWN — no `.git` directory and no Git CLI available | VERIFIED FACT / UNKNOWN state |
| Branch / commit / remote / working-tree status | UNKNOWN | VERIFIED FACT |
| Top-level files | `app.py` (131,660 bytes), `models.py` (4,456), `config.py` (2,403), `requirements.txt` (702), `data.json` (11,301), `README.md`, `replit.md`, deployment descriptors, docs, `AUDIT/`, `static/`, `templates/`, `security/` | VERIFIED FACT |
| Existing `.git` | False | VERIFIED FACT |
| Git CLI | Not found | VERIFIED FACT |

**VERIFIED FACT:** No lockfiles, Python test config (`pytest.ini`, `tox.ini`, `pyproject.toml`, `setup.py`, `conftest.py`), or product test files were found outside `AUDIT/`.

**VERIFIED FACT:** No database files (`*.db`, `*.sqlite`, `*.sqlite3`) were present in the supplied snapshot. The only runtime data files were `data.json` and `security/ip_log.json`.

**VERIFIED FACT:** No relevant environment variables for database, session, admin, Telegram, SMTP, or Flask were present in the discovery shell.

---

## 2. Runtime and framework baseline

| Component | Version / value | Classification |
| --- | --- | --- |
| Python 3.11 | 3.11.9 | VERIFIED FACT — matches deployment target |
| Python 3.15 | 3.15.2 | VERIFIED FACT — present but not used |
| pip (Python 3.11) | 24.0 | VERIFIED FACT |
| Node.js | v26.13.0 | VERIFIED FACT — used by CDP harness |
| npm | 11.20.0 | VERIFIED FACT — not used for browser tooling |
| System Chrome | 157.0.8103.79 | VERIFIED FACT — live browser used via CDP |
| System Edge | 157.0.4341.60 | VERIFIED FACT — fallback candidate, not used |
| Deployment Python | 3.11.0 in `render.yaml:8-9` | DOCUMENTED INTENT |

**VERIFIED FACT:** `requirements.txt:1-53` contains duplicated and partly pinned dependency blocks. The effective installed set resolved to the pinned values for the primary packages, but the manifest remains non-deterministic in principle.

**INFERENCE:** A lockfile is still needed before any implementation phase; no lockfile was created because dependency changes are out of discovery scope.

---

## 3. Configuration and deployment descriptors

**VERIFIED FACT:** `config.py` requirements and defaults:
- `SESSION_SECRET` from env with hard-coded fallback `CHANGE-THIS-SECRET-KEY-IN-PRODUCTION` (`config.py:8`).
- 7-day permanent session lifetime (`config.py:9`).
- `SESSION_COOKIE_SECURE = False`, `HTTPONLY = True`, `SAMESITE = 'Lax'` (`config.py:10-12`).
- Database URL from `DATABASE_URL` or individual `PG*` variables; `postgres://` normalized to `postgresql://`; final fallback `sqlite:///codexx.db` (`config.py:15-29`).
- Engine options: pool size 10, recycle 3600, pre-ping (`config.py:30-34`).
- Upload limit 16 MB; upload folder `static/assets/uploads`; allowed image extensions png/jpg/jpeg/gif/webp (`config.py:37-40`).
- Admin username/password from env (`config.py:45-47`).
- Config selection from `FLASK_ENV`, defaulting to development; `DevelopmentConfig.DEBUG = True` (`config.py:50-80`).

**VERIFIED FACT:** `render.yaml:1-17` defines a Python web service named `portfolio-app`, build command `./build.sh`, start command `gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --reuse-port app:app`, Python 3.11.0, generated `SESSION_SECRET`, `DATABASE_URL` sync false, and admin credentials from env. `FLASK_ENV` is absent.

**VERIFIED FACT:** `build.sh:1-12` upgrades pip, installs `requirements.txt`, creates `static/assets/uploads`, and echoes completion. `Procfile` contains a bare Gunicorn command, inconsistent with `render.yaml`.

**INFERENCE:** Deployed production may run with `DEBUG=True` unless the platform supplies `FLASK_ENV=production`. This remains UNKNOWN and was not tested against production.

---

## 4. Documented installation procedure

**DOCUMENTED INTENT:** `README.md:28-31` states Replit as primary development/production and Render as production using `render.yaml` and `Procfile`. `build.sh:5-10` gives the concrete dependency install and upload-directory creation.

**VERIFIED FACT:** No documented local test procedure, seed script, migration command, or test configuration exists in the repository.

**VERIFIED FACT:** Alembic is installed, but no `alembic.ini` or `migrations/` directory exists.

---

## 5. Dependency installation (completed)

**VERIFIED FACT:** Application dependencies were installed into an isolated Python 3.11 virtual environment outside the application source:

| Item | Value |
| --- | --- |
| Venv | `C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\venv` |
| Command | `py -3.11 -m venv <venv>` then `<venv>\Scripts\python -m pip install --disable-pip-version-check -r D:\Codexx-Academy-F-VV-main\requirements.txt` |
| Exit status | `EXIT:0` |
| Original log | `<workspace>\pip-install.log` |
| Archived log | `DISCOVERY/evidence/logs/app_pip_install.log` |
| Effective versions | `DISCOVERY/evidence/logs/effective_versions.txt` |
| Manifest modified | No |
| Global install | No |

**VERIFIED FACT:** Key effective versions:
- Flask 3.1.1, Werkzeug 3.1.3, gunicorn 23.0.0
- Flask-SQLAlchemy 3.1.1, SQLAlchemy 2.0.23
- flask-dance 7.1.0, flask-login 0.6.3
- APScheduler 3.10.4
- WeasyPrint 65.1
- requests 2.31.0, requests-oauthlib 2.0.0
- Alembic 1.13.0, psycopg2-binary 2.9.10
- PyJWT 2.10.1, python-dotenv 1.0.1, email-validator 2.2.0

**VERIFIED FACT:** A second tooling venv (`pw-venv`) was created for Playwright only. It ended with `pip==24.0` and `setuptools==65.5.0`; Playwright did not install. See `04_LIVE_TESTING_INFRASTRUCTURE.md`.

**Cli / constraint:** No dependency upgrade, pin change, manifest rewrite, or global install was attempted.

---

## 6. Isolated runtime preparation

**VERIFIED FACT:** A separate testing workspace was created outside the application source:
`C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace`

**VERIFIED FACT:** A disposable application copy was created at:
`C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\app-copy`

It contains copies of `app.py`, `models.py`, `config.py`, `requirements.txt`, `build.sh`, `Procfile`, `render.yaml`, `templates/`, and `static/`, plus disposable `security/`, `backups/`, and `static/assets/uploads/` directories. `security/ip_log.json` was initialized to `[]` in the copy only.

**VERIFIED FACT:** No file in `D:\Codexx-Academy-F-VV-main\app.py`, templates, static assets, config, data, requirements, or deployment descriptors was modified for runtime preparation.

### 6.1 Synthetic data

**VERIFIED FACT:** `make_synthetic_data.py` writes a disposable `app-copy/data.json` containing only synthetic accounts:
- `alice_member` / `TestPass123!` (role user)
- `bob_member` / `TestPass123!` (role user)
- `carol_demo` / `TestPass123!` (role user with `is_demo`)
- env administration `siteadmin` / `DiscoveryAdmin123!`

It also creates synthetic portfolio records for those accounts and `admin`. The generator was executed successfully before each clean runtime run. Valid theme IDs `modern-dark` and `clean-light` were used after the first fixture run revealed invalid IDs in the initial generator.

### 6.2 Side-effect blockers

**VERIFIED FACT:** `run_isolated.py` enforces:
- working directory and `sys.path` point to `app-copy` only;
- `DATABASE_URL = sqlite:///<app-copy>/discovery.db`;
- synthetic admin credentials `siteadmin` / `DiscoveryAdmin123!`;
- `SESSION_SECRET` set to a discovery-only value;
- external Telegram/SMTP-related environment variables removed;
- `BackgroundScheduler.start` replaced with a no-op before importing `app`;
- `requests.post` replaced with a blocker raising `RuntimeError`;
- `smtplib.SMTP` replaced with a blocker raising `RuntimeError`;
- known notification helper names patched to no-ops after import;
- Flask binds only to `127.0.0.1:5001`, `debug=False`, no reloader.

**VERIFIED FACT:** This launcher is tooling outside the application source; it does not modify source behavior in the repository.

**INFERENCE:** These controls are necessary because importing `app.py` is state-changing: `db.create_all()`, directory creation, and scheduler start occur at import time (`app.py:36-43,115-132`).

---

## 7. Startup procedure and result

**VERIFIED FACT:** Executed sequence:
1. Recorded effective installed versions.
2. Ran the synthetic data generator with the application venv.
3. Started `run_isolated.py` with the application venv.
4. Confirmed output contained `DISCOVERY RUNTIME READY`, the DB path under `app-copy`, and CWD under `app-copy`.
5. Probed `http://127.0.0.1:5001/` and received HTTP 200.
6. Verified `discovery.db` was created under `app-copy`.
7. Captured stdout/stderr to `DISCOVERY/evidence/logs/app_runtime.log`.
8. Ran the Chrome CDP browser harness instead of Playwright.

**VERIFIED FACT:** Final launch observations:
- `DISCOVERY RUNTIME READY`
- `DB: sqlite:///C:/Users/infor/AppData/Local/Temp/opencode/discovery-workspace/app-copy/discovery.db`
- `CWD: C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\app-copy`
- `* Running on http://127.0.0.1:5001`
- Debug mode: off
- Health check: HTTP 200
- SQLite DB created: True
- Listener bound only to `127.0.0.1`

**VERIFIED FACT:** The runtime response header reproduced the permissive source configuration:
`default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; font-src *; img-src * data: blob:; connect-src *; frame-ancestors *;`

---

## 8. Isolation verification checklist

| Control | Status | Evidence |
| --- | --- | --- |
| App source copy separate from repository | VERIFIED FACT | `app-copy` path and copy operation |
| SQLite DB inside disposable copy | VERIFIED FACT | `discovery.db` created under `app-copy` |
| Synthetic accounts/data only | VERIFIED FACT | generator executed; final JSON contains only synthetic records |
| Loopback-only bind | VERIFIED FACT | `127.0.0.1:5001` listener |
| Real Telegram/SMTP/network side effects blocked | VERIFIED FACT by design + runtime | POST/SMTP blockers active; no external notification observed |
| Scheduler disabled | VERIFIED FACT by design | `BackgroundScheduler.start` no-op before import |
| No production credentials used | VERIFIED FACT | no relevant env vars present; synthetic values used |
| No real payment/webhook executed | VERIFIED FACT | no payment route exists; no network side effects allowed |
| No app source modification | VERIFIED FACT | all tooling and evidence outside source or under `DISCOVERY/` |

---

## 9. Known blockers and limitations

1. **Playwright unavailable** — first attempt failed with SSL integrity error; bounded retry exited 1 while downloading the 42.7 MB wheel. Chrome CDP was used instead. See `04_LIVE_TESTING_INFRASTRUCTURE.md`.
2. **Git baseline unavailable** — repository identity and change attribution remain UNKNOWN.
3. **Production parity UNKNOWN** — local SQLite behavior does not prove PostgreSQL, Gunicorn 4-worker, SMTP, or Telegram behavior.
4. **WeasyPrint native libraries** — package installed successfully; PDF rendering in the deployment image remains UNKNOWN.
5. **Import-time side effects** — direct import against repository files is unsafe; isolated copy is mandatory for any future runtime work.
6. **Visual inspection caveat** — screenshots were captured and preserved, but this model could not visually inspect the PNG images; visual conclusions rely on rendered body text, headings, network logs, and persistence state.

---

## 10. Runtime conclusion

**VERIFIED FACT:** The controlled runtime executed successfully without touching application source, production data, external notification services, or deployment state. It permits live-browser discovery with disposable state and observable side-effect controls.

**VERIFIED FACT:** The final execution record is in `DISCOVERY/05_VISUAL_AND_RUNTIME_DISCOVERY.md` and `DISCOVERY/evidence/`.

**INFERENCE:** The same harness can support a later authorized verification phase, but no implementation or remediation is authorized by this discovery package.
