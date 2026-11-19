/* Discovery-only Chrome DevTools Protocol harness.
 * Lives OUTSIDE the application source tree. Uses system Chrome, no npm install.
 */
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const WS = 'C:\\Users\\infor\\AppData\\Local\\Temp\\opencode\\discovery-workspace';
const APP = path.join(WS, 'app-copy');
const DB = path.join(APP, 'discovery.db');
const DATA_JSON = path.join(APP, 'data.json');
const OUT = 'D:\\Codexx-Academy-F-VV-main\\DISCOVERY\\evidence';
const SHOTS = path.join(OUT, 'screenshots');
const RESULTS = path.join(OUT, 'results');
const LOGS = path.join(OUT, 'logs');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5001';
const PROFILE = path.join(WS, 'cdp-chrome-profile');

const ADMIN = ['siteadmin', 'DiscoveryAdmin123!'];
const ALICE = ['alice_member', 'TestPass123!'];
const BOB = ['bob_member', 'TestPass123!'];
const CAROL = ['carol_demo', 'TestPass123!'];

for (const p of [SHOTS, RESULTS, LOGS]) fs.mkdirSync(p, { recursive: true });

const results = [];
const runLog = [];
let cdp = null;
let chrome = null;
let targetWs = null;
let capture = null;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  runLog.push(line);
  console.log(msg);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', ev => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.code}: ${msg.error.message}`));
        else resolve(msg.result || {});
      } else if (msg.method && this.handlers.has(msg.method)) {
        for (const fn of this.handlers.get(msg.method)) {
          try { fn(msg.params || {}); } catch (e) { log(`EVENT_HANDLER_ERROR ${msg.method}: ${e.message}`); }
        }
      }
    });
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 60000);
    });
  }
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, userGesture: true,
    });
    if (r.exceptionDetails) {
      const ex = r.exceptionDetails.exception;
      throw new Error(ex && ex.description ? ex.description : r.exceptionDetails.text);
    }
    return r.result ? r.result.value : undefined;
  }
}

function newCapture() {
  capture = { http_responses: [], failed_requests: [], console_errors: [], page_errors: [], javascript_dialogs: [] };
}

function wireEvents(c) {
  c.on('Network.responseReceived', p => {
    const url = p.response && p.response.url ? p.response.url : '';
    if (!url.startsWith(BASE)) return;
    if (p.response.status >= 400 || url.includes('/api/') || url.includes('/notifications/')) {
      capture.http_responses.push({ url: url.replace(BASE, ''), status: p.response.status });
    }
  });
  c.on('Network.loadingFailed', p => {
    capture.failed_requests.push({ url: p.requestId, failure: p.errorText });
  });
  c.on('Runtime.consoleAPICalled', p => {
    if (p.type !== 'error') return;
    const text = (p.args || []).map(a => (a.value !== undefined ? String(a.value) : a.description || '')).join(' ');
    capture.console_errors.push(text);
  });
  c.on('Runtime.exceptionThrown', p => {
    const ex = p.exceptionDetails && p.exceptionDetails.exception;
    capture.page_errors.push(ex && ex.description ? ex.description : (p.exceptionDetails && p.exceptionDetails.text) || 'exception');
  });
  c.on('Log.entryAdded', p => {
    if (p.entry && p.entry.level === 'error') capture.page_errors.push(p.entry.text);
  });
}

async function launchChrome() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  fs.mkdirSync(PROFILE, { recursive: true });
  const stderr = [];
  chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=0', `--user-data-dir=${PROFILE}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--window-size=1440,900', 'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  chrome.stderr.on('data', d => stderr.push(d.toString()));
  const portFile = path.join(PROFILE, 'DevToolsActivePort');
  let port = null;
  for (let i = 0; i < 150; i++) {
    if (fs.existsSync(portFile)) {
      const lines = fs.readFileSync(portFile, 'utf8').split(/\r?\n/);
      if (lines[0] && /^\d+$/.test(lines[0])) { port = lines[0]; break; }
    }
    await sleep(100);
  }
  if (!port) throw new Error(`Chrome devtools port unavailable. stderr: ${stderr.join('').slice(-1000)}`);
  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!targetRes.ok) throw new Error(`CDP target creation failed: ${targetRes.status}`);
  const target = await targetRes.json();
  targetWs = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    targetWs.addEventListener('open', resolve, { once: true });
    targetWs.addEventListener('error', reject, { once: true });
  });
  cdp = new CDP(targetWs);
  wireEvents(cdp);
  cdp.on('Page.javascriptDialogOpening', async p => {
    const message = p.message || '';
    log(`JS_DIALOG ${p.type || 'confirm'}: ${message}`);
    if (capture) capture.javascript_dialogs.push({ type: p.type || 'confirm', message });
    try {
      await cdp.send('Page.handleJavaScriptDialog', { accept: true });
    } catch (e) {
      log(`JS_DIALOG_HANDLE_ERROR: ${e.message}`);
    }
  });
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Log.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  });
  log(`CHROME READY port=${port} target=${target.id}`);
}

async function readyWait(timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const state = await cdp.evaluate('document.readyState');
      if (state === 'interactive' || state === 'complete') return state;
    } catch {}
    await sleep(100);
  }
  return 'timeout';
}

async function httpStatus(p) {
  try {
    const r = await fetch(BASE + p, { redirect: 'follow' });
    return r.status;
  } catch (e) { return `error: ${e.message}`; }
}

async function go(p, wait = 400) {
  const status = await httpStatus(p);
  await cdp.send('Page.navigate', { url: BASE + p });
  await readyWait();
  await sleep(wait);
  return status;
}

async function fill(selector, value) {
  const expr = `(() => {
    const sel = ${JSON.stringify(selector)};
    const el = document.querySelector(sel);
    if (!el) return 'MISSING:' + sel;
    const val = ${JSON.stringify(String(value))};
    if (el.tagName === 'SELECT') {
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return 'selected:' + sel + '=' + el.value;
    }
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return 'filled:' + sel;
  })()`;
  return await cdp.evaluate(expr);
}

async function clickSubmit() {
  const expr = `(() => {
    const sels = ['button[type="submit"]', 'input[type="submit"]', 'button.btn-gold-gradient'];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el) { el.click(); return 'clicked:' + s; }
    }
    return 'NO_SUBMIT_FOUND';
  })()`;
  const r = await cdp.evaluate(expr);
  await sleep(700);
  return r;
}

async function clickByText(text) {
  const expr = `(() => {
    const wanted = ${JSON.stringify(text)};
    const els = Array.from(document.querySelectorAll('a,button'));
    const el = els.find(e => (e.innerText || '').includes(wanted));
    if (!el) return 'MISSING_TEXT:' + wanted;
    el.click();
    return 'clicked_text:' + wanted;
  })()`;
  const r = await cdp.evaluate(expr);
  await sleep(700);
  return r;
}

async function selectRadio(name, value) {
  const literalName = JSON.stringify(name);
  const literalValue = JSON.stringify(value);
  const expr = `(() => {
    const el = document.querySelector('input[name=${literalName}][value=${literalValue}]');
    if (!el) return 'MISSING_RADIO:${name}=${value}';
    el.click();
    return 'selected_radio:${value}';
  })()`;
  return await cdp.evaluate(expr);
}

async function bodyText(limit = 800) {
  const t = await cdp.evaluate('document.body ? document.body.innerText : ""');
  return String(t || '').slice(0, limit);
}

async function allText(selector, limit = 12) {
  const arr = await cdp.evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).map(e => (e.innerText||'').trim()).filter(Boolean).slice(0,${limit})`);
  return arr || [];
}

async function pageTitle() { return await cdp.evaluate('document.title'); }

async function navSummary() {
  const arr = await cdp.evaluate(`Array.from(document.querySelectorAll('a')).map(e => ({text:(e.innerText||'').trim(), href:e.getAttribute('href')||''})).filter(x=>x.text).slice(0,60)`);
  return arr || [];
}

async function shot(name) {
  const file = path.join(SHOTS, `${name}.png`);
  try {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    return path.basename(file);
  } catch (e) { return `screenshot failed: ${e.message}`; }
}

function dbSnapshot() {
  const out = { messages: [], counts: {} };
  if (!fs.existsSync(DB)) { out.error = 'DB missing'; return out; }
  let db;
  try {
    db = new DatabaseSync(DB, { readOnly: true });
    for (const t of ['messages', 'users', 'workspaces']) {
      try { out.counts[t] = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n; }
      catch (e) { out.counts[t] = `error: ${e.message}`; }
    }
    try {
      out.messages = db.prepare(`SELECT id, category, sender_role, sender_id, receiver_id, parent_id,
        is_read, is_internal, length(message) AS msg_len, created_at FROM messages
        ORDER BY created_at DESC LIMIT 12`).all();
    } catch (e) { out.messages = [`error: ${e.message}`]; }
  } catch (e) { out.error = e.message; }
  finally { try { if (db) db.close(); } catch {} }
  return out;
}

function jsonSnapshot() {
  try {
    const d = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8'));
    const p = (d.portfolios || {}).alice_member || {};
    return {
      users: (d.users || []).map(u => ({ id: u.id, username: u.username, role: u.role })),
      portfolios: Object.keys(d.portfolios || {}).sort(),
      alice_skills: (p.skills || []).map(s => s.name),
      alice_projects: (p.projects || []).map(x => x.title),
      alice_clients: (p.clients || []).length,
      alice_theme: p.settings && p.settings.theme,
      carol_projects: ((d.portfolios || {}).carol_demo || {}).projects
        ? (d.portfolios || {}).carol_demo.projects.map(x => x.title) : [],
    };
  } catch (e) { return { error: e.message }; }
}

async function login(creds) {
  await go('/dashboard/logout');
  await go('/dashboard/login');
  const actions = [];
  actions.push(await fill('input[name="username"]', creds[0]));
  actions.push(await fill('input[name="password"]', creds[1]));
  actions.push(await clickSubmit());
  await sleep(600);
  return actions;
}

async function runCase(id, name, fn) {
  log(`START ${id}: ${name}`);
  const beforeDb = dbSnapshot();
  const beforeJson = jsonSnapshot();
  newCapture();
  const shots = [];
  let payload;
  let status = 'completed';
  let caseError = '';
  try { payload = await fn(shots); }
  catch (e) {
    caseError = `${e.name}: ${e.message}`;
    payload = { error: caseError };
    shots.push(await shot(`${id}_failure`));
    status = 'failed';
    log(`CASE_ERROR ${id}: ${caseError}`);
  }
  results.push({
    id, name, status, tool: 'chrome-cdp', error: caseError,
    initial_state: { db_counts: beforeDb.counts, json: beforeJson },
    user_action: payload.action || '',
    visible_interface_response: payload.visible || '',
    network_activity: {
      http_responses: capture.http_responses.slice(-25),
      failed_requests: capture.failed_requests.slice(0, 15),
      console_errors: capture.console_errors.slice(0, 15),
      page_errors: capture.page_errors.slice(0, 15),
      javascript_dialogs: capture.javascript_dialogs.slice(0, 15),
    },
    persistence_effect: {
      db_before: beforeDb, db_after: dbSnapshot(),
      json_before: beforeJson, json_after: jsonSnapshot(),
    },
    permission_behavior: payload.permissions || '',
    final_state: payload.final || '',
    issues: payload.issues || [],
    screenshots: shots,
    console_errors: capture.console_errors.slice(0, 15),
    page_errors: capture.page_errors.slice(0, 15),
  });
  log(`END ${id}: ${status}`);
}

async function cases() {
  await runCase('PUB-01', 'Public landing page', async s => {
    s.push(await shot('PUB-01_landing'));
    const status = await go('/');
    return { action: 'GET /', visible: { status, title: await pageTitle(), h1: await allText('h1', 5) }, final: 'landing' };
  });

  await runCase('PUB-02', 'Public professional profile', async s => {
    const status = await go('/portfolio/alice_member');
    s.push(await shot('PUB-02_profile'));
    return { action: 'GET /portfolio/alice_member', visible: { status, title: await pageTitle(), headings: await allText('h1,h2,h3', 12) }, final: 'profile' };
  });

  await runCase('PUB-03', 'Public catalog', async s => {
    const status = await go('/catalog');
    s.push(await shot('PUB-03_catalog'));
    return { action: 'GET /catalog', visible: { status, body: await bodyText(700) }, final: 'catalog' };
  });

  await runCase('PUB-04', 'Documentation route', async s => {
    const status = await go('/documentation');
    return { action: 'GET /documentation', visible: { status, body: await bodyText(400) }, final: 'documentation', issues: ['documentation target missing in source snapshot'] };
  });

  await runCase('PUB-05', 'Public inquiry submission', async s => {
    const status = await go('/portfolio/alice_member');
    const fields = [];
    fields.push(await fill('input[name="name"]', 'Discovery Visitor'));
    fields.push(await fill('input[name="email"]', 'visitor@example.test'));
    fields.push(await fill('select[name="request_type"]', 'service'));
    fields.push(await fill('select[name="interest_area"]', 'development'));
    fields.push(await fill('textarea[name="message"]', 'Synthetic public inquiry for discovery testing.'));
    fields.push(await clickSubmit());
    s.push(await shot('PUB-05_after_inquiry'));
    return { action: 'submit public portfolio inquiry', visible: { status, fields, flashes: await allText('.alert,[class*=alert]', 5), body: await bodyText(500) }, final: 'after inquiry' };
  });

  await runCase('AUTH-01', 'Login page', async s => {
    const status = await go('/dashboard/login');
    s.push(await shot('AUTH-01_login'));
    return { action: 'GET /dashboard/login', visible: { status, title: await pageTitle() }, final: 'login' };
  });

  await runCase('AUTH-02', 'Invalid login', async s => {
    const actions = await login(['alice_member', 'wrong-password']);
    return { action: 'submit wrong credentials', visible: { actions, flashes: await allText('.alert,.flash,[class*=alert]', 5) }, final: 'invalid login result' };
  });

  await runCase('AUTH-03', 'Member login and dashboard', async s => {
    const actions = await login(ALICE);
    const status = await go('/dashboard');
    s.push(await shot('AUTH-03_member_dashboard'));
    return { action: 'login as alice_member then open /dashboard', visible: { actions, status, title: await pageTitle(), nav: await navSummary() }, final: 'member dashboard', permissions: 'member session' };
  });

  await runCase('AUTH-04', 'Admin login and dashboard', async s => {
    const actions = await login(ADMIN);
    const status = await go('/dashboard');
    s.push(await shot('AUTH-04_admin_dashboard'));
    return { action: 'login as siteadmin then open /dashboard', visible: { actions, status, title: await pageTitle(), nav: await navSummary() }, final: 'admin dashboard', permissions: 'admin session' };
  });

  await runCase('AUTH-05', 'Registration attempt', async s => {
    const status = await go('/register');
    s.push(await shot('AUTH-05_register'));
    return { action: 'GET /register', visible: { status, body: await bodyText(500) }, final: 'register', issues: ['expected BuildError/500 from prior static audit'] };
  });

  await runCase('COM-01', 'Member internal message lifecycle', async s => {
    await login(ALICE);
    const inboxStatus = await go('/dashboard/messages/internal');
    s.push(await shot('COM-01_inbox'));
    const inbox = await bodyText(500);
    await go('/dashboard/messages/internal/compose');
    s.push(await shot('COM-02_compose'));
    const fields = [];
    fields.push(await fill('input[name="receiver_id"]', 'admin'));
    fields.push(await fill('textarea[name="message"]', 'Discovery synthetic inquiry'));
    fields.push(await clickSubmit());
    s.push(await shot('COM-03_after_send'));
    return { action: 'member composes internal message to admin', visible: { inboxStatus, inbox, fields, flashes: await allText('.alert,[class*=alert]', 5) }, final: 'after send', permissions: 'member may address administration only' };
  });

  await runCase('COM-02', 'Member reply in own thread', async s => {
    const rows = dbSnapshot().messages || [];
    let threadId = null;
    for (const r of rows) if (r && r.category === 'internal' && r.receiver_id === 'admin') { threadId = r.id; break; }
    if (!threadId) return { action: 'member reply', visible: 'no internal thread found', issues: ['upstream COM-01 did not persist a thread'] };
    await login(ALICE);
    const status = await go(`/dashboard/messages/internal/view/${threadId}`);
    s.push(await shot('COM-04_thread_view'));
    const body = await bodyText(900);
    const fields = [await fill('[name="reply_content"]', 'Synthetic member reply'), await clickSubmit()];
    s.push(await shot('COM-05_after_reply'));
    return { action: 'member replies in own thread', visible: { status, body, fields }, final: 'after member reply', permissions: 'participant only' };
  });

  await runCase('COM-03', 'Admin reply to member thread', async s => {
    const rows = dbSnapshot().messages || [];
    let threadId = null;
    for (const r of rows) if (r && r.category === 'internal') { threadId = r.id; break; }
    if (!threadId) return { action: 'admin reply', visible: 'no thread available' };
    await login(ADMIN);
    const status = await go(`/dashboard/messages/internal/view/${threadId}`);
    s.push(await shot('COM-06_admin_thread'));
    const fields = [await fill('[name="reply_content"]', 'Synthetic admin reply'), await clickSubmit()];
    return { action: 'admin replies to member thread', visible: { status, body: await bodyText(900), fields }, final: 'after admin reply', permissions: 'admin override' };
  });

  await runCase('COM-04', 'Non-participant thread access', async s => {
    const rows = dbSnapshot().messages || [];
    let threadId = null;
    for (const r of rows) if (r && r.category === 'internal') { threadId = r.id; break; }
    await login(BOB);
    const target = threadId ? `/dashboard/messages/internal/view/${threadId}` : '/dashboard/messages';
    const status = await go(target);
    s.push(await shot('COM-07_unauthorized'));
    return { action: `bob opens another member's thread (${threadId})`, visible: { status, body: await bodyText(600) }, final: 'after unauthorized attempt', permissions: 'non-participant access attempt' };
  });

  await runCase('COM-05', 'Archive link hard-delete behavior', async s => {
    const rows = dbSnapshot().messages || [];
    let threadId = null;
    for (const r of rows) if (r && r.category === 'internal' && !r.parent_id) { threadId = r.id; break; }
    if (!threadId) return { action: 'archive thread', visible: 'no internal root thread available' };
    await login(ALICE);
    const viewStatus = await go(`/dashboard/messages/internal/view/${threadId}`);
    s.push(await shot('COM-08_before_archive'));
    const click = await clickByText('Archive Thread');
    s.push(await shot('COM-09_after_archive'));
    const after = dbSnapshot();
    const remaining = (after.messages || []).filter(r => r && r.parent_id === threadId);
    return {
      action: `open internal thread ${threadId} and click Archive Thread`,
      visible: { viewStatus, click, flashes: await allText('.alert,[class*=alert]', 5), body: await bodyText(500) },
      final: 'after archive click',
      permissions: 'archive policy probe',
      issues: [`thread still present: ${(after.messages || []).some(r => r && r.id === threadId)}`, `orphaned replies: ${remaining.length}`],
    };
  });

  await runCase('NOT-01', 'Notification polling', async s => {
    await login(ALICE);
    await go('/dashboard');
    await sleep(3500);
    return { action: 'wait for notification poll on dashboard', visible: { badges: await allText('.notification-badge', 10) }, final: 'dashboard poll' };
  });

  await runCase('PF-01', 'Portfolio profile editing', async s => {
    await login(ALICE);
    await go('/dashboard/general');
    s.push(await shot('PF-01_general'));
    const a = [await fill('input[name="name"]', 'Alice Discovery'), await fill('input[name="title"]', 'Discovery Title'), await fill('textarea[name="description"]', 'Synthetic description'), await clickSubmit()];
    await go('/dashboard/about');
    const b = [await fill('[name="about"]', 'Synthetic about updated'), await clickSubmit()];
    await go('/dashboard/skills');
    const c = [await fill('[name="skill_name[]"]', 'Playwright'), await fill('[name="skill_level[]"]', '91'), await clickSubmit()];
    s.push(await shot('PF-02_after_edit'));
    return { action: 'edit general/about/skills', visible: { general: a, about: b, skills: c }, final: 'after profile edits' };
  });

  await runCase('PF-02', 'Project lifecycle (create/list)', async s => {
    await login(ALICE);
    await go('/dashboard/projects/add');
    s.push(await shot('PF-03_add_project'));
    const fields = [
      await fill('[name="title"]', 'Discovery Project'),
      await fill('[name="short_description"]', 'Synthetic short description'),
      await fill('[name="content"]', 'Synthetic full content'),
      await fill('[name="technologies[]"]', 'Python'),
      await fill('[name="demo_url"]', 'https://example.test'),
      await clickSubmit(),
    ];
    s.push(await shot('PF-04_projects_list'));
    return { action: 'add project', visible: { fields, body: await bodyText(600) }, final: 'after project add' };
  });

  await runCase('PF-03', 'Public profile reflects edits', async s => {
    const status = await go('/portfolio/alice_member');
    s.push(await shot('PF-05_public_after_edits'));
    return { action: 'view public profile after edits', visible: { status, body: await bodyText(1400) }, final: 'public profile' };
  });

  await runCase('PF-04', 'Silver-grey theme selection', async s => {
    await login(ALICE);
    const status = await go('/dashboard/settings');
    const before = jsonSnapshot().alice_theme;
    const radio = await selectRadio('theme', 'silver-grey');
    const submitResult = await clickSubmit();
    s.push(await shot('PF-06_silver_theme'));
    const after = jsonSnapshot().alice_theme;
    const publicStatus = await go('/portfolio/alice_member');
    s.push(await shot('PF-07_public_silver_theme'));
    return {
      action: 'select silver-grey theme and view public profile',
      visible: { status, radio, submitResult, publicStatus, before, after },
      final: 'public profile after theme change',
      issues: [`theme persisted: ${after === 'silver-grey'}`],
    };
  });

  await runCase('ADM-01', 'Admin user management', async s => {
    await login(ADMIN);
    const status = await go('/dashboard/users');
    s.push(await shot('ADM-01_users'));
    return { action: 'admin user directory', visible: { status, body: await bodyText(1200) }, final: 'users', permissions: 'admin only' };
  });

  await runCase('ADM-02', 'Demo-mode project creation', async s => {
    await login(CAROL);
    const status = await go('/dashboard/projects/add');
    const before = jsonSnapshot().carol_projects;
    const fields = [
      await fill('[name="title"]', 'Demo Allowed Project'),
      await fill('[name="short_description"]', 'Source allowlist permits this write'),
      await fill('[name="content"]', 'Source allowlist permits this write'),
      await clickSubmit(),
    ];
    const after = jsonSnapshot().carol_projects;
    s.push(await shot('ADM-02_demo_project'));
    return {
      action: 'demo account submits project add',
      visible: { status, fields, flashes: await allText('.alert,[class*=alert]', 5), body: await bodyText(500) },
      final: 'after demo project submit',
      permissions: 'dashboard_add_project is in the demo allowlist (app.py:678)',
      issues: [`project persisted in demo portfolio: ${after.length > before.length}`],
    };
  });

  await runCase('AUTH-06', 'Logout and session behavior', async s => {
    await login(ALICE);
    await go('/dashboard');
    s.push(await shot('AUTH-06_before_logout'));
    await go('/dashboard/logout');
    const status = await go('/dashboard');
    return { action: 'logout then open /dashboard', visible: { status, body: await bodyText(400) }, final: 'after logout', permissions: 'session cleared' };
  });
}

async function main() {
  log('CDP HARNESS START');
  await launchChrome();
  await cases();
  fs.writeFileSync(path.join(RESULTS, 'live_results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(RESULTS, 'cdp_results.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(LOGS, 'cdp_run.log'), runLog.join('\n'));
  fs.writeFileSync(path.join(LOGS, 'playwright_run.log'), runLog.join('\n') + '\nNOTE: generated by Chrome CDP harness because Playwright wheel download failed.\n');
  const summary = [
    '# Live discovery execution summary', '',
    `Tool: Chrome DevTools Protocol harness (system Chrome)`,
    `Total cases: ${results.length}`,
    `Completed: ${results.filter(r => r.status === 'completed').length}`,
    `Failed: ${results.filter(r => r.status === 'failed').length}`, '',
    '| ID | Case | Status | Screenshots | Console errors | Page errors |',
    '| --- | --- | --- | --- | --- | --- |',
    ...results.map(r => `| ${r.id} | ${r.name} | ${r.status} | ${r.screenshots.length} | ${r.network_activity.console_errors.length} | ${r.network_activity.page_errors.length} |`),
  ];
  fs.writeFileSync(path.join(RESULTS, 'live_summary.md'), summary.join('\n'));
  fs.writeFileSync(path.join(RESULTS, 'cdp_summary.md'), summary.join('\n'));
  log('RESULTS WRITTEN');
}

main().catch(e => {
  const msg = `FATAL: ${e.stack || e.message}`;
  console.error(msg);
  try { fs.writeFileSync(path.join(LOGS, 'cdp_fatal.log'), msg); } catch {}
}).finally(async () => {
  try { if (targetWs) targetWs.close(); } catch {}
  try { if (chrome && !chrome.killed) spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
});
