# 04 — Live Testing Infrastructure

**Discovery date:** 2026-11-19
**Status:** Final. Playwright was attempted and blocked; live browser evidence was produced with a Chrome DevTools Protocol harness using system Chrome.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in the isolated workspace, tool logs, or browser results. |
| DOCUMENTED INTENT | Intended design in harness/tooling code. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Separation from application source

**VERIFIED FACT:** Tooling was installed and executed outside the application source tree:
`C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace`

**VERIFIED FACT:** The application dependencies are in:
`C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\venv`

**VERIFIED FACT:** A separate Playwright tooling venv was created at:
`C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\pw-venv`
It contains only `pip==24.0` and `setuptools==65.5.0`.

**VERIFIED FACT:** Neither Playwright nor any test tool was added to `D:\Codexx-Academy-F-VV-main\requirements.txt`.

**VERIFIED FACT:** Executable tooling files are copied for reproducibility into:
`DISCOVERY/testing/run_isolated.py`, `make_synthetic_data.py`, `cdp_tests.js`, and `discovery_tests.py`.

**INFERENCE:** This separation prevented discovery tooling from changing application dependencies or application behavior.

---

## 2. Browser tooling installation status

| Item | Value | Classification |
| --- | --- | --- |
| Playwright first attempt | `pip install playwright` failed with SSL `DECRYPTION_FAILED_OR_BAD_RECORD_MAC` while downloading `playwright-1.65.2-py3-none-win_amd64.whl` (42.7 MB); `PLAYWRIGHT_PIP_EXIT:2` | VERIFIED FACT |
| Playwright Chromium attempt | Failed with `No module named playwright`; `CHROMIUM_INSTALL_EXIT:1` | VERIFIED FACT |
| Bounded retry | `--no-cache-dir --retries 10 --timeout 120 playwright==1.65.2` | VERIFIED FACT |
| Bounded retry result | FAILED — `RETRY_EXIT:1`; stalled at wheel download; Playwright still not installed | VERIFIED FACT |
| Playwright version | Not installed / UNKNOWN | VERIFIED FACT / UNKNOWN |
| Playwright Chromium version | Not installed / UNKNOWN | VERIFIED FACT / UNKNOWN |
| System Chrome | 157.0.8103.79 at `C:\Program Files\Google\Chrome\Application\chrome.exe` | VERIFIED FACT |
| System Edge | 157.0.4341.60 at standard Program Files (x86) path | VERIFIED FACT |
| Node.js | v26.13.0, with built-in `WebSocket` and `node:sqlite` | VERIFIED FACT |

**VERIFIED FACT:** Failure logs are preserved in:
- `DISCOVERY/evidence/logs/playwright_install_failure.md`
- `DISCOVERY/evidence/logs/playwright-install.log`
- `DISCOVERY/evidence/logs/playwright-browser-install.log`
- `DISCOVERY/evidence/logs/playwright-retry.log`
- `DISCOVERY/evidence/logs/effective_versions.txt`

**VERIFIED FACT:** Playwright is therefore **BLOCKED and nonessential** for this discovery package. The CDP harness below is the actual live-browser evidence source.

---

## 3. Chrome DevTools Protocol harness

**VERIFIED FACT:** `cdp_tests.js` is a Node.js harness that:
- launches system Chrome headless with a disposable user-data profile;
- uses a dynamically assigned remote-debugging port from `DevToolsActivePort`;
- attaches to one page target over WebSocket;
- enables `Page`, `Runtime`, `Network`, and `Log` domains;
- sets a 1440×900 desktop viewport;
- records HTTP responses ≥400 and `/api/`/`/notifications/` responses;
- records failed requests, console errors, page errors, and JavaScript dialogs;
- accepts JavaScript `confirm()` dialogs automatically;
- reads the disposable SQLite DB read-only with `node:sqlite`;
- reads the disposable `data.json` before and after each case;
- captures PNG screenshots through `Page.captureScreenshot`;
- writes structured JSON, a Markdown summary, and an execution log.

**VERIFIED FACT:** The harness uses no npm packages and no application source modifications. It is discovery tooling only.

**VERIFIED FACT:** A JavaScript dialog handler was required because the “Archive Thread” link uses `onclick="return confirm('Archive this thread?')"` (`templates/dashboard/internal_view.html:75-78`). Without auto-acceptance, the renderer blocked and CDP evaluation timed out.

**VERIFIED FACT:** Compatibility outputs are also written as `cdp_results.json`, `cdp_summary.md`, and `logs/playwright_run.log`; `playwright_run.log` is CDP output, not evidence of a Playwright run.

---

## 4. Test workspace structure

**VERIFIED FACT:** Evidence/output directories under the repository are used only for documentation artifacts:
- `DISCOVERY/evidence/screenshots/`
- `DISCOVERY/evidence/logs/`
- `DISCOVERY/evidence/results/`
- `DISCOVERY/testing/`

**VERIFIED FACT:** Final structured outputs:
- `DISCOVERY/evidence/results/live_results.json`
- `DISCOVERY/evidence/results/live_summary.md`
- `DISCOVERY/evidence/results/cdp_results.json`
- `DISCOVERY/evidence/results/cdp_summary.md`
- `DISCOVERY/evidence/logs/cdp_run.log`
- `DISCOVERY/evidence/logs/cdp_fatal.log` only if a fatal harness error occurred
- `DISCOVERY/evidence/screenshots/<CASE-ID>_*.png`

**VERIFIED FACT:** Intermediate runs are preserved:
- `live_results_initial_fixture_run.json` / `live_summary_initial_fixture_run.md` — first fixture run with invalid theme IDs and GET-only demo case.
- `live_results_cdp_run_2.json` / `live_summary_cdp_run_2.md` — corrected fixtures; two harness-level CDP timeouts.
- `live_results_cdp_run_3.json` / `live_summary_cdp_run_3.md` — dialog/selector bugs exposed.
- Screenshot subdirectories `initial_fixture_run/`, `cdp_run_2/`, and `cdp_run_3/`.

---

## 5. Harness architecture

### 5.1 Browser setup and teardown

**VERIFIED FACT:** `cdp_tests.js` launches Chrome with a fresh disposable profile, removes that profile at startup, creates a new about:blank target, and terminates the spawned Chrome process tree at the end.

### 5.2 Authentication helpers

**VERIFIED FACT:** Credential fixtures:
- Admin: `siteadmin` / `DiscoveryAdmin123!`
- Member A: `alice_member` / `TestPass123!`
- Member B: `bob_member` / `TestPass123!`
- Demo: `carol_demo` / `TestPass123!`

**VERIFIED FACT:** The final `login()` helper logs out before each login. This fixed an earlier fixture problem where an account switch inherited the previous member session.

### 5.3 Navigation and form helpers

**VERIFIED FACT:** Helpers include:
- `go(path)` — probes HTTP status with `fetch`, navigates via CDP, waits for DOM readiness;
- `fill(selector, value)` — sets native input/textarea/select values and dispatches input/change events;
- `clickSubmit()` — clicks a stable submit control;
- `clickByText(text)` — clicks an `<a>`/`<button>` containing text;
- `selectRadio(name, value)` — selects a named radio value;
- `bodyText()` / `allText()` — captures visible text;
- `navSummary()` — captures visible navigation links;
- `shot(name)` — captures a screenshot;
- `dbSnapshot()` / `jsonSnapshot()` — capture persistence state.

### 5.4 Per-case capture

**VERIFIED FACT:** Each case records:
- initial DB counts and JSON snapshot before the action;
- console errors, page errors, failed requests, HTTP responses, and JavaScript dialogs;
- visible body text, headings, flashes, and navigation as applicable;
- DB snapshot and JSON snapshot after the action;
- screenshots for important states;
- explicit issue notes, permission notes, and final state.

**INFERENCE:** This correlates visible UI behavior with network activity and persisted state rather than relying on screenshots alone.

---

## 6. Final case set

| ID | Name | Focus |
| --- | --- | --- |
| PUB-01 | Public landing page | Landing content, hero, console/network baseline |
| PUB-02 | Public professional profile | Portfolio rendering, headings, theme |
| PUB-03 | Public catalog | Directory / empty state |
| PUB-04 | Documentation route | Known 404 route |
| PUB-05 | Public inquiry submission | Contact dual write into JSON and DB |
| AUTH-01 | Login page | Login form presence |
| AUTH-02 | Invalid login | Flash behavior |
| AUTH-03 | Member login/dashboard | Member session and nav |
| AUTH-04 | Admin login/dashboard | Admin session and nav |
| AUTH-05 | Registration attempt | Known broken `/register` |
| COM-01 | Member internal message | Member→administration thread creation |
| COM-02 | Member reply in own thread | Reply persistence |
| COM-03 | Admin reply to member thread | Bidirectional reply visibility |
| COM-04 | Non-participant thread access | Authorization boundary probe |
| COM-05 | Archive link hard-delete behavior | Archive/confirm/flash/persistence probe |
| NOT-01 | Notification polling | Bell/poll endpoint behavior |
| PF-01 | Portfolio profile editing | General/about/skills writes |
| PF-02 | Project lifecycle | Create/list project |
| PF-03 | Public profile after edits | Persistence reflected publicly |
| PF-04 | Silver-grey theme selection | Theme persistence and public rendering |
| ADM-01 | Admin user management | Admin directory |
| ADM-02 | Demo-mode project creation | Demo allowlist behavior |
| AUTH-06 | Logout/session behavior | Session clearance |

**VERIFIED FACT:** Final execution: 23 cases, 23 completed, 0 failed.

---

## 7. Safety controls in testing

| Control | Classification | Mechanism |
| --- | --- | --- |
| No production DB | VERIFIED FACT | `DATABASE_URL` forced to disposable `app-copy/discovery.db` |
| No production data | VERIFIED FACT | synthetic `app-copy/data.json` generator |
| No real notifications | VERIFIED FACT by design | HTTP POST and SMTP blockers; helper no-ops |
| No scheduler | VERIFIED FACT by design | `BackgroundScheduler.start` no-op |
| No public exposure | VERIFIED FACT | bind only `127.0.0.1:5001` |
| No destructive tests against valuable data | VERIFIED FACT | disposable DB/JSON/profile only |
| No app source modification | VERIFIED FACT | all tooling outside source tree |
| No real payments | VERIFIED FACT | no payment route or side effect exists |

---

## 8. Known harness limitations

1. **Selector assumptions** — form mappings came from source/template inspection; missing selectors are recorded rather than silently skipped.
2. **Notification transports stubbed/blocked** — real Telegram/SMTP delivery cannot be verified by design.
3. **SQLite instead of PostgreSQL** — dialect differences are not tested.
4. **Single-worker Flask dev server** — Gunicorn 4-worker concurrency behavior is not tested.
5. **No production credentials/data** — correct by policy; production behavior remains UNKNOWN.
6. **No image understanding in this model** — PNGs are preserved as visual evidence, but conclusions were derived from rendered text, network, and persistence data.
7. **Playwright unavailable** — no Playwright-managed browser evidence exists; CDP evidence is authoritative for this package.

---

## 9. Final version record

| Tool | Version / result | Evidence |
| --- | --- | --- |
| Playwright Python | NOT INSTALLED; first attempt exit 2, retry exit 1 | `playwright-install.log`, `playwright-retry.log` |
| Playwright Chromium | NOT INSTALLED | `playwright-browser-install.log` |
| System Chrome | 157.0.8103.79 | `effective_versions.txt` |
| System Edge | 157.0.4341.60 | `effective_versions.txt` |
| Node.js | v26.13.0 | `effective_versions.txt` |
| Python (tooling/application) | 3.11.9 | `environment_baseline.md`, `effective_versions.txt` |
| Flask stack | Flask 3.1.1, Werkzeug 3.1.3, SQLAlchemy 2.0.23, gunicorn 23.0.0 | `effective_versions.txt` |

**No application dependency manifest was changed to obtain browser tooling.**
