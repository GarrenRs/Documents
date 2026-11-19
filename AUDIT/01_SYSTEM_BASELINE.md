# 01 — System Baseline

**Audit date:** 2026-11-19
**Target:** `D:\Codexx-Academy-F-VV-main` (product: Codexx Academy — Elite Proof-of-Work Ecosystem)
**Mode:** Read-only audit. No source, database, dependency, Git, or integration state was modified.

---

## 1. Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED | Directly observed in source/config/data files during this audit. |
| INFERENCE | Strongly implied by source, but not exercised at runtime. |
| UNKNOWN | Cannot be established from the supplied snapshot. |
| DOCUMENTED ONLY | Present in prose documentation; not confirmed in implementation. |

No runtime test was executed. Importing `app.py` is itself a state-changing operation: it calls `db.create_all()` (`app.py:36-43`), creates `static/assets/uploads`, `backups`, and `security` directories (`app.py:115-132`), and starts APScheduler threads (`app.py:119-122`). Runtime testing would therefore have violated the audit restrictions. All findings below are source-evidenced unless marked otherwise.

Secrets, password hashes, session keys, bot tokens, chat IDs, IP addresses, and private message contents are deliberately **not reproduced** in this audit. Their presence is noted structurally only.

---

## 2. Repository identity and version control

| Item | Status | Evidence |
| --- | --- | --- |
| Working directory | VERIFIED | `D:\Codexx-Academy-F-VV-main` |
| `.git` directory | **Absent** | `Test-Path .git` → `False` |
| Git CLI | **Not installed / not on PATH** | `git` and `where.exe git` produced no executable |
| Git remote | UNKNOWN | No Git metadata and no Git client available |
| Current branch | UNKNOWN | Same |
| Commit / SHA | UNKNOWN | Same |
| Working tree status | UNKNOWN | Same; no baseline can be established |
| File timestamps | VERIFIED | All project files dated 2026-01-06 20:43:27; this is a source snapshot, not a live checkout |

**Impact:** The audit cannot tie findings to a commit, cannot detect local modifications, and cannot identify which of the documented "completed" maintenance items were actually committed. Any remediation must first establish a real VCS baseline (see Phase 0 of `07_RECOMMENDED_ACTION_PLAN.md`).

---

## 3. Actual application entry point

| Layer | Finding | Evidence |
| --- | --- | --- |
| WSGI object | `app` created directly in `app.py`, no application factory | `app.py:24` |
| Local dev entry | `app.run(host='0.0.0.0', port=5000, debug=True)` | `app.py:3568-3570` |
| Production entry (Render) | `gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 --reuse-port app:app` | `render.yaml:6` |
| Generic Procfile entry | `web: gunicorn app:app` (no bind/workers/timeout) | `Procfile:1` |
| Blueprints | **None.** All 72 `@app.route` registrations live in one module | AST scan of `app.py`; see `02_ARCHITECTURE_MAP.md` |
| Configuration selection | `get_config()` reads `FLASK_ENV`, defaulting to `development` | `config.py:77-80` |

**Important:** `render.yaml` does not set `FLASK_ENV`. Default selection is therefore `DevelopmentConfig` with `DEBUG = True` (`config.py:50-53`) even under Gunicorn in production, unless an external environment variable overrides it. (VERIFIED by source; actual deployed environment UNKNOWN.)

---

## 4. Runtime and dependency baseline

### 4.1 Declared dependencies (`requirements.txt`)

Pinned block at lines 1–16, followed by **three repeated unpinned blocks** (lines 17–53). Effective duplicate/unpinned entries include `Flask`, `Werkzeug`, `flask-sqlalchemy`, `requests`, `sqlalchemy`, `alembic`, `APScheduler`, `psycopg2-binary`, `gunicorn`, `oauthlib`, `PyJWT`, `python-dotenv`, `weasyprint`, `email-validator`, `flask-dance`.

| Package | Pinned version | Actually imported by application code |
| --- | --- | --- |
| Flask | 3.1.1 | Yes (`app.py:6`) |
| Werkzeug | 3.1.3 | Yes (`app.py:4-5`) |
| gunicorn | 23.0.0 | Deployment only |
| APScheduler | 3.10.4 | Yes (`app.py:13`) |
| requests | 2.31.0 | Yes (`app.py:10`) |
| flask-sqlalchemy / sqlalchemy | 3.1.1 / 2.0.23 | Yes (`models.py:1`, `app.py:20-21`) |
| psycopg2-binary | 2.9.10 | Implicit, via SQLAlchemy PostgreSQL URL |
| weasyprint | 65.1 | Yes, lazily (`app.py:3522`) |
| python-dotenv | 1.0.1 | **No `.env` loading call found** |
| alembic | 1.13.0 | **No alembic config or migration script present** |
| email-validator | 2.2.0 | **No import/call found** |
| flask-dance | 7.1.0 | **No import/call found** |
| oauthlib | 3.2.2 | **No import/call found** |
| PyJWT | 2.10.1 | **No import/call found** |

`build.sh` runs `pip install --upgrade pip` then `pip install -r requirements.txt` and creates `static/assets/uploads` (`build.sh:5-10`).

### 4.2 Local interpreter availability

Python 3.11.9 and 3.15.2 are available in this environment. The deployment target declares Python 3.11.0 (`render.yaml:8-9`) and documentation says Python 3.11 (`README.md:12`, `replit.md:16`). No project virtual environment, lock file, or `pyproject.toml` exists in the snapshot.

---

## 5. Configuration and secret baseline

### 5.1 Database configuration (`config.py:14-35`)

1. `DATABASE_URL` is preferred.
2. If absent, individual `PGUSER`/`PGPASSWORD`/`PGHOST`/`PGPORT`/`PGDATABASE` are assembled into a URL (`config.py:17-24`).
3. `postgres://` is normalized to `postgresql://` (`config.py:26-27`, repeated at `app.py:28-32`).
4. Final fallback: `sqlite:///codexx.db` (`config.py:29`).
5. Pool options are always set: `pool_size=10`, `pool_recycle=3600`, `pool_pre_ping=True` (`config.py:30-34`).

No matching `DATABASE_*`, `PG*`, `SESSION_SECRET`, `ADMIN_*`, `TELEGRAM*`, or `SMTP*` variables are set in the audit shell. **No SQLite database file exists in the snapshot** (searched `*.db`, `*.sqlite`, `*.sqlite3`). Therefore the database schema is not materialized here; it would be created on first import.

### 5.2 Session/admin configuration

- `SECRET_KEY` comes from `SESSION_SECRET` with a hard-coded fallback literal (`config.py:8`). Value intentionally not quoted here.
- `PERMANENT_SESSION_LIFETIME = 7 days`; `SESSION_COOKIE_HTTPONLY = True`; `SESSION_COOKIE_SAMESITE = 'Lax'` (`config.py:9-12`).
- `SESSION_COOKIE_SECURE = False` in `config.py:10` and **overridden again to `False` at `app.py:93`** with a comment referencing Replit development.
- Admin credentials are read from `ADMIN_USERNAME` / `ADMIN_PASSWORD`; if either is missing, both username and hash become `None` and admin login cannot succeed (`app.py:100-113`). A scrypt hash is recomputed at every process start.
- `render.yaml:10,14-17` generates `SESSION_SECRET` and `ADMIN_PASSWORD`, sets `ADMIN_USERNAME=admin`, requires `DATABASE_URL`, but defines **no** `ADMIN_TELEGRAM_*`, `ADMIN_SMTP_*`, `ADMIN_RECIPIENT_EMAIL`, or `ADMIN_EMAIL` values.

### 5.3 Notification/storage configuration

- Admin Telegram: `ADMIN_TELEGRAM_BOT_TOKEN`, `ADMIN_TELEGRAM_CHAT_ID` (`app.py:206-219`).
- Admin SMTP: `ADMIN_SMTP_HOST`, `ADMIN_SMTP_PORT`, `ADMIN_SMTP_EMAIL`, `ADMIN_SMTP_PASSWORD`, optional `ADMIN_RECIPIENT_EMAIL` (`app.py:213-218, 247`).
- Per-user Telegram and SMTP settings are stored **in plaintext inside `data.json`** under `portfolios.<username>.notifications` (`app.py:2373-2382`, `app.py:2417-2428`).
- Optional global SMTP fallback file `smtp_config.json` is read at `app.py:349-357` and written by an unused helper at `app.py:360-368`. **The file is absent** in this snapshot.
- `security/ip_log.json` exists (34,507 bytes; 127 entries) and stores IP/user-agent/event records (`app.py:167-194`). Contents are not reproduced here.

---

## 6. Data baseline

### 6.1 `data.json` — the de facto primary store

11,301 bytes. Top-level keys: `about`, `clients`, `contact`, `description`, `messages`, `name`, `photo`, `portfolios`, `projects`, `settings`, `skills`, `social`, `title`, `users`, `visitors`.

| Observation | Status |
| --- | --- |
| 3 user records; all `role='user'`; all `is_demo=False`; none has an `is_verified` key | VERIFIED |
| User IDs are integers in JSON (e.g. `len(users)+1` at `app.py:2082`) while DB model IDs are UUID strings (`models.py:32`) | VERIFIED |
| Password hashes present in JSON records (values not shown) | VERIFIED |
| 5 portfolio keys: `sarah_stratege`, `marcus_builds`, `admin`, `Codexx`, `Raeson` | VERIFIED |
| 2 portfolios have no corresponding user record: `sarah_stratege`, `marcus_builds` | VERIFIED |
| 1 portfolio (`Codexx`) contains a plaintext `notifications.telegram` config with `bot_token`, `chat_id`, `configured_at` (values not shown) | VERIFIED |
| Legacy message records exist only under portfolio `Raeson` (2 records); fields: `category`, `date`, `email`, `id`, `message`, `name`, `read` | VERIFIED |
| Global legacy arrays exist: 5 skills, 0 projects, 0 clients, 0 messages | VERIFIED |
| No `portfolios.<user>.messages` records for the three actual users | VERIFIED |

### 6.2 Relational database

Seven SQLAlchemy models exist in `models.py` (`Workspace`, `User`, `Project`, `Skill`, `Client`, `Message`, `VisitorLog`). No database file is present, so the actual production schema, row counts, and migration level are **UNKNOWN**. `db.create_all()` is the only schema mechanism (`app.py:36-41`).

### 6.3 Backups and auxiliary files

- `backups/` directory is created at import (`app.py:117`) but **does not exist in the snapshot**. No backup files or `backups.json` are present.
- No `smtp_config.json`.
- No Alembic directory, `alembic.ini`, migration versions, or schema dumps.
- `Documentation/English/documentation-english.html` (expected by `app.py:2229-2235`) is absent.
- Static assets: 6 theme CSS files, `css/style.css`, `js/script.js`, placeholder SVGs, 8 large raster images under `static/images/`, favicon variants, logo. No uploaded files under `static/assets/uploads/` in the snapshot.

---

## 7. Documentation baseline vs. implementation

| Document | Claims | Audit status |
| --- | --- | --- |
| `README.md:11-17` | Python 3.11/Flask 3, PostgreSQL, role-based auth, dual-channel notifications, rate-limiting, IP monitoring | Partly VERIFIED; "CSRF/rate limiting" is overstated (see `06_TECHNICAL_DEBT.md`) |
| `README.md:23,26` | `data.json` legacy support; `backups/` automated system | VERIFIED as legacy primary store; backups are JSON copies only |
| `replit.md:7,16-25` | Multi-tenant workspaces, PostgreSQL primary with SQLite fallback, JSONB, APScheduler backups | Partly VERIFIED; workspace isolation is largely nominal in code |
| `replit.md:45-51` | CSP/HSTS/X-Frame-Options, input sanitization, rate limiting, CSRF protection, separate notification channels | DOCUMENTED ONLY / partly false: CSP is `default-src *`, no X-Frame-Options, no CSRF tokens |
| `replit.md:61` | `smtp_config.json` for email | VERIFIED as code fallback path; file absent; per-user settings actually live in `data.json` |
| `audit_plan.md:30-38` | Table claims all issues "تم" (fixed): skills validation, internal notifications, security headers, JSONB, responsive tables | DOCUMENTED ONLY; several remain broken/incomplete (see `03`, `06`) |
| `maintenance_strategy.md:7-35` | Four unexecuted checkbox turns | DOCUMENTED ONLY |
| `templates_analysis.md:28,33,41` | Bell icon with unread counter, social-link fragility, chat UI needing liveness | VERIFIED as descriptions of UI; counter logic is inconsistent |
| `ux_overhaul_plan.md:10-11` | Pending: add `read_message` route in `app.py` and dynamic unread count in `base.html` | VERIFIED as **still not implemented** — no `read_message` route anywhere in the repository |

---

## 8. Baseline risk summary

| ID | Baseline risk | Severity | Status |
| --- | --- | --- | --- |
| B-01 | No VCS metadata or Git client; no reproducible commit | High | VERIFIED |
| B-02 | Production default config is development (`DEBUG=True`) | High | VERIFIED |
| B-03 | Hard-coded session-key fallback; secure cookie disabled in source | High | VERIFIED |
| B-04 | No database file, no migrations, schema created implicitly at import | High | VERIFIED |
| B-05 | `data.json` is the real operational store and contains plaintext notification credentials and password hashes | High | VERIFIED |
| B-06 | Duplicate/unpinned dependency declarations; 5 unused packages | Medium | VERIFIED |
| B-07 | Documentation asserts completed security fixes that are not present | Medium | VERIFIED |
| B-08 | Orphan portfolio records and ID-type divergence between JSON and DB | Medium | VERIFIED |

---

**Next document:** `02_ARCHITECTURE_MAP.md` — reconstructed component structure, route inventory, and interaction diagrams.
