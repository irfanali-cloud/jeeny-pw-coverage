# Payments & Wallets Test Coverage

Self-contained test coverage management dashboard for the Jeeny Payments & Wallets module.

## Files

| File | Description |
|---|---|
| `presentation.html` | Main dashboard — open directly in any browser |
| `index.html` | Redirect to presentation.html |
| `all-cases-data.json` | All 761 transformed test cases |
| `smoke-cases.json` | 9 smoke test cases |
| `regression-cases.json` | 142 regression test cases |
| `tier-0-cases.json` | 5 Tier 0 cases |
| `tier-1-cases.json` | 127 Tier 1 cases |
| `tier-2-cases.json` | 24 Tier 2 cases |
| `tier-3-cases.json` | 605 Tier 3 cases |
| `fetch.js` | Fetch fresh data from TestRail |
| `build.js` | Regenerate presentation.html from all-cases-data.json |

## Usage

Open `presentation.html` in a browser — no server needed.

### Refresh data from TestRail
```
node fetch.js
node build.js
```

### Keyboard shortcuts
- `/` — focus search bar
- `F11` — fullscreen
- `Ctrl+P` — print

## Coverage Summary

| Metric | Count | % of Total |
|---|---|---|
| Total Cases | 761 | 100% |
| Smoke | 9 | 1.2% |
| Regression | 142 | 18.7% |
| Tier 0 | 5 | 0.7% |
| Tier 1 | 127 | 16.7% |
| Tier 2 | 24 | 3.2% |
| Tier 3 | 605 | 79.5% |

## Modules

Card Management · Apple Pay · Wallet · Credit Card Rides · Cash Rides · Tabby · STCPay · FDM · Mokafaa · Driver Top-Up · Promotions & Restrictions · Payment Observability

## TestRail Connection

- URL: https://jeeny1.testrail.io
- Project ID: 1
- Root Section: Payments & Wallets (ID: 895)
