"""Discovery-only launcher. Lives OUTSIDE the application source tree.

Guarantees for the isolated runtime:
  * disposable copy of the app as cwd / sys.path
  * SQLite DB inside the disposable copy
  * synthetic admin credentials only
  * no Telegram / SMTP / webhook / payment side effects
  * no APScheduler background jobs
  * loopback-only binding
"""
import os
import pathlib
import sys

WS = pathlib.Path(r"C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace")
APP = WS / "app-copy"

os.chdir(APP)
sys.path.insert(0, str(APP))

os.environ["FLASK_ENV"] = "production"
os.environ["DATABASE_URL"] = "sqlite:///" + str(WS / "app-copy" / "discovery.db").replace("\\", "/")
os.environ["SESSION_SECRET"] = "discovery-only-not-a-production-secret"
os.environ["ADMIN_USERNAME"] = "siteadmin"
os.environ["ADMIN_PASSWORD"] = "DiscoveryAdmin123!"

# Remove any externally supplied notification credentials.
for key in list(os.environ.keys()):
    if key.startswith(("ADMIN_TELEGRAM_", "ADMIN_SMTP_", "TELEGRAM_", "SMTP_",
                       "ADMIN_RECIPIENT_", "ADMIN_EMAIL")):
        os.environ.pop(key, None)

# Disable import-time scheduler before importing the app.
import apscheduler.schedulers.background as bg
bg.BackgroundScheduler.start = lambda self, *args, **kwargs: None

# Hard backstop: block outbound HTTP and SMTP even if a helper is missed.
import requests
def _blocked_post(*args, **kwargs):
    raise RuntimeError("BLOCKED external HTTP in discovery runtime")
requests.post = _blocked_post

import smtplib
class _BlockedSMTP:
    def __init__(self, *args, **kwargs):
        raise RuntimeError("BLOCKED external SMTP in discovery runtime")
smtplib.SMTP = _BlockedSMTP

import app as app_module

def _noop(*args, **kwargs):
    return True

for _name in (
    "send_admin_notification",
    "send_user_notification",
    "send_telegram_notification",
    "send_telegram_event_notification",
    "send_event_notification_async",
    "send_telegram_notification_async",
    "send_email",
    "send_confirmation_email",
):
    if hasattr(app_module, _name):
        setattr(app_module, _name, _noop)

print("DISCOVERY RUNTIME READY", flush=True)
print("DB:", os.environ["DATABASE_URL"], flush=True)
print("CWD:", os.getcwd(), flush=True)
app_module.app.run(host="127.0.0.1", port=5001, debug=False,
                   use_reloader=False, threaded=True)
