"""Write disposable synthetic data into the isolated app copy only."""
import json
import pathlib
from werkzeug.security import generate_password_hash

WS = pathlib.Path(r"C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace")
TARGET = WS / "app-copy" / "data.json"
PASSWORD = "TestPass123!"


def portfolio(username, label, theme="luxury-gold"):
    return {
        "username": username,
        "name": label,
        "title": "Discovery Test Professional",
        "description": "Synthetic data for isolated product discovery.",
        "about": f"{label} is a synthetic test profile used only in the isolated discovery runtime.",
        "photo": "",
        "skills": [{"name": "Python", "level": 80}, {"name": "Research", "level": 70}],
        "projects": [{
            "id": 1,
            "title": "Synthetic Project",
            "short_description": "Disposable project record for live testing.",
            "description": "Disposable project record for live testing.",
            "technologies": ["Python"],
            "image": "",
            "created_at": "2026-01-01 00:00:00",
        }],
        "clients": [],
        "messages": [],
        "contact": {"email": f"{username}@example.test", "phone": "", "location": "Test City"},
        "social": {"linkedin": "", "github": "", "twitter": ""},
        "settings": {"theme": theme},
        "visitors": {"total": 0, "today": [], "unique_ips": []},
        "notifications": {},
    }


def user(uid, username, label, demo=False):
    return {
        "id": uid,
        "username": username,
        "password_hash": generate_password_hash(PASSWORD),
        "email": f"{username}@example.test",
        "role": "user",
        "is_demo": demo,
        "created_at": "2026-01-01 00:00:00",
    }


data = {
    "name": "Discovery Test Site",
    "title": "Synthetic Professional Portfolio",
    "description": "Synthetic data only — isolated discovery runtime.",
    "photo": "",
    "about": "Synthetic global about text.",
    "skills": [],
    "projects": [],
    "clients": [],
    "messages": [],
    "settings": {},
    "social": {},
    "contact": {"email": "site@example.test", "phone": "", "location": "Test City"},
    "visitors": {},
    "users": [
        user(1, "alice_member", "Alice Member"),
        user(2, "bob_member", "Bob Member"),
        user(3, "carol_demo", "Carol Demo", demo=True),
    ],
    "portfolios": {
        "alice_member": portfolio("alice_member", "Alice Member"),
        "bob_member": portfolio("bob_member", "Bob Member", theme="modern-dark"),
        "carol_demo": portfolio("carol_demo", "Carol Demo", theme="clean-light"),
        "admin": portfolio("admin", "Site Administration"),
    },
}

TARGET.parent.mkdir(parents=True, exist_ok=True)
TARGET.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print("SYNTHETIC DATA WRITTEN:", TARGET)
print("SYNTHETIC PASSWORD:", PASSWORD)
