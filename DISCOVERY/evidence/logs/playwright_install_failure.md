# Playwright installation failure — 2026-11-19

## Command attempted

```powershell
$ws='C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace'
py -3.11 -m venv "$ws\pw-venv"
& "$ws\pw-venv\Scripts\python" -m pip install --disable-pip-version-check playwright *> "$ws\playwright-install.log"
& "$ws\pw-venv\Scripts\python" -m playwright install chromium *> "$ws\playwright-browser-install.log"
```

## Result

- `PLAYWRIGHT_PIP_EXIT:2`
- `CHROMIUM_INSTALL_EXIT:1`
- Observed wheel: `playwright-1.65.2-py3-none-win_amd64.whl` (42.7 MB)
- Failure during wheel download:
  `pip._vendor.urllib3.exceptions.SSLError: [SSL: DECRYPTION_FAILED_OR_BAD_RECORD_MAC] decryption failed or bad record mac (_ssl.c:2580)`
- Because the package was not installed, `python -m playwright install chromium` failed with:
  `No module named playwright`

## Diagnosis

**VERIFIED FACT:** The failure occurred during HTTPS transfer of the Playwright wheel, before installation completed. It is a transport/SSL integrity error, not a dependency conflict with the application. No application manifest was modified.

**INFERENCE:** Likely causes include a transient network/TLS corruption or proxy/intermediate transport issue. The same failure would be expected for any large wheel from that source while the condition persists.

## Bounded workaround authorized by discovery rules

Documented here before retrying. Retry once with:
- explicit pinned version `playwright==1.65.2`;
- `--no-cache-dir` to avoid any partially cached artifact;
- `--retries 10 --timeout 120` for transient network recovery.

If the retry fails, use a separate Node-based Playwright tooling install or the installed system Chrome as fallback, without modifying application dependencies. If no safe browser tooling can be installed, live browser tests will be recorded as BLOCKED and discovery will proceed with static/persistence evidence only.

## Safety

No application source, dependency manifest, database, or production data was changed. Only the isolated `pw-venv` was affected.
