# Reassessment live workflow digest

Cases: 35

## PUB-01 — Public landing page

- Status: completed
- Action: "GET /"
- Visible response:
```json
{
  "status": 200,
  "title": "Codexx Academy | Elite Proof-of-Work Portfolio Ecosystem",
  "h1": [
    "Where Real Work Is Shown, Not Sold"
  ]
}
```
- Persistence effect: no captured change
- Final state: landing
- Screenshots: PUB-01_landing.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PUB-02 — Public professional profile

- Status: completed
- Action: "GET /portfolio/alice_member"
- Visible response:
```json
{
  "status": 200,
  "title": "Alice Member - Professional Portfolio",
  "headings": [
    "Reassessment Test Professional",
    "Professional Path",
    "Alice Member",
    "Core Competencies",
    "Case Studies & Evidence",
    "Initiate Cooperation"
  ]
}
```
- Persistence effect: no captured change
- Final state: profile
- Screenshots: PUB-02_profile.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PUB-03 — Public catalog

- Status: completed
- Action: "GET /catalog"
- Visible response:
```json
{
  "status": 200,
  "body": "CODEXX ACADEMY\nHome\nLogin\nPortfolios Directory\n\nExplore professional identities built by our academy members\n\nOur directory is currently being prepared. Check back soon!"
}
```
- Persistence effect: no captured change
- Final state: catalog
- Screenshots: PUB-03_catalog.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PUB-04 — Documentation route

- Status: completed
- Action: "GET /documentation"
- Visible response:
```json
{
  "status": 404,
  "body": "404\nPage Not Found\n\nThe page you are looking for might have been removed, had its name changed, or is temporarily unavailable.\n\nBack to Home\nGo Back"
}
```
- Persistence effect: no captured change
- Final state: documentation
- Issues:
```json
[
  "documentation target missing in source snapshot"
]
```
- Console errors: []
- Page errors: ["Failed to load resource: the server responded with a status of 404 (NOT FOUND)"]
- Failed requests: []

## PUB-05 — Public inquiry submission

- Status: completed
- Action: "submit public portfolio inquiry"
- Visible response:
```json
{
  "status": 200,
  "fields": [
    "filled:input[name=\"name\"]",
    "filled:input[name=\"email\"]",
    "selected:select[name=\"request_type\"]=service",
    "selected:select[name=\"interest_area\"]=development",
    "filled:textarea[name=\"message\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "flashes": [
    "Your message has been delivered."
  ],
  "body": "Loading...\n\nCODEXX ACADEMY\nHome\nAbout\nSkills\nProjects\nContact\nReassessment Test Professional\n\nSynthetic data for isolated product reassessment.\n\nStart a Conversation\nView Portfolio\nProfessional Path\n\nThe foundation of trust and reliability\n\nAlice Member\n\nAlice Member is a synthetic test profile used only in the isolated reassessment runtime.\n\nProfessional: Alice Member\nFocus Area: Reassessment Test Professional\nBase: Test City\nDirect: alice_member@example.test\nResponse:\nProof: 1 Case Studies\nVie"
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [],
    "counts": {
      "messages": 0,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 1,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Final state: after inquiry
- Screenshots: PUB-05_after_inquiry.png
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-01 — Login page

- Status: completed
- Action: "GET /dashboard/login"
- Visible response:
```json
{
  "status": 200,
  "title": "Login - Dashboard"
}
```
- Persistence effect: no captured change
- Final state: login
- Screenshots: AUTH-01_login.png
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-02 — Invalid login

- Status: completed
- Action: "submit wrong credentials"
- Visible response:
```json
{
  "actions": [
    "filled:input[name=\"username\"]",
    "filled:input[name=\"password\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "flashes": [
    "Invalid credentials. Please try again."
  ]
}
```
- Persistence effect: no captured change
- Final state: invalid login result
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-03 — Member login and dashboard

- Status: completed
- Action: "login as alice_member then open /dashboard"
- Visible response:
```json
{
  "actions": [
    "filled:input[name=\"username\"]",
    "filled:input[name=\"password\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "status": 200,
  "title": "Dashboard - Codexx Admin",
  "nav": [
    {
      "text": "Codexx Academy",
      "href": "/dashboard"
    },
    {
      "text": "Overview",
      "href": "/dashboard"
    },
    {
      "text": "Identity",
      "href": "/dashboard/general"
    },
    {
      "text": "Proposition",
      "href": "/dashboard/about"
    },
    {
      "text": "Competencies",
      "href": "/dashboard/skills"
    },
    {
      "text": "Gallery",
      "href": "/dashboard/projects"
    },
    {
      "text": "Contact Info",
      "href": "/dashboard/contact"
    },
    {
      "text": "CRM",
      "href": "/dashboard/clients"
    },
    {
      "text": "Inbox",
      "href": "/dashboard/messages?category=all"
    },
    {
      "text": "Internal messages",
      "href": "/dashboard/messages/internal"
    },
    {
      "text": "Channels",
      "href": "/dashboard/social"
    },
    {
      "text": "Global Settings",
      "href": "/dashboard/settings"
    },
    {
      "text": "Access Standards",
      "href": "/dashboard/access-instructions"
    },
    {
      "text": "Sign Out",
      "href": "/dashboard/logout"
    },
    {
      "text": "View All",
      "href": "/dashboard/messages"
    },
    {
      "text": "Discovery Visitor\n                                    23:34\n                                \n                                Request Type: service\nInterest Area: development\nS...",
      "href": "/dashboard/messages/view/1b47d235-1478-4265-b941-c8e5088b0d2e"
    },
    {
      "text": "My Portfolio",
      "href": "/portfolio/alice_member"
    },
    {
      "text": "New Project Entry",
      "href": "/dashboard/projects/add"
    },
    {
      "text": "Update Identity",
      "href": "/dashboard/general"
    },
    {
      "text": "Review Inbox",
      "href": "/dashboard/messages"
    },
    {
      "text": "System Config",
      "href": "/dashboard/settings"
    }
  ]
}
```
- Persistence effect: no captured change
- Permission behavior: member session
- Final state: member dashboard
- Screenshots: AUTH-03_member_dashboard.png
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-04 — Admin login and dashboard

- Status: completed
- Action: "login as siteadmin then open /dashboard"
- Visible response:
```json
{
  "actions": [
    "filled:input[name=\"username\"]",
    "filled:input[name=\"password\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "status": 200,
  "title": "Dashboard - Codexx Admin",
  "nav": [
    {
      "text": "Codexx Academy",
      "href": "/dashboard"
    },
    {
      "text": "Overview",
      "href": "/dashboard"
    },
    {
      "text": "User Directory",
      "href": "/dashboard/users"
    },
    {
      "text": "Channels",
      "href": "/dashboard/social"
    },
    {
      "text": "Inbox",
      "href": "/dashboard/messages?category=all"
    },
    {
      "text": "Internal messages",
      "href": "/dashboard/messages/internal"
    },
    {
      "text": "Global Settings",
      "href": "/dashboard/settings"
    },
    {
      "text": "Access Standards",
      "href": "/dashboard/access-instructions"
    },
    {
      "text": "Sign Out",
      "href": "/dashboard/logout"
    },
    {
      "text": "View All",
      "href": "/dashboard/messages"
    },
    {
      "text": "Live Site",
      "href": "/landing"
    },
    {
      "text": "Manage Users",
      "href": "/dashboard/users"
    },
    {
      "text": "System Security",
      "href": "/dashboard/settings"
    },
    {
      "text": "Platform View",
      "href": "/landing"
    },
    {
      "text": "Terminate Session",
      "href": "/dashboard/logout"
    }
  ]
}
```
- Persistence effect: no captured change
- Permission behavior: admin session
- Final state: admin dashboard
- Screenshots: AUTH-04_admin_dashboard.png
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-05 — Registration attempt

- Status: completed
- Action: "GET /register"
- Visible response:
```json
{
  "status": 500,
  "body": "500\nInternal Server Error\n\nOops! Something went wrong on our end. We're working to fix it.\nPlease try again later or contact support if the problem persists.\n\nGo Home\nGo Back"
}
```
- Persistence effect: no captured change
- Final state: register
- Issues:
```json
[
  "expected BuildError/500 from prior static audit"
]
```
- Screenshots: AUTH-05_register.png
- Console errors: []
- Page errors: ["Failed to load resource: the server responded with a status of 500 (INTERNAL SERVER ERROR)"]
- Failed requests: []

## COM-01 — Member internal message lifecycle

- Status: completed
- Action: "member composes internal message to admin"
- Visible response:
```json
{
  "inboxStatus": 200,
  "inbox": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, alice_member\n1\nMy Portfolio\nInternal Communications\nInternal Chat\n Contact Admin\n0 Messages\nMember\tLast Message\tDate\tActions\n\nNo Internal Messages\n\nStart a conversation with another academy member.",
  "fields": [
    "filled:input[name=\"receiver_id\"]",
    "filled:textarea[name=\"message\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "flashes": [
    "New thread started."
  ]
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 1,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 2,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Permission behavior: member may address administration only
- Final state: after send
- Screenshots: COM-01_inbox.png, COM-02_compose.png, COM-03_after_send.png
- Console errors: []
- Page errors: []
- Failed requests: []

## COM-02 — Member reply in own thread

- Status: completed
- Action: "member replies in own thread"
- Visible response:
```json
{
  "status": 200,
  "body": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, alice_member\n1\nMy Portfolio\nAdministrative Thread\nOfficial Administration\n\n Secure Professional Channel\n\nThread #baa13974\n Back\nMember: alice_member\n\nDiscovery synthetic inquiry\n\n End-to-end professional encryption\n Archive Thread",
  "fields": [
    "filled:[name=\"reply_content\"]",
    "clicked:button[type=\"submit\"]"
  ]
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 2,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 3,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Permission behavior: participant only
- Final state: after member reply
- Screenshots: COM-04_thread_view.png, COM-05_after_reply.png
- Console errors: []
- Page errors: []
- Failed requests: []

## COM-03 — Admin reply to member thread

- Status: completed
- Action: "admin replies to member thread"
- Visible response:
```json
{
  "status": 200,
  "body": "Codexx Academy\nOverview\nSYSTEM ADMIN\nUser Directory\nChannels\nCOMMUNICATIONS\nInbox\nInternal messages\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, siteadmin\n1\nLive Site\nReply sent successfully.\nAdministrative Thread\nOfficial Administration\n\n Secure Professional Channel\n\nThread #f9b14b83\n Back\nMember: alice_member\n\nSynthetic member reply\n\nAdministration\n\nSynthetic admin reply\n\n2026-11-19 23:35:06\n End-to-end professional encryption\n Archive Thread",
  "fields": [
    "filled:[name=\"reply_content\"]",
    "clicked:button[type=\"submit\"]"
  ]
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 3,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Permission behavior: admin override
- Final state: after admin reply
- Screenshots: COM-06_admin_thread.png
- Console errors: []
- Page errors: []
- Failed requests: []

## COM-04 — Non-participant thread access

- Status: completed
- Action: "bob opens another member's thread (30edad4a-5837-4c89-923e-469f1939d627)"
- Visible response:
```json
{
  "status": 200,
  "body": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, bob_member\nMy Portfolio\nAccess denied.\nInternal Communications\nInternal Chat\n Contact Admin\n0 Messages\nMember\tLast Message\tDate\tActions\n\nNo Internal Messages\n\nStart a conversation with another academy member."
}
```
- Persistence effect: no captured change
- Permission behavior: non-participant access attempt
- Final state: after unauthorized attempt
- Screenshots: COM-07_unauthorized.png
- Console errors: []
- Page errors: []
- Failed requests: []

## COM-05 — Archive link hard-delete behavior

- Status: completed
- Action: "open internal thread baa13974-13db-4b43-b479-21c952302049 and click Archive Thread"
- Visible response:
```json
{
  "viewStatus": 200,
  "click": "clicked_text:Archive Thread",
  "flashes": [
    "Message deleted successfully"
  ],
  "body": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, alice_member\n2\nMy Portfolio\nMessage deleted successfully\nMessages\n All Messages\nAll\nPortfolio\nInternal\n \nAll Priority\n🔴 High\n🟡 Normal\n🟢 Low\n 2 Messages\nStatus\tType / Area\tName\tEmail\tMessage Preview\tDate\tActions\n Action Required\n 🟡 Normal\t\n PORTFOLIO DIRECT\nGeneral\n\t\nDiscovery Visitor\n\tvis"
}
```
- Persistence effect: no captured change
- Permission behavior: archive policy probe
- Final state: after archive click
- Issues:
```json
[
  "thread still present: true",
  "orphaned replies: 1"
]
```
- Screenshots: COM-08_before_archive.png, COM-09_after_archive.png
- Console errors: []
- Page errors: []
- Failed requests: []

## NOT-01 — Notification polling

- Status: completed
- Action: "wait for notification poll on dashboard"
- Visible response:
```json
{
  "badges": [
    "2"
  ]
}
```
- Persistence effect: no captured change
- Final state: dashboard poll
- Console errors: []
- Page errors: []
- Failed requests: []

## PF-01 — Portfolio profile editing

- Status: completed
- Action: "edit general/about/skills"
- Visible response:
```json
{
  "general": [
    "filled:input[name=\"name\"]",
    "filled:input[name=\"title\"]",
    "filled:textarea[name=\"description\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "about": [
    "filled:[name=\"about\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "skills": [
    "filled:[name=\"skill_name[]\"]",
    "filled:[name=\"skill_level[]\"]",
    "clicked:button[type=\"submit\"]"
  ]
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Python",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Final state: after profile edits
- Screenshots: PF-01_general.png, PF-02_after_edit.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PF-02 — Project lifecycle (create/list)

- Status: completed
- Action: "add project"
- Visible response:
```json
{
  "fields": [
    "filled:[name=\"title\"]",
    "filled:[name=\"short_description\"]",
    "filled:[name=\"content\"]",
    "filled:[name=\"technologies[]\"]",
    "filled:[name=\"demo_url\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "body": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, alice_member\n2\nMy Portfolio\nProject added successfully\nPortfolio Gallery\nPortfolio Showcase\n\nElevate your professional presence with verified proof-of-work\n\nCurate Project\nVISUAL ASSET\tINTELLIGENCE DETAILS\tCORE STACK\tOPERATIONS\n\n\t\nSynthetic Project\n\nDisposable project record for live testing.\n\n\t\nPython\n\t\n \n\n\n\t\nDiscovery Project\n\nSynthetic short description\n\n\t\nPython\n\t\n "
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project",
      "Discovery Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Final state: after project add
- Screenshots: PF-03_add_project.png, PF-04_projects_list.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PF-03 — Public profile reflects edits

- Status: completed
- Action: "view public profile after edits"
- Visible response:
```json
{
  "status": 200,
  "body": "Loading...\n\nCODEXX ACADEMY\nHome\nAbout\nSkills\nProjects\nContact\nDiscovery Title\n\nSynthetic description\n\nStart a Conversation\nView Portfolio\nProfessional Path\n\nThe foundation of trust and reliability\n\nAlice Discovery\n\nSynthetic about updated\n\nProfessional: Alice Discovery\nFocus Area: Discovery Title\nBase: Test City\nDirect: alice_member@example.test\nResponse:\nProof: 2 Case Studies\nView Professional Credentials\nCore Competencies\n\nMatching technical capability with your project needs\n\nPlaywright\n91%\nResearch\n70%\nCase Studies & Evidence\n\nReal-world implementation of skills and strategy\n\n View Details\nSynthetic Project\n\nDisposable project record for live testing.\n\nPython\n View Details \nDiscovery Project\n\nSynthetic short description\n\nPython\n Explore the Codexx Academy Community\nInitiate Cooperation\n\nA direct channel for professional inquiries and project discussions\n\nFull Name *\nEmail Address *\nRequest Type *\nSelect request type\nLooking for a service\nLooking for a partnership\nConsultation / Question\nJob Offer\nSomething else\nArea of Interest *\nSelect interest area\nDevelopment\nDesign\nFix / Optimization\nConsulting\nNew Project\nSeriousness Level\nJust an inquiry\nLooking to execute soon\nLooking to execute later\nPreferred Contact\nEmail\nWhatsApp\nPhone Call\nCompany / Project Name\nYour Message *\n 0/500 characters (minimum 10)\n Send Professional Inquiry\n\n We respect your privacy. Your information w"
}
```
- Persistence effect: no captured change
- Final state: public profile
- Screenshots: PF-05_public_after_edits.png
- Console errors: []
- Page errors: []
- Failed requests: []

## PF-04 — Silver-grey theme selection

- Status: completed
- Action: "select silver-grey theme and view public profile"
- Visible response:
```json
{
  "status": 200,
  "radio": "selected_radio:silver-grey",
  "submitResult": "clicked:button[type=\"submit\"]",
  "publicStatus": 200,
  "before": "luxury-gold",
  "after": "silver-grey"
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project",
      "Discovery Project"
    ],
    "alice_clients": 0,
    "alice_theme": "luxury-gold",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project",
      "Discovery Project"
    ],
    "alice_clients": 0,
    "alice_theme": "silver-grey",
    "carol_projects": [
      "Synthetic Project"
    ]
  }
}
```
- Final state: public profile after theme change
- Issues:
```json
[
  "theme persisted: true"
]
```
- Screenshots: PF-06_silver_theme.png, PF-07_public_silver_theme.png
- Console errors: []
- Page errors: []
- Failed requests: []

## ADM-01 — Admin user management

- Status: completed
- Action: "admin user directory"
- Visible response:
```json
{
  "status": 200,
  "body": "Codexx Academy\nOverview\nSYSTEM ADMIN\nUser Directory\nChannels\nCOMMUNICATIONS\nInbox\nInternal messages\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, siteadmin\n1\nLive Site\nManage Users\nPlatform Governance\n\nCommand and control of system access and professional identities\n\nProvision Account\nIDENTITY PROFILE\tPRIVILEGE LEVEL\tVALIDATION\tREGISTRATION\tOPERATIONS\n\nalice_member\nalice_member@example.test\n\tPROFESSIONAL\t VERIFIED\t2026-01-01\t\n \n \n \n\n\nbob_member\nbob_member@example.test\n\tPROFESSIONAL\t VERIFIED\t2026-01-01\t\n \n \n \n\n\ncarol_demo\ncarol_demo@example.test\n\tPROFESSIONAL\t DEMO_MODE\t2026-01-01\t\n \n \n "
}
```
- Persistence effect: no captured change
- Permission behavior: admin only
- Final state: users
- Screenshots: ADM-01_users.png
- Console errors: []
- Page errors: []
- Failed requests: []

## ADM-02 — Demo-mode project creation

- Status: completed
- Action: "demo account submits project add"
- Visible response:
```json
{
  "status": 200,
  "fields": [
    "filled:[name=\"title\"]",
    "filled:[name=\"short_description\"]",
    "filled:[name=\"content\"]",
    "clicked:button[type=\"submit\"]"
  ],
  "flashes": [
    "Training Phase Active\n\nComplete all sections in your Professional Path to qualify for verification and full platform access.",
    "Project added successfully"
  ],
  "body": "Codexx Academy\nOverview\nPROFESSIONAL PATH\nIdentity\nProposition\nCompetencies\nGallery\nContact Info\nOPERATIONS\nCRM\nInbox\nInternal messages\nChannels\nPREFERENCE\nGlobal Settings\nAccess Standards\nSign Out\nWelcome, carol_demo\nMy Portfolio\nTraining Phase Active\n\nComplete all sections in your Professional Path to qualify for verification and full platform access.\n\nProject added successfully\nPortfolio Gallery\nPortfolio Showcase\n\nElevate your professional presence with verified proof-of-work\n\nCurate Project"
}
```
- Persistence effect:
```json
{
  "db_before": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "db_after": {
    "messages": [
      {
        "id": "30edad4a-5837-4c89-923e-469f1939d627",
        "category": "internal",
        "sender_role": "admin",
        "sender_id": "None",
        "receiver_id": "1",
        "parent_id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 21,
        "created_at": "2026-11-19 23:35:06.205793"
      },
      {
        "id": "f9b14b83-f2c1-4fd4-96ad-0fd214fa421d",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": "baa13974-13db-4b43-b479-21c952302049",
        "is_read": 1,
        "is_internal": 1,
        "msg_len": 22,
        "created_at": "2026-11-19 23:35:02.399944"
      },
      {
        "id": "baa13974-13db-4b43-b479-21c952302049",
        "category": "internal",
        "sender_role": "member",
        "sender_id": "1",
        "receiver_id": "admin",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 1,
        "msg_len": 27,
        "created_at": "2026-11-19 23:34:58.665962"
      },
      {
        "id": "1b47d235-1478-4265-b941-c8e5088b0d2e",
        "category": "portfolio",
        "sender_role": "visitor",
        "sender_id": null,
        "receiver_id": "1",
        "parent_id": null,
        "is_read": 0,
        "is_internal": 0,
        "msg_len": 152,
        "created_at": "2026-11-19 23:34:39.056876"
      }
    ],
    "counts": {
      "messages": 4,
      "users": 0,
      "workspaces": 0
    }
  },
  "json_before": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project",
      "Discovery Project"
    ],
    "alice_clients": 0,
    "alice_theme": "silver-grey",
    "carol_projects": [
      "Synthetic Project"
    ]
  },
  "json_after": {
    "users": [
      {
        "id": 1,
        "username": "alice_member",
        "role": "user"
      },
      {
        "id": 2,
        "username": "bob_member",
        "role": "user"
      },
      {
        "id": 3,
        "username": "carol_demo",
        "role": "user"
      }
    ],
    "portfolios": [
      "admin",
      "alice_member",
      "bob_member",
      "carol_demo"
    ],
    "alice_skills": [
      "Playwright",
      "Research"
    ],
    "alice_projects": [
      "Synthetic Project",
      "Discovery Project"
    ],
    "alice_clients": 0,
    "alice_theme": "silver-grey",
    "carol_projects": [
      "Synthetic Project",
      "Demo Allowed Project"
    ]
  }
}
```
- Permission behavior: dashboard_add_project is in the demo allowlist (app.py:678)
- Final state: after demo project submit
- Issues:
```json
[
  "project persisted in demo portfolio: true"
]
```
- Screenshots: ADM-02_demo_project.png
- Console errors: []
- Page errors: []
- Failed requests: []

## AUTH-06 — Logout and session behavior

- Status: completed
- Action: "logout then open /dashboard"
- Visible response:
```json
{
  "status": 200,
  "body": "Welcome Back\n\nSecure access to your portfolio management system\n\n Please login to access this page.\nUsername\nPassword\nSign In\n\nWelcome to Codexx Academy Portfolio Management"
}
```
- Persistence effect: no captured change
- Permission behavior: session cleared
- Final state: after logout
- Screenshots: AUTH-06_before_logout.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-01 — Landing page full inventory

- Status: completed
- Action: "inventory landing sections, nav, CTAs"
- Visible response:
```json
{
  "status": 200,
  "headings": [
    "Where Real Work Is Shown, Not Sold",
    "What It Is",
    "What It Is NOT",
    "Why It Exists",
    "Verified Portfolio Gallery",
    "What does “Verified” mean?",
    "Portfolio Types",
    "Contact the Academy",
    "CODEXX ACADEMY"
  ],
  "links": [
    {
      "text": "CODEXX ACADEMY",
      "href": "/"
    },
    {
      "text": "Login",
      "href": "/dashboard/login"
    },
    {
      "text": "Explore Verified Portfolios",
      "href": "#directory"
    },
    {
      "text": "Explore Verification Standards",
      "href": "/verification"
    },
    {
      "text": "Verified Gallery",
      "href": "#directory"
    },
    {
      "text": "About Academy",
      "href": "/about"
    },
    {
      "text": "Verification Process",
      "href": "/verification"
    },
    {
      "text": "Mastery Guide",
      "href": "/mastery"
    },
    {
      "text": "Elite Standards",
      "href": "/standards"
    },
    {
      "text": "Security Audit",
      "href": "/security-audit"
    },
    {
      "text": "Privacy Policy",
      "href": "/privacy"
    },
    {
      "text": "Terms of Service",
      "href": "/terms"
    }
  ],
  "buttons": [
    "Login",
    "Explore Verified Portfolios",
    "Explore Verification Standards",
    "Send Message"
  ]
}
```
- Persistence effect: no captured change
- Final state: landing inventory
- Screenshots: RA-01_landing_full.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-02 — Academy informational pages

- Status: completed
- Action: "open all public information pages"
- Visible response:
```json
{
  "pages": [
    {
      "path": "/about",
      "status": 200,
      "title": "About Our Vision | Codexx Academy - Elite Standards",
      "h1": [
        "About Academy"
      ]
    },
    {
      "path": "/verification",
      "status": 200,
      "title": "Verification Standards | Codexx Academy Professional Badge",
      "h1": [
        "Professional Verification Standard"
      ]
    },
    {
      "path": "/standards",
      "status": 200,
      "title": "Elite Professional Standards | Codexx Academy Benchmark",
      "h1": [
        "Elite Standards"
      ]
    },
    {
      "path": "/mastery",
      "status": 200,
      "title": "Codexx Academy | Elite Proof-of-Work Ecosystem",
      "h1": [
        "Mastery Guide"
      ]
    },
    {
      "path": "/privacy",
      "status": 200,
      "title": "Codexx Academy | Elite Proof-of-Work Ecosystem",
      "h1": [
        "Privacy Policy"
      ]
    },
    {
      "path": "/terms",
      "status": 200,
      "title": "Codexx Academy | Elite Proof-of-Work Ecosystem",
      "h1": [
        "Terms of Service"
      ]
    },
    {
      "path": "/security-audit",
      "status": 200,
      "title": "Codexx Academy | Elite Proof-of-Work Ecosystem",
      "h1": [
        "Security Audit"
      ]
    }
  ]
}
```
- Persistence effect: no captured change
- Final state: information pages
- Screenshots: RA-02_about_page.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-03 — Academy contact form submission

- Status: completed
- Action: "locate / test academy contact entry point"
- Visible response:
```json
{
  "page": {
    "status": 405,
    "body": "Method Not Allowed\n\nThe method is not allowed for the requested URL."
  },
  "statusAfter": 200,
  "formFound": "<form action=\"/contact/academy\" method=\"POST\" class=\"glass-panel p-4 shadow-lg border border-secondary rounded-4\">\n                        \n                        <div class=\"mb-3\">\n                            <label class=\"form-label text-white fw-bold\">Your Name</label>\n                            <input type=\"text\" name=\"name\" class=\"form-control bg-dark border-secondary text-white\" required=\"\" placeholder=\"Full Name\">\n                        </div>\n                        <div class=\"mb-3\">\n                            <label class=\"form-label text-white fw-bold\">Your Email</label>\n                            <input type=\"email\" name=\"email\" class=\"form-control bg-dark border-secondary text-white\" required=\"\" placeholder=\"email@example.com\">\n                        </div>\n                        \n                        <div class=\"mb-3\">\n                            <label class=\"for"
}
```
- Persistence effect: no captured change
- Final state: academy contact
- Screenshots: RA-03_landing_academy_form.png
- Console errors: []
- Page errors: ["Failed to load resource: the server responded with a status of 405 (METHOD NOT ALLOWED)"]
- Failed requests: []

## RA-04 — Admin operational screens

- Status: completed
- Action: "open admin settings/integration/backup screens"
- Visible response:
```json
{
  "pages": [
    {
      "path": "/dashboard/settings",
      "status": 200,
      "title": "Settings - Codexx Admin",
      "h1": [
        "Dashboard"
      ]
    },
    {
      "path": "/dashboard/telegram",
      "status": 405,
      "title": "405 Method Not Allowed",
      "h1": [
        "Method Not Allowed"
      ]
    },
    {
      "path": "/dashboard/smtp",
      "status": 405,
      "title": "405 Method Not Allowed",
      "h1": [
        "Method Not Allowed"
      ]
    },
    {
      "path": "/dashboard/backups",
      "status": 200,
      "title": "Settings - Codexx Admin",
      "h1": [
        "Dashboard"
      ]
    },
    {
      "path": "/dashboard/access-instructions",
      "status": 200,
      "title": "Access & Verification Standards - Codexx Admin",
      "h1": [
        "Access & Verification Standards",
        "Academy Standards & Terms",
        "1. Data Accuracy & Integrity"
      ]
    }
  ]
}
```
- Persistence effect: no captured change
- Permission behavior: admin session
- Final state: admin operations
- Screenshots: RA-04_admin_settings.png
- Console errors: []
- Page errors: ["Failed to load resource: the server responded with a status of 405 (METHOD NOT ALLOWED)", "Failed to load resource: the server responded with a status of 405 (METHOD NOT ALLOWED)"]
- Failed requests: []

## RA-05 — Admin announcement & academy control search

- Status: completed
- Action: "search admin UI for announcement/academy controls"
- Visible response:
```json
{
  "nav": [
    {
      "text": "Codexx Academy",
      "href": "/dashboard"
    },
    {
      "text": "Overview",
      "href": "/dashboard"
    },
    {
      "text": "User Directory",
      "href": "/dashboard/users"
    },
    {
      "text": "Channels",
      "href": "/dashboard/social"
    },
    {
      "text": "Inbox",
      "href": "/dashboard/messages?category=all"
    },
    {
      "text": "Internal messages",
      "href": "/dashboard/messages/internal"
    },
    {
      "text": "Global Settings",
      "href": "/dashboard/settings"
    },
    {
      "text": "Access Standards",
      "href": "/dashboard/access-instructions"
    },
    {
      "text": "Sign Out",
      "href": "/dashboard/logout"
    },
    {
      "text": "View All",
      "href": "/dashboard/messages"
    },
    {
      "text": "alice_member\n                                    23:34\n                                \n                                Discovery synthetic inquiry",
      "href": "/dashboard/messages/internal/view/baa13974-13db-4b43-b479-21c952302049"
    },
    {
      "text": "Live Site",
      "href": "/landing"
    },
    {
      "text": "Manage Users",
      "href": "/dashboard/users"
    },
    {
      "text": "System Security",
      "href": "/dashboard/settings"
    },
    {
      "text": "Platform View",
      "href": "/landing"
    },
    {
      "text": "Terminate Session",
      "href": "/dashboard/logout"
    }
  ],
  "found": [
    {
      "word": "announcement",
      "found": false
    },
    {
      "word": "announce",
      "found": false
    },
    {
      "word": "course",
      "found": false
    },
    {
      "word": "lesson",
      "found": false
    },
    {
      "word": "academy content",
      "found": false
    },
    {
      "word": "broadcast",
      "found": false
    }
  ]
}
```
- Persistence effect: no captured change
- Permission behavior: admin session
- Final state: admin UI search
- Screenshots: RA-05_admin_dashboard.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-06 — Member workspace screens

- Status: completed
- Action: "open every member workspace screen"
- Visible response:
```json
{
  "pages": [
    {
      "path": "/dashboard/clients",
      "status": 200,
      "title": "Clients - Dashboard - Codexx Admin",
      "h1": [
        "Clients Management",
        "Strategic Partnerships",
        "0"
      ]
    },
    {
      "path": "/dashboard/contact",
      "status": 200,
      "title": "Contact Information - Dashboard - Codexx Admin",
      "h1": [
        "Contact Information"
      ]
    },
    {
      "path": "/dashboard/social",
      "status": 200,
      "title": "Social Media Links - Dashboard - Codexx Admin",
      "h1": [
        "Social Media Links"
      ]
    },
    {
      "path": "/dashboard/messages",
      "status": 200,
      "title": "Messages - Dashboard - Codexx Admin",
      "h1": [
        "Messages"
      ]
    },
    {
      "path": "/dashboard/settings",
      "status": 200,
      "title": "Settings - Codexx Admin",
      "h1": [
        "Dashboard"
      ]
    },
    {
      "path": "/cv-preview",
      "status": 200,
      "title": "CV Preview - Alice Discovery",
      "h1": []
    }
  ]
}
```
- Persistence effect: no captured change
- Permission behavior: member session
- Final state: member screens
- Screenshots: RA-06_member_clients.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-07 — Public wallet states & direct links

- Status: completed
- Action: "open every public wallet state and inspect SEO metadata"
- Visible response:
```json
{
  "pages": [
    {
      "path": "/portfolio/alice_member",
      "status": 200,
      "h1": []
    },
    {
      "path": "/portfolio/bob_member",
      "status": 200,
      "h1": []
    },
    {
      "path": "/portfolio/carol_demo",
      "status": 200,
      "h1": []
    },
    {
      "path": "/portfolio/admin",
      "status": 200,
      "h1": [
        "Where Real Work Is Shown, Not Sold"
      ]
    },
    {
      "path": "/portfolio/nonexistent_user",
      "status": 404,
      "h1": [
        "404"
      ]
    }
  ],
  "seo": {
    "description": null,
    "robots": null,
    "ogTitle": null,
    "ogUrl": null,
    "canonical": null,
    "htmlLang": "en",
    "dir": ""
  }
}
```
- Persistence effect: no captured change
- Final state: public wallet states
- Screenshots: RA-07_public_bob_theme.png
- Console errors: []
- Page errors: ["Failed to load resource: the server responded with a status of 404 (NOT FOUND)"]
- Failed requests: []

## RA-08 — Public project detail direct link

- Status: completed
- Action: "GET project detail direct link"
- Visible response:
```json
{
  "status": 200,
  "title": "Synthetic Project - Alice Discovery Portfolio",
  "h1": [
    "Synthetic Project"
  ],
  "body": "Codexx Academy\nELITE PORTFOLIO\nBack to Portfolio\nBack to Case Studies\nSynthetic Project\nVerified Case Study\nDisposable project record for live testing.\nProject Intelligence\nCORE OBJECTIVE\n\nDisposable project record for live testing.\n\nTECHNOLOGY STACK\nPython\nDiscuss Project\nOTHER EVIDENCE\nDiscovery Project\n\n© 2026 Codexx Academy. Built for Builders."
}
```
- Persistence effect: no captured change
- Final state: project detail
- Screenshots: RA-08_project_detail.png
- Console errors: []
- Page errors: ["TypeError: Cannot read properties of null (reading 'addEventListener')\n    at HTMLDocument.<anonymous> (http://127.0.0.1:5002/static/js/script.js:25:17)"]
- Failed requests: []

## RA-09 — Mobile layout inspection

- Status: completed
- Action: "inspect mobile layout of landing and public wallet"
- Visible response:
```json
{
  "landing": 200,
  "profile": 200,
  "overflow": {
    "scrollW": 446,
    "clientW": 390
  }
}
```
- Persistence effect: no captured change
- Final state: mobile layout
- Issues:
```json
[
  "horizontal overflow on mobile"
]
```
- Screenshots: RA-09_mobile_landing.png, RA-10_mobile_profile.png
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-10 — Unauthenticated notification endpoint

- Status: completed
- Action: "fetch notification poll while logged out"
- Visible response:
```json
{
  "result": {
    "status": 200,
    "body": "[]\n"
  }
}
```
- Persistence effect: no captured change
- Permission behavior: unauthenticated request
- Final state: notification endpoint
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-11 — Notification test endpoints under blocked outbound

- Status: completed
- Action: "invoke test endpoints with outbound blocked"
- Visible response:
```json
{
  "emailPost": {
    "status": 200
  },
  "tgPost": {
    "status": 200
  },
  "pageErrs": []
}
```
- Persistence effect: no captured change
- Final state: after test endpoints
- Issues:
```json
[
  "test endpoints attempted external delivery; blocked by isolated runtime; no external send occurred"
]
```
- Console errors: []
- Page errors: []
- Failed requests: []

## RA-12 — Sitemap and robots direct links

- Status: completed
- Action: "open sitemap and robots"
- Visible response:
```json
{
  "sm": 200,
  "smBody": "This XML file does not appear to have any style information associated with it. The document tree is shown below.\n\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\">\n<url>\n<loc>http://127.0.0.1:5002/</loc>\n<lastmod>2026-11-20</lastmod>\n<changefreq>weekly</changefreq>\n<priority>1.0</priority>\n</url>\n</urlset>",
  "rb": 200,
  "rbBody": "User-agent: *\nAllow: /\nAllow: /project/\nAllow: /cv-preview\nAllow: /sitemap.xml\nDisallow: /dashboard/\nDisallow: /static/\nDisallow: /*.json$\n\nSitemap: http://127.0.0.1:5002/sitemap.xml\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /"
}
```
- Persistence effect: no captured change
- Final state: SEO routes
- Screenshots: RA-11_sitemap.png
- Console errors: []
- Page errors: []
- Failed requests: []
