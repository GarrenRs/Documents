"""Playwright live-discovery harness for the isolated Codexx runtime.

Tooling only — lives outside the application source tree and is NOT a product test suite.
Run with the Playwright tooling venv, not the application venv.
"""
import json
import pathlib
import sqlite3
import sys
from datetime import datetime

from playwright.sync_api import sync_playwright

WS = pathlib.Path(r"C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace")
APP = WS / "app-copy"
DB = APP / "discovery.db"
DATA_JSON = APP / "data.json"
OUT = pathlib.Path(r"D:\Codexx-Academy-F-VV-main\DISCOVERY\evidence")
SHOTS = OUT / "screenshots"
RESULTS = OUT / "results"
LOGS = OUT / "logs"
for p in (SHOTS, RESULTS, LOGS):
    p.mkdir(parents=True, exist_ok=True)

BASE = "http://127.0.0.1:5001"
ADMIN = ("siteadmin", "DiscoveryAdmin123!")
ALICE = ("alice_member", "TestPass123!")
BOB = ("bob_member", "TestPass123!")
CAROL = ("carol_demo", "TestPass123!")

results = []
run_log = []


def log(msg):
    run_log.append(f"[{datetime.now().isoformat(timespec='seconds')}] {msg}")
    print(msg, flush=True)


def db_snapshot():
    out = {"messages": [], "counts": {}}
    try:
        uri = DB.as_uri() + "?mode=ro"
        con = sqlite3.connect(uri, uri=True)
        for table in ("messages", "users", "workspaces"):
            try:
                out["counts"][table] = con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            except Exception as exc:
                out["counts"][table] = f"error: {exc}"
        try:
            rows = con.execute(
                "SELECT id, category, sender_role, sender_id, receiver_id, parent_id, "
                "is_read, is_internal, length(message), created_at FROM messages "
                "ORDER BY created_at DESC LIMIT 12"
            ).fetchall()
            out["messages"] = [list(r) for r in rows]
        except Exception as exc:
            out["messages"] = [f"error: {exc}"]
        con.close()
    except Exception as exc:
        out["error"] = str(exc)
    return out


def json_snapshot():
    try:
        d = json.loads(DATA_JSON.read_text(encoding="utf-8"))
        return {
            "users": [{"id": u.get("id"), "username": u.get("username"), "role": u.get("role")} for u in d.get("users", [])],
            "portfolios": sorted(d.get("portfolios", {}).keys()),
            "alice_skills": [s.get("name") for s in d.get("portfolios", {}).get("alice_member", {}).get("skills", [])],
            "alice_projects": [p.get("title") for p in d.get("portfolios", {}).get("alice_member", {}).get("projects", [])],
            "alice_clients": len(d.get("portfolios", {}).get("alice_member", {}).get("clients", [])),
            "alice_theme": d.get("portfolios", {}).get("alice_member", {}).get("settings", {}).get("theme"),
        }
    except Exception as exc:
        return {"error": str(exc)}


class Capture:
    def __init__(self, page, case_id):
        self.case_id = case_id
        self.console_errors = []
        self.page_errors = []
        self.failed = []
        self.responses = []
        page.on("console", lambda m: self.console_errors.append(m.text)
                if m.type == "error" else None)
        page.on("pageerror", lambda e: self.page_errors.append(str(e)))
        page.on("requestfailed", lambda r: self.failed.append(
            {"url": r.url, "failure": r.failure}))
        page.on("response", lambda r: self._response(r))

    def _response(self, r):
        url = r.url
        if url.startswith(BASE) and (r.status >= 400 or "/api/" in url or "/notifications/" in url):
            self.responses.append({"url": url.replace(BASE, ""), "status": r.status})


def shot(page, name, full=False):
    path = SHOTS / f"{name}.png"
    try:
        page.screenshot(path=str(path), full_page=full)
        return path.name
    except Exception as exc:
        return f"screenshot failed: {exc}"


def go(page, path, wait=400):
    resp = page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
    page.wait_for_timeout(wait)
    return resp.status if resp else None


def fill(page, selector, value):
    loc = page.locator(selector)
    n = loc.count()
    if n == 0:
        return f"MISSING:{selector}"
    loc.first.fill(value)
    return f"filled:{selector}"


def submit(page):
    for sel in ('button[type="submit"]', 'input[type="submit"]', "button.btn-gold-gradient"):
        loc = page.locator(sel)
        if loc.count():
            loc.first.click()
            page.wait_for_timeout(700)
            return f"clicked:{sel}"
    return "NO_SUBMIT_FOUND"


def login(page, creds):
    go(page, "/dashboard/login")
    actions = [
        fill(page, 'input[name="username"]', creds[0]),
        fill(page, 'input[name="password"]', creds[1]),
        submit(page),
    ]
    page.wait_for_timeout(600)
    return actions


def record(case_id, name, initial, action, visible, network, persistence,
           permissions, final, issues, screenshots, status="completed"):
    results.append({
        "id": case_id,
        "name": name,
        "status": status,
        "initial_state": initial,
        "user_action": action,
        "visible_interface_response": visible,
        "network_activity": network,
        "persistence_effect": persistence,
        "permission_behavior": permissions,
        "final_state": final,
        "issues": issues,
        "screenshots": screenshots,
        "console_errors": network.get("console_errors", []),
        "page_errors": network.get("page_errors", []),
    })


def nav_summary(page):
    return page.locator("a").evaluate_all(
        "(els) => els.map(e => ({text:(e.innerText||'').trim(), href:e.getAttribute('href')||''}))"
        ".filter(x => x.text).slice(0,60)"
    )


def case(page, case_id, name, fn):
    log(f"START {case_id}: {name}")
    before_db, before_json = db_snapshot(), json_snapshot()
    cap = Capture(page, case_id)
    shots = []
    try:
        payload = fn(page, shots)
        status = "completed"
    except Exception as exc:
        payload = {"error": f"{type(exc).__name__}: {exc}"}
        shots.append(shot(page, f"{case_id}_failure"))
        status = "failed"
    network = {
        "http_responses": cap.responses[-25:],
        "failed_requests": cap.failed[:15],
        "console_errors": cap.console_errors[:15],
        "page_errors": cap.page_errors[:15],
    }
    record(
        case_id, name,
        {"db_counts": before_db.get("counts"), "json": before_json},
        payload.get("action", ""),
        payload.get("visible", ""),
        network,
        {"db_before": before_db, "db_after": db_snapshot(),
         "json_before": before_json, "json_after": json_snapshot()},
        payload.get("permissions", ""),
        payload.get("final", ""),
        payload.get("issues", []),
        shots,
        status,
    )
    log(f"END {case_id}: {status}")


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900},
                                  ignore_https_errors=True)
        page = ctx.new_page()

        case(page, "PUB-01", "Public landing page", lambda p, s: (
            s.append(shot(p, "PUB-01_landing", True)),
            {"action": "GET /", "visible": (go(p, "/"), p.title(), p.locator("h1").all_inner_texts()[:5]),
             "final": p.url, "issues": []}
        )[1])

        case(page, "PUB-02", "Public professional profile", lambda p, s: (
            s.append(shot(p, "PUB-02_profile", True)),
            {"action": "GET /portfolio/alice_member",
             "visible": (go(p, "/portfolio/alice_member"), p.title(), p.locator("h1,h2,h3").all_inner_texts()[:12]),
             "final": p.url}
        ))

        case(page, "PUB-03", "Public catalog", lambda p, s: (
            s.append(shot(p, "PUB-03_catalog")),
            {"action": "GET /catalog",
             "visible": (go(p, "/catalog"), p.locator("body").inner_text()[:700]),
             "final": p.url}
        ))

        case(page, "PUB-04", "Documentation route", lambda p, s: (
            {"action": "GET /documentation", "visible": (go(p, "/documentation"), p.locator("body").inner_text()[:400]),
             "final": p.url, "issues": ["documentation target missing in source snapshot"]}
        ))

        case(page, "AUTH-01", "Login page", lambda p, s: (
            s.append(shot(p, "AUTH-01_login")),
            {"action": "GET /dashboard/login", "visible": (go(p, "/dashboard/login"), p.title()), "final": p.url}
        ))

        case(page, "AUTH-02", "Invalid login", lambda p, s: (
            {"action": "submit wrong credentials",
             "visible": (login(p, ("alice_member", "wrong-password")), p.locator(".alert, .flash, [class*=alert]").all_inner_texts()[:5]),
             "final": p.url, "issues": []}
        ))

        case(page, "AUTH-03", "Member login and dashboard", lambda p, s: (
            s.append(shot(p, "AUTH-03_member_dashboard", True)),
            {"action": "login as alice_member then open /dashboard",
             "visible": (login(p, ALICE), go(p, "/dashboard"), p.title(), nav_summary(p)),
             "final": p.url, "permissions": "member session"}
        ))

        case(page, "AUTH-04", "Admin login and dashboard", lambda p, s: (
            s.append(shot(p, "AUTH-04_admin_dashboard", True)),
            {"action": "login as siteadmin then open /dashboard",
             "visible": (login(p, ADMIN), go(p, "/dashboard"), p.title(), nav_summary(p)),
             "final": p.url, "permissions": "admin session"}
        ))

        case(page, "AUTH-05", "Registration attempt", lambda p, s: (
            s.append(shot(p, "AUTH-05_register")),
            {"action": "GET /register", "visible": (go(p, "/register"), p.locator("body").inner_text()[:500]),
             "final": p.url, "issues": ["expected BuildError/500 from prior static audit"]}
        ))

        # Member communication flow
        def member_flow(p, s):
            login(p, ALICE)
            go(p, "/dashboard/messages/internal")
            s.append(shot(p, "COM-01_inbox"))
            inbox = p.locator("body").inner_text()[:500]
            go(p, "/dashboard/messages/internal/compose")
            s.append(shot(p, "COM-02_compose"))
            fields = [
                fill(p, 'input[name="receiver_id"]', "admin"),
                fill(p, 'textarea[name="message"]', "Discovery synthetic inquiry"),
                submit(p),
            ]
            s.append(shot(p, "COM-03_after_send"))
            return {"action": "member composes internal message to admin",
                    "visible": {"inbox": inbox, "fields": fields, "url": p.url,
                                "flash": p.locator(".alert, [class*=alert]").all_inner_texts()[:5]},
                    "permissions": "member may address administration only",
                    "final": p.url,
                    "issues": ["verify receiver_id is validated server-side in later source review"]}
        case(page, "COM-01", "Member internal message lifecycle", member_flow)

        def reply_flow(p, s):
            snap = db_snapshot()
            rows = snap.get("messages", [])
            thread_id = None
            for r in rows:
                if isinstance(r, list) and r[1] == "internal" and r[4] == "admin":
                    thread_id = r[0]
                    break
            if not thread_id:
                return {"action": "member reply", "visible": "no internal thread found to reply to",
                        "issues": ["upstream COM-01 did not persist a thread"]}
            login(p, ALICE)
            go(p, f"/dashboard/messages/internal/view/{thread_id}")
            s.append(shot(p, "COM-04_thread_view"))
            body = p.locator("body").inner_text()[:900]
            fields = [fill(p, '[name="reply_content"]', "Synthetic member reply"), submit(p)]
            s.append(shot(p, "COM-05_after_reply"))
            return {"action": "member replies in own thread", "visible": {"body": body, "fields": fields, "url": p.url},
                    "final": p.url, "permissions": "participant only"}
        case(page, "COM-02", "Member reply in own thread", reply_flow)

        def admin_reply(p, s):
            snap = db_snapshot()
            thread_id = None
            for r in snap.get("messages", []):
                if isinstance(r, list) and r[1] == "internal":
                    thread_id = r[0]
                    break
            if not thread_id:
                return {"action": "admin reply", "visible": "no thread available", "issues": []}
            login(p, ADMIN)
            go(p, f"/dashboard/messages/internal/view/{thread_id}")
            s.append(shot(p, "COM-06_admin_thread"))
            fields = [fill(p, '[name="reply_content"]', "Synthetic admin reply"), submit(p)]
            return {"action": "admin replies to member thread",
                    "visible": {"body": p.locator("body").inner_text()[:900], "fields": fields, "url": p.url},
                    "final": p.url, "permissions": "admin override"}
        case(page, "COM-03", "Admin reply to member thread", admin_reply)

        def unauthorized(p, s):
            snap = db_snapshot()
            thread_id = None
            for r in snap.get("messages", []):
                if isinstance(r, list) and r[1] == "internal":
                    thread_id = r[0]
                    break
            login(p, BOB)
            target = f"/dashboard/messages/internal/view/{thread_id}" if thread_id else "/dashboard/messages"
            code = go(p, target)
            s.append(shot(p, "COM-07_unauthorized"))
            return {"action": f"bob opens another member's thread ({thread_id})",
                    "visible": {"status": code, "body": p.locator("body").inner_text()[:600]},
                    "final": p.url, "permissions": "non-participant access attempt",
                    "issues": ["check server-side participant enforcement"]}
        case(page, "COM-04", "Non-participant thread access", unauthorized)

        def poll(p, s):
            login(p, ALICE)
            go(p, "/dashboard")
            p.wait_for_timeout(3500)
            return {"action": "wait for 30s poll trigger on dashboard (initial load fires immediately)",
                    "visible": p.locator(".notification-badge").all_inner_texts(),
                    "final": p.url, "issues": []}
        case(page, "NOT-01", "Notification polling", poll)

        def portfolio_edit(p, s):
            login(p, ALICE)
            go(p, "/dashboard/general")
            s.append(shot(p, "PF-01_general"))
            a = [fill(p, 'input[name="name"]', "Alice Discovery"),
                 fill(p, 'input[name="title"]', "Discovery Title"),
                 fill(p, 'textarea[name="description"]', "Synthetic description"),
                 submit(p)]
            go(p, "/dashboard/about")
            b = [fill(p, '[name="about"]', "Synthetic about updated"), submit(p)]
            go(p, "/dashboard/skills")
            c = [fill(p, '[name="skill_name[]"]', "Playwright"),
                 fill(p, '[name="skill_level[]"]', "91"), submit(p)]
            s.append(shot(p, "PF-02_after_edit"))
            return {"action": "edit general/about/skills", "visible": {"general": a, "about": b, "skills": c},
                    "final": p.url, "issues": []}
        case(page, "PF-01", "Portfolio profile editing", portfolio_edit)

        def project_add(p, s):
            login(p, ALICE)
            go(p, "/dashboard/projects/add")
            s.append(shot(p, "PF-03_add_project"))
            fields = [fill(p, '[name="title"]', "Discovery Project"),
                      fill(p, '[name="short_description"]', "Synthetic short description"),
                      fill(p, '[name="content"]', "Synthetic full content"),
                      fill(p, '[name="technologies[]"]', "Python"),
                      fill(p, '[name="demo_url"]', "https://example.test"),
                      submit(p)]
            s.append(shot(p, "PF-04_projects_list"))
            return {"action": "add project", "visible": {"fields": fields, "url": p.url,
                    "body": p.locator("body").inner_text()[:600]}, "final": p.url, "issues": []}
        case(page, "PF-02", "Project lifecycle (create/list)", project_add)

        def public_after(p, s):
            go(p, "/portfolio/alice_member")
            s.append(shot(p, "PF-05_public_after_edits", True))
            return {"action": "view public profile after edits",
                    "visible": p.locator("body").inner_text()[:1400], "final": p.url, "issues": []}
        case(page, "PF-03", "Public profile reflects edits", public_after)

        def admin_users(p, s):
            login(p, ADMIN)
            go(p, "/dashboard/users")
            s.append(shot(p, "ADM-01_users"))
            return {"action": "admin user directory", "visible": p.locator("body").inner_text()[:1200],
                    "final": p.url, "permissions": "admin only"}
        case(page, "ADM-01", "Admin user management", admin_users)

        def demo_restrict(p, s):
            login(p, CAROL)
            code = go(p, "/dashboard/projects/add")
            s.append(shot(p, "ADM-02_demo_block"))
            return {"action": "demo account attempts project add",
                    "visible": {"status": code, "body": p.locator("body").inner_text()[:500]},
                    "final": p.url, "permissions": "demo restrictions"}
        case(page, "ADM-02", "Demo mode restriction", demo_restrict)

        def logout(p, s):
            login(p, ALICE)
            go(p, "/dashboard")
            s.append(shot(p, "AUTH-06_before_logout"))
            go(p, "/dashboard/logout")
            code = go(p, "/dashboard")
            return {"action": "logout then open /dashboard",
                    "visible": {"status": code, "body": p.locator("body").inner_text()[:400]},
                    "final": p.url, "permissions": "session cleared"}
        case(page, "AUTH-06", "Logout and session behavior", logout)

        ctx.close()
        browser.close()

    (RESULTS / "live_results.json").write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    (LOGS / "playwright_run.log").write_text("\n".join(run_log), encoding="utf-8")
    summary = [
        "# Live discovery execution summary", "",
        f"Total cases: {len(results)}",
        f"Completed: {sum(1 for r in results if r['status'] == 'completed')}",
        f"Failed: {sum(1 for r in results if r['status'] == 'failed')}", "",
        "| ID | Case | Status | Screenshots | Console errors | Page errors |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for r in results:
        summary.append(
            f"| {r['id']} | {r['name']} | {r['status']} | "
            f"{len(r['screenshots'])} | {len(r['network_activity']['console_errors'])} | "
            f"{len(r['network_activity']['page_errors'])} |")
    (RESULTS / "live_summary.md").write_text("\n".join(summary), encoding="utf-8")
    log("RESULTS WRITTEN")


if __name__ == "__main__":
    main()
