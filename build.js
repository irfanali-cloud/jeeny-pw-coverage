/**
 * build.js — Reads all-cases-data.json and generates presentation.html
 * Usage: node build.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const passengerCases = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'all-cases-data.json'), 'utf8'))
  .map(function(c){ return Object.assign({}, c, { app: 'Passenger App' }); });
const driverCases = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'driver-payments-cases.json'), 'utf8'));
const cases = passengerCases.concat(driverCases);

const MODULE_META = {
  "Card Management": {
    emoji: "💳",
    desc: "Covers adding, validating, and deleting credit/debit cards via HyperPay and Checkout gateways, including 3DS flows, token management, and gateway migration.",
    tags: ["Visa","Mastercard","Mada","3DS","Tokenization","Duplicate Card","Gateway Migration","HyperPay","Checkout"]
  },
  "Credit Card Rides": {
    emoji: "🔄",
    desc: "End-to-end credit card ride flows including pre-authorization, capture, wallet splits, promo combinations, FDM review, excessive capture, and SQS queue improvements.",
    tags: ["Pre-Auth","Capture","Void","Wallet Split","Promo","FDM","Excessive Capture","Mada","SQS"]
  },
  "Apple Pay": {
    emoji: "🍎",
    desc: "Apple Pay ride flows across HyperPay and Checkout gateways, including wallet-split scenarios, MADA card handling, skip-destination rides, and excessive capture logic.",
    tags: ["Visa","Mastercard","Mada","Wallet Split","Promo","Skip Destination","Excessive Capture","Checkout","HyperPay","Cancellation Fine"]
  },
  "Cash Rides": {
    emoji: "💵",
    desc: "Cash-based ride scenarios including wallet-enabled splits, promo combinations, and driver greater-fare collection edge cases.",
    tags: ["Wallet Split","Promo","Greater Fare","Cash Block","Outstanding Balance"]
  },
  "Wallet": {
    emoji: "💰",
    desc: "Passenger wallet lifecycle including top-ups via card and Apple Pay, auto-enable behavior, cashback display, transaction history, and cancellation fine integration.",
    tags: ["Top-Up","Auto Enable","Cashback","Transaction History","Cancellation Fine","Currency Conversion","Negative Balance"]
  },
  "Tabby": {
    emoji: "🏪",
    desc: "Tabby BNPL ride flows including new user registration (1 SAR hold), wallet-enabled rides, promo combinations, and ride re-offer scenarios.",
    tags: ["Registration","1 SAR Hold","Wallet Split","Promo","Ride Re-offer"]
  },
  "STCPay": {
    emoji: "📱",
    desc: "STC Pay cashout and payment scenarios for KSA users, covering success and failure paths.",
    tags: ["Cashout","Success","Failure"]
  },
  "FDM": {
    emoji: "🛡️",
    desc: "Fraud Detection Module ride flows including agent review, pass/cancel outcomes, time-lapse auto-pass, and digital payment detection.",
    tags: ["Detection","Agent Review","Auto-Pass","Hard Decline"]
  },
  "Mokafaa": {
    emoji: "🎁",
    desc: "Mokafaa loyalty integration covering both Burn (wallet top-up via points redemption) and Earn (points credited after rides) flows.",
    tags: ["Burn","Earn","OTP","Points Balance","Wallet Credit","Ride History"]
  },
  "Driver Top-Up": {
    emoji: "🚗",
    desc: "Driver wallet credit top-up flows via credit card and Apple Pay, including overpayment crediting from cash rides.",
    tags: ["CC Top-Up","Apple Pay Top-Up","Cash Overpayment"]
  },
  "Promotions & Restrictions": {
    emoji: "🏷️",
    desc: "Voucher code application and the cash ride restriction flow that blocks passengers with outstanding negative wallet balances.",
    tags: ["Voucher","100% Discount","Cash Block","Outstanding Balance","Threshold"]
  },
  "Payment Observability": {
    emoji: "📊",
    desc: "Gateway transaction tagging, refund ratio monitoring, Slack alert triggers, and payment failure tracking across HyperPay and Checkout.",
    tags: ["Gateway Tagging","RF Monitoring","Slack Alert","Refund Ratio"]
  },
  "Driver Wallet": {
    emoji: "👛",
    desc: "Driver wallet lifecycle including balance top-ups, transaction history, ride earnings crediting, and overpayment handling.",
    tags: ["Balance","Top-Up","Earnings","Transaction History","Overpayment"]
  },
  "Driver STC Pay": {
    emoji: "📲",
    desc: "STC Pay payout flows for drivers covering cashout withdrawals, Jeeny service fees on STC Pay withdrawals, and wallet top-ups via STC Pay. Synced with Passenger App STCPay cashout scenarios.",
    tags: ["Cashout","Payout","Service Fee","Top-Up","Withdrawal"]
  },
  "Driver Card Management": {
    emoji: "🪪",
    desc: "Driver card management including adding, verifying, and removing payment cards for wallet top-ups via HyperPay and Checkout gateways.",
    tags: ["Add Card","Verify","Remove","HyperPay","Checkout","Mada","3DS"]
  },
  "Driver Cancellation & Fraud": {
    emoji: "🚫",
    desc: "Driver-side cancellation fines, fraud detection flows, and dispute handling for payment anomalies and suspicious transactions.",
    tags: ["Cancellation Fine","Fraud","Dispute","FDM","Block","Detection"]
  }
};

const CASES_JSON = JSON.stringify(cases);
const META_JSON = JSON.stringify(MODULE_META);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payments &amp; Wallets Test Coverage — Jeeny QA</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f1f5f9;color:#1e293b;display:flex;height:100vh;overflow:hidden}
/* Sidebar */
#sidebar{width:240px;min-width:240px;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;overflow-y:auto;z-index:10}
#sidebar-header{padding:16px;border-bottom:1px solid #e5e7eb;background:#1d4ed8}
#sidebar-header h1{color:#fff;font-size:13px;font-weight:700;line-height:1.3}
#sidebar-header p{color:#bfdbfe;font-size:11px;margin-top:2px}
.nav-section{padding:8px 0}
.nav-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;padding:6px 16px 2px}
.nav-item{display:flex;align-items:center;justify-content:space-between;padding:7px 16px;cursor:pointer;font-size:13px;color:#475569;border-left:3px solid transparent;transition:all .15s}
.nav-item:hover{background:#f8fafc;color:#1d4ed8}
.nav-item.active{background:#eff6ff;color:#1d4ed8;border-left-color:#1d4ed8;font-weight:600}
.nav-badge{background:#e2e8f0;color:#64748b;font-size:10px;font-weight:600;padding:1px 6px;border-radius:10px;min-width:20px;text-align:center}
.nav-item.active .nav-badge{background:#dbeafe;color:#1d4ed8}
/* Main */
#main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
.page{display:none;flex:1;flex-direction:column}
.page.active{display:flex}
/* Top bar */
.topbar{padding:16px 24px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:12px;flex-shrink:0}
.topbar h2{font-size:18px;font-weight:700;color:#1e293b}
.topbar .sub{font-size:13px;color:#64748b;margin-top:1px}
.topbar-right{margin-left:auto;display:flex;gap:8px;align-items:center}
/* Content */
.content{padding:24px;flex:1}
/* Stat cards */
.stat-row{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;flex:1;min-width:110px}
.stat-card .label{font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.stat-card .value{font-size:28px;font-weight:800;color:#1e293b}
.stat-card .value.blue{color:#1d4ed8}
.stat-card .value.green{color:#059669}
.stat-card .value.orange{color:#d97706}
.stat-card .value.purple{color:#7c3aed}
.stat-card .value.red{color:#dc2626}
/* Module grid */
.module-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:24px}
.module-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;cursor:pointer;transition:box-shadow .2s,border-color .2s}
.module-card:hover{box-shadow:0 4px 16px rgba(29,78,216,.1);border-color:#93c5fd}
.module-card .mc-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.module-card .mc-emoji{font-size:22px}
.module-card .mc-name{font-size:15px;font-weight:700;color:#1e293b}
.module-card .mc-desc{font-size:12px;color:#64748b;line-height:1.5;margin-bottom:10px}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px}
.tag{background:#f1f5f9;color:#475569;font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;border:1px solid #e2e8f0}
.mc-stats{display:flex;gap:12px;font-size:12px;color:#64748b;margin-bottom:10px}
.mc-stats span{display:flex;align-items:center;gap:3px}
.mc-stats strong{color:#1e293b}
/* Tier bar */
.tier-bar{display:flex;gap:3px;align-items:center}
.tier-seg{height:6px;border-radius:3px;flex:1}
.t0{background:#dc2626}.t1{background:#f59e0b}.t2{background:#3b82f6}.t3{background:#d1d5db}
.tier-legend{display:flex;gap:8px;font-size:10px;color:#64748b;margin-top:4px}
.tier-legend span{display:flex;align-items:center;gap:3px}
.tl-dot{width:8px;height:8px;border-radius:2px}
/* Badges */
.badge{display:inline-flex;align-items:center;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;letter-spacing:.03em}
.badge-tier0{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5}
.badge-tier1{background:#fffbeb;color:#d97706;border:1px solid #fcd34d}
.badge-tier2{background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd}
.badge-tier3{background:#f8fafc;color:#64748b;border:1px solid #e2e8f0}
.badge-smoke{background:#ecfdf5;color:#059669;border:1px solid #6ee7b7}
.badge-regression{background:#faf5ff;color:#7c3aed;border:1px solid #c4b5fd}
.badge-critical{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5}
.badge-high{background:#fff7ed;color:#ea580c;border:1px solid #fdba74}
.badge-medium{background:#fefce8;color:#ca8a04;border:1px solid #fde68a}
.badge-low{background:#f0fdf4;color:#16a34a;border:1px solid #86efac}
/* Search/filter bar */
.filter-bar{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.search-input{border:1px solid #e5e7eb;border-radius:8px;padding:7px 12px;font-size:13px;color:#1e293b;width:260px;outline:none;font-family:inherit}
.search-input:focus{border-color:#1d4ed8;box-shadow:0 0 0 3px rgba(29,78,216,.1)}
select.filter-select{border:1px solid #e5e7eb;border-radius:8px;padding:7px 12px;font-size:13px;color:#1e293b;outline:none;font-family:inherit;cursor:pointer;background:#fff}
select.filter-select:focus{border-color:#1d4ed8}
/* Case groups */
.group-header{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;padding:12px 0 6px;border-bottom:1px solid #f1f5f9;margin-bottom:4px}
.section-header{font-size:13px;font-weight:600;color:#475569;padding:8px 0 4px;margin-top:8px}
.case-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1px solid #f1f5f9;border-left:3px solid #1d4ed8;border-radius:0 6px 6px 0;margin-bottom:4px;font-size:12px}
.case-id{color:#1d4ed8;font-weight:700;font-size:11px;min-width:54px;font-family:monospace}
.case-title{flex:1;color:#1e293b;line-height:1.4}
.case-badges{display:flex;gap:4px;flex-shrink:0}
/* Table */
.data-table{width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb}
.data-table th{background:#f8fafc;font-weight:700;color:#475569;padding:10px 12px;text-align:left;border-bottom:1px solid #e5e7eb;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
.data-table td{padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#374151;vertical-align:top}
.data-table tr:last-child td{border-bottom:none}
.data-table tr:hover td{background:#f8fafc}
/* Analysis */
.analysis-section{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px}
.analysis-section h3{font-size:15px;font-weight:700;color:#1e293b;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.analysis-section h3::before{content:'';display:inline-block;width:4px;height:18px;background:#1d4ed8;border-radius:2px}
.finding{display:flex;gap:10px;padding:8px 12px;border-radius:6px;margin-bottom:8px;font-size:13px;line-height:1.5}
.finding.critical{background:#fef2f2;border-left:3px solid #dc2626}
.finding.warning{background:#fffbeb;border-left:3px solid #f59e0b}
.finding.info{background:#eff6ff;border-left:3px solid #3b82f6}
.finding.success{background:#f0fdf4;border-left:3px solid #22c55e}
.finding-icon{font-size:15px;flex-shrink:0;margin-top:1px}
.rec-table{width:100%;border-collapse:collapse;font-size:13px}
.rec-table th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb}
.rec-table td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
.rec-table tr:last-child td{border-bottom:none}
.delta-pos{color:#059669;font-weight:700}
.delta-neg{color:#dc2626;font-weight:700}
/* Coverage diagram */
#diagram-container{flex:1;overflow-y:auto}
.tree{font-size:13px;line-height:1.6}
.tree-node{margin:0}
.tree-toggle{cursor:pointer;user-select:none;display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;transition:background .15s}
.tree-toggle:hover{background:#f1f5f9}
.tree-arrow{font-size:10px;color:#94a3b8;transition:transform .2s;width:14px;text-align:center;flex-shrink:0}
.tree-arrow.open{transform:rotate(90deg)}
.tree-children{padding-left:20px;border-left:1px dashed #e5e7eb;margin-left:8px}
.tree-children.hidden{display:none}
.tree-root .tree-toggle{font-weight:800;font-size:15px;color:#1d4ed8}
.tree-module .tree-toggle{font-weight:700;font-size:14px;color:#1e293b}
.tree-section .tree-toggle{font-weight:600;font-size:13px;color:#374151}
.tree-case{padding:3px 8px;display:flex;align-items:center;gap:6px;font-size:11px;color:#64748b}
.tree-case .case-id{font-family:monospace;color:#1d4ed8;font-weight:700;font-size:11px;min-width:58px}
.tree-case .case-title{flex:1}
.tree-count{font-size:10px;color:#94a3b8;margin-left:4px}
/* Edit panel */
#edit-panel{position:fixed;right:0;top:0;height:100%;width:300px;background:#fff;border-left:1px solid #e5e7eb;padding:20px;transform:translateX(100%);transition:transform .3s;z-index:100;display:flex;flex-direction:column;gap:12px}
#edit-panel.open{transform:translateX(0)}
#edit-panel h3{font-size:14px;font-weight:700;color:#1e293b}
#edit-panel input[type=text]{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:7px 10px;font-size:13px;font-family:inherit}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;font-family:inherit}
.btn-primary{background:#1d4ed8;color:#fff}.btn-primary:hover{background:#1e40af}
.btn-secondary{background:#f1f5f9;color:#475569;border:1px solid #e5e7eb}.btn-secondary:hover{background:#e2e8f0}
.btn-danger{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5}.btn-danger:hover{background:#fee2e2}
.btn-sm{padding:4px 10px;font-size:11px}
/* Toast */
#toast{position:fixed;bottom:24px;right:24px;background:#059669;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;opacity:0;transition:opacity .3s;z-index:200;pointer-events:none}
#toast.show{opacity:1}
/* Module detail */
.detail-desc{font-size:14px;color:#475569;line-height:1.6;margin-bottom:16px}
.detail-stats{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.detail-stat{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:10px 16px;text-align:center;min-width:80px}
.detail-stat .ds-val{font-size:22px;font-weight:800;color:#1d4ed8}
.detail-stat .ds-lbl{font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase}
/* Summary bar for tier pages */
.summary-bar{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;display:flex;gap:20px;margin-bottom:20px;font-size:13px;flex-wrap:wrap}
.summary-bar .sb-item{display:flex;flex-direction:column;gap:2px}
.summary-bar .sb-val{font-weight:700;font-size:16px;color:#1e293b}
.summary-bar .sb-lbl{font-size:11px;color:#64748b}
/* footer */
#footer{background:#fff;border-top:1px solid #e5e7eb;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center;flex-shrink:0}
/* Scrollbar */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#9ca3af}
/* No results */
.no-results{padding:32px;text-align:center;color:#94a3b8;font-size:14px}
</style>
</head>
<body>

<!-- SIDEBAR -->
<nav id="sidebar">
  <div id="sidebar-header">
    <h1>💳 Payments &amp; Wallets</h1>
    <p>Test Coverage Dashboard</p>
  </div>
  <div class="nav-section">
    <div class="nav-label">Views</div>
    <div class="nav-item active" onclick="showPage('overview')">📊 Overview</div>
    <div class="nav-item" onclick="showPage('diagram')">🗂️ Coverage Diagram</div>
    <div class="nav-item" onclick="showPage('smoke')">🔥 Smoke Suite <span class="nav-badge" id="nb-smoke">9</span></div>
    <div class="nav-item" onclick="showPage('regression')">🔁 Regression Suite <span class="nav-badge" id="nb-regression">142</span></div>
    <div class="nav-item" onclick="showPage('tier0')">🔴 Tier 0 <span class="nav-badge" id="nb-t0">5</span></div>
    <div class="nav-item" onclick="showPage('tier1')">🟡 Tier 1 <span class="nav-badge" id="nb-t1">127</span></div>
    <div class="nav-item" onclick="showPage('tier2')">🔵 Tier 2 <span class="nav-badge" id="nb-t2">24</span></div>
    <div class="nav-item" onclick="showPage('tier3')">⚪ Tier 3 <span class="nav-badge" id="nb-t3">605</span></div>
  </div>
  <div class="nav-section">
    <div class="nav-label">Passenger App</div>
    <div id="module-nav"></div>
  </div>
  <div class="nav-section">
    <div class="nav-label">Driver App</div>
    <div id="driver-module-nav"></div>
  </div>
</nav>

<!-- MAIN -->
<div id="main">

  <!-- OVERVIEW PAGE -->
  <div class="page active" id="page-overview">
    <div class="topbar">
      <div>
        <div class="topbar h2" style="font-size:18px;font-weight:700">Payments &amp; Wallets — Test Coverage Overview</div>
        <div class="sub">Jeeny QA · Passenger App + Driver App</div>
      </div>
    </div>
    <div class="content" id="overview-content"></div>
  </div>

  <!-- DIAGRAM PAGE -->
  <div class="page" id="page-diagram">
    <div class="topbar">
      <div>
        <div style="font-size:18px;font-weight:700">Coverage Diagram</div>
        <div class="sub">Expandable case tree — click to expand/collapse</div>
      </div>
      <div class="topbar-right">
        <button class="btn btn-secondary btn-sm" onclick="toggleEditPanel()">✏️ Edit Mode</button>
        <button class="btn btn-secondary btn-sm" onclick="expandAll()">Expand All</button>
        <button class="btn btn-secondary btn-sm" onclick="collapseAll()">Collapse All</button>
      </div>
    </div>
    <div class="content" id="diagram-content" style="padding:0 24px 24px"></div>
  </div>

  <!-- SMOKE PAGE -->
  <div class="page" id="page-smoke">
    <div class="topbar">
      <div>
        <div style="font-size:18px;font-weight:700">Smoke Suite</div>
        <div class="sub" id="smoke-subtitle"></div>
      </div>
    </div>
    <div class="content">
      <div class="filter-bar">
        <input type="text" class="search-input" id="smoke-search" placeholder="🔍 Search cases..." oninput="renderSuite('smoke')">
        <select class="filter-select" id="smoke-module" onchange="renderSuite('smoke')"><option value="">All Modules</option></select>
        <select class="filter-select" id="smoke-tier" onchange="renderSuite('smoke')"><option value="">All Tiers</option><option>Tier 0</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select>
      </div>
      <div id="smoke-list"></div>
    </div>
  </div>

  <!-- REGRESSION PAGE -->
  <div class="page" id="page-regression">
    <div class="topbar">
      <div>
        <div style="font-size:18px;font-weight:700">Regression Suite</div>
        <div class="sub" id="regression-subtitle"></div>
      </div>
    </div>
    <div class="content">
      <div class="filter-bar">
        <input type="text" class="search-input" id="regression-search" placeholder="🔍 Search cases..." oninput="renderSuite('regression')">
        <select class="filter-select" id="regression-module" onchange="renderSuite('regression')"><option value="">All Modules</option></select>
        <select class="filter-select" id="regression-tier" onchange="renderSuite('regression')"><option value="">All Tiers</option><option>Tier 0</option><option>Tier 1</option><option>Tier 2</option><option>Tier 3</option></select>
      </div>
      <div id="regression-list"></div>
    </div>
  </div>

  <!-- TIER PAGES -->
  ${['tier0','tier1','tier2','tier3'].map(t => `
  <div class="page" id="page-${t}">
    <div class="topbar">
      <div>
        <div style="font-size:18px;font-weight:700" id="${t}-title"></div>
        <div class="sub" id="${t}-subtitle"></div>
      </div>
    </div>
    <div class="content">
      <div id="${t}-summary" class="summary-bar"></div>
      <div class="filter-bar">
        <input type="text" class="search-input" id="${t}-search" placeholder="🔍 Search cases..." oninput="renderTierTable('${t}')">
        <select class="filter-select" id="${t}-module" onchange="renderTierTable('${t}')"><option value="">All Modules</option></select>
      </div>
      <div id="${t}-table-wrap"></div>
    </div>
  </div>`).join('')}

  <!-- MODULE DETAIL PAGE -->
  <div class="page" id="page-module">
    <div class="topbar">
      <div style="font-size:18px;font-weight:700" id="module-detail-title"></div>
    </div>
    <div class="content" id="module-detail-content"></div>
  </div>

  <div id="footer">Payments &amp; Wallets Test Coverage &nbsp;·&nbsp; Jeeny QA &nbsp;·&nbsp; Press F11 for fullscreen &nbsp;·&nbsp; Ctrl+P to print</div>
</div>

<!-- EDIT PANEL -->
<div id="edit-panel">
  <h3>✏️ Edit Diagram</h3>
  <div>
    <label style="font-size:12px;color:#64748b;margin-bottom:4px;display:block">Add node</label>
    <input type="text" id="add-node-input" placeholder="Node name...">
  </div>
  <button class="btn btn-primary btn-sm" onclick="addDiagramNode()">Add Node</button>
  <hr style="border:none;border-top:1px solid #e5e7eb">
  <button class="btn btn-secondary btn-sm" onclick="exportDiagram()">⬇️ Export JSON</button>
  <div>
    <label style="font-size:12px;color:#64748b;margin-bottom:4px;display:block">Import JSON</label>
    <input type="file" id="import-file" accept=".json" onchange="importDiagram(event)" style="font-size:12px">
  </div>
  <button class="btn btn-danger btn-sm" onclick="resetDiagram()">↩️ Reset to Default</button>
  <button class="btn btn-secondary btn-sm" style="margin-top:auto" onclick="toggleEditPanel()">Close</button>
</div>

<!-- TOAST -->
<div id="toast">✓ Saved</div>

<script>
const CASES = ${CASES_JSON};
const MODULE_META = ${META_JSON};

// ---- Derived data ----
const modules = [...new Set(CASES.map(c=>c.module))].sort();
const smoke = CASES.filter(c=>c.smoke);
const regression = CASES.filter(c=>c.regression);
const tier0 = CASES.filter(c=>c.tier==='Tier 0');
const tier1 = CASES.filter(c=>c.tier==='Tier 1');
const tier2 = CASES.filter(c=>c.tier==='Tier 2');
const tier3 = CASES.filter(c=>c.tier==='Tier 3');
const byModule = {};
modules.forEach(m => byModule[m] = CASES.filter(c=>c.module===m));
const passengerCases = CASES.filter(c=>c.app==='Passenger App');
const driverCasesAll = CASES.filter(c=>c.app==='Driver App');
const PASSENGER_MODS = ['Card Management','Apple Pay','Wallet','Credit Card Rides','Cash Rides','Tabby','STCPay','FDM','Mokafaa','Driver Top-Up','Promotions & Restrictions','Payment Observability'];
const DRIVER_MODS = ['Driver Wallet','Driver STC Pay','Driver Card Management','Driver Cancellation & Fraud'];

// ---- Helpers ----
function badge(type, text) {
  const cls = {
    'Tier 0':'badge-tier0','Tier 1':'badge-tier1','Tier 2':'badge-tier2','Tier 3':'badge-tier3',
    'smoke':'badge-smoke','regression':'badge-regression',
    'Critical':'badge-critical','High':'badge-high','Medium':'badge-medium','Low':'badge-low'
  }[type] || 'badge-tier3';
  return \`<span class="badge \${cls}">\${text}</span>\`;
}
function tierBadge(t){ return badge(t,t); }
function caseRow(c, showMod=false){
  return \`<div class="case-row">
    <span class="case-id">C\${c.id}</span>
    <span class="case-title">\${esc(c.title)}\${showMod ? ' <span style="color:#94a3b8;font-size:10px">· '+esc(c.module)+'</span>' : ''}</span>
    <span class="case-badges">\${tierBadge(c.tier)}\${c.smoke?badge('smoke','Smoke'):''}\${c.regression?badge('regression','Reg'):''}\${badge(c.priority,c.priority)}</span>
  </div>\`;
}
function esc(s){ const d=document.createElement('div');d.textContent=s;return d.innerHTML; }
function showToast(msg='✓ Saved'){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}

// ---- Navigation ----
let currentPage = 'overview';
function showPage(id, extra){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  currentPage = id;
  if(id==='module' && extra) renderModuleDetail(extra);
  if(id==='smoke') renderSuite('smoke');
  if(id==='regression') renderSuite('regression');
  if(id==='tier0') renderTierPage('tier0');
  if(id==='tier1') renderTierPage('tier1');
  if(id==='tier2') renderTierPage('tier2');
  if(id==='tier3') renderTierPage('tier3');
}

// ---- Module nav ----
function buildModuleNav(){
  const nav = document.getElementById('module-nav');
  nav.innerHTML = PASSENGER_MODS.filter(m=>byModule[m]).map(m=>{
    const meta = MODULE_META[m]||{};
    return \`<div class="nav-item" onclick="showPage('module','\${m.replace(/'/g,"\\\\'")}')">
      <span>\${meta.emoji||'📁'} \${m}</span>
      <span class="nav-badge">\${(byModule[m]||[]).length}</span>
    </div>\`;
  }).join('');
  const driverNav = document.getElementById('driver-module-nav');
  driverNav.innerHTML = DRIVER_MODS.filter(m=>byModule[m]).map(m=>{
    const meta = MODULE_META[m]||{};
    return \`<div class="nav-item" onclick="showPage('module','\${m.replace(/'/g,"\\\\'")}')">
      <span>\${meta.emoji||'📁'} \${m}</span>
      <span class="nav-badge">\${(byModule[m]||[]).length}</span>
    </div>\`;
  }).join('');
}

// ---- Overview ----
function buildModuleCards(modList){
  let html = '';
  modList.forEach(m=>{
    const cases = byModule[m]||[];
    if(!cases.length) return;
    const meta = MODULE_META[m]||{emoji:'📁',desc:'',tags:[]};
    const ms = cases.filter(c=>c.smoke).length;
    const mr = cases.filter(c=>c.regression).length;
    const mt0=cases.filter(c=>c.tier==='Tier 0').length;
    const mt1=cases.filter(c=>c.tier==='Tier 1').length;
    const mt2=cases.filter(c=>c.tier==='Tier 2').length;
    const mt3=cases.filter(c=>c.tier==='Tier 3').length;
    const total = cases.length;
    html += \`<div class="module-card" onclick="showPage('module','\${m.replace(/'/g,"\\\\'")}')">
      <div class="mc-header"><span class="mc-emoji">\${meta.emoji}</span><span class="mc-name">\${m}</span></div>
      <div class="mc-desc">\${meta.desc}</div>
      <div class="tags">\${(meta.tags||[]).map(t=>\`<span class="tag">\${t}</span>\`).join('')}</div>
      <div class="mc-stats">
        <span>🔥 Smoke: <strong>\${ms}</strong></span>
        <span>🔁 Regression: <strong>\${mr}</strong></span>
        <span>📋 Total: <strong>\${total}</strong></span>
      </div>
      <div class="tier-bar">
        \${mt0 ? \`<div class="tier-seg t0" style="flex:\${mt0}" title="Tier 0: \${mt0}"></div>\` : ''}
        \${mt1 ? \`<div class="tier-seg t1" style="flex:\${mt1}" title="Tier 1: \${mt1}"></div>\` : ''}
        \${mt2 ? \`<div class="tier-seg t2" style="flex:\${mt2}" title="Tier 2: \${mt2}"></div>\` : ''}
        \${mt3 ? \`<div class="tier-seg t3" style="flex:\${mt3}" title="Tier 3: \${mt3}"></div>\` : ''}
      </div>
      <div class="tier-legend">
        \${mt0?\`<span><span class="tl-dot t0" style="display:inline-block"></span>T0:\${mt0}</span>\`:''}
        \${mt1?\`<span><span class="tl-dot t1" style="display:inline-block"></span>T1:\${mt1}</span>\`:''}
        \${mt2?\`<span><span class="tl-dot t2" style="display:inline-block"></span>T2:\${mt2}</span>\`:''}
        \${mt3?\`<span><span class="tl-dot t3" style="display:inline-block"></span>T3:\${mt3}</span>\`:''}
      </div>
    </div>\`;
  });
  return html;
}

function buildOverview(){
  const el = document.getElementById('overview-content');
  const pSmoke = passengerCases.filter(c=>c.smoke).length;
  const pReg = passengerCases.filter(c=>c.regression).length;
  const dSmoke = driverCasesAll.filter(c=>c.smoke).length;
  const dReg = driverCasesAll.filter(c=>c.regression).length;
  let html = \`
  <div class="stat-row">
    <div class="stat-card"><div class="label">Total Cases</div><div class="value blue">\${CASES.length}</div></div>
    <div class="stat-card"><div class="label">Smoke</div><div class="value green">\${smoke.length}</div></div>
    <div class="stat-card"><div class="label">Regression</div><div class="value purple">\${regression.length}</div></div>
    <div class="stat-card"><div class="label">Tier 0</div><div class="value red">\${tier0.length}</div></div>
    <div class="stat-card"><div class="label">Tier 1</div><div class="value orange">\${tier1.length}</div></div>
    <div class="stat-card"><div class="label">Tier 2</div><div class="value blue">\${tier2.length}</div></div>
    <div class="stat-card"><div class="label">Tier 3</div><div class="value">\${tier3.length}</div></div>
  </div>
  <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
    <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px">
      <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">🚗 Passenger App</div>
      <div style="display:flex;gap:16px;font-size:13px;color:#374151;flex-wrap:wrap">
        <span>📋 Cases: <strong>\${passengerCases.length}</strong></span>
        <span>🔥 Smoke: <strong>\${pSmoke}</strong></span>
        <span>🔁 Regression: <strong>\${pReg}</strong></span>
        <span>Modules: <strong>\${PASSENGER_MODS.filter(m=>byModule[m]&&byModule[m].length).length}</strong></span>
      </div>
    </div>
    <div style="flex:1;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:12px 16px">
      <div style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">🚕 Driver App</div>
      <div style="display:flex;gap:16px;font-size:13px;color:#374151;flex-wrap:wrap">
        <span>📋 Cases: <strong>\${driverCasesAll.length}</strong></span>
        <span>🔥 Smoke: <strong>\${dSmoke}</strong></span>
        <span>🔁 Regression: <strong>\${dReg}</strong></span>
        <span>Modules: <strong>\${DRIVER_MODS.filter(m=>byModule[m]&&byModule[m].length).length}</strong></span>
      </div>
    </div>
  </div>
  <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0">🚗 Passenger App Modules</div>
  <div class="module-grid">\${buildModuleCards(PASSENGER_MODS.filter(m=>m!=='STCPay'))}</div>
  <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin:20px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0">🚕 Driver App Modules</div>
  <div class="module-grid">\${buildModuleCards(DRIVER_MODS)}</div>\`;
  el.innerHTML = html;
}

// ---- Diagram ----
const DIAG_KEY = 'payments-wallets-coverage-diagram-v1';
let diagData = null;

function buildModuleNode(m){
  const mCases = byModule[m]||[];
  if(!mCases.length) return null;
  const modNode = { name: m, type: 'module', children: [] };
  const bySec = {};
  mCases.forEach(c=>{ if(!bySec[c.section]) bySec[c.section]=[]; bySec[c.section].push(c); });
  Object.entries(bySec).forEach(([sec, cases])=>{
    modNode.children.push({ name: sec, type: 'section', count: cases.length, cases: cases.map(c=>({id:c.id,title:c.title,tier:c.tier,smoke:c.smoke,regression:c.regression})) });
  });
  return modNode;
}

function buildDiagramData(){
  const root = { name: 'PAYMENTS & WALLETS', type: 'root', children: [] };
  // Passenger App branch
  const passBranch = { name: '🚗 PASSENGER APP', type: 'module', children: [] };
  PASSENGER_MODS.forEach(m=>{ const n=buildModuleNode(m); if(n) passBranch.children.push(n); });
  root.children.push(passBranch);
  // Driver App branch
  const driverBranch = { name: '🚕 DRIVER APP', type: 'module', children: [] };
  DRIVER_MODS.forEach(m=>{ const n=buildModuleNode(m); if(n) driverBranch.children.push(n); });
  root.children.push(driverBranch);
  return root;
}

function saveDiag(){
  localStorage.setItem(DIAG_KEY, JSON.stringify(diagData));
  showToast('✓ Saved');
}

function loadDiag(){
  const saved = localStorage.getItem(DIAG_KEY);
  if(saved){ try { diagData = JSON.parse(saved); return; } catch(e){} }
  diagData = buildDiagramData();
}

function renderDiagram(){
  loadDiag();
  const el = document.getElementById('diagram-content');
  el.innerHTML = \`<div class="tree" id="tree-root">\${renderNode(diagData, 'root-0')}</div>\`;
}

function renderNode(node, id){
  if(node.type === 'root'){
    return \`<div class="tree-node tree-root">
      <div class="tree-toggle" onclick="toggleNode('\${id}')">
        <span class="tree-arrow open" id="arr-\${id}">▶</span>
        <span>\${esc(node.name)}</span>
        <span class="tree-count">(\${CASES.length} cases)</span>
      </div>
      <div class="tree-children" id="children-\${id}">
        \${node.children.map((c,i)=>renderNode(c,id+'-'+i)).join('')}
      </div>
    </div>\`;
  }
  if(node.type === 'module'){
    const total = node.children.reduce((s,c)=>s+(c.count||0),0);
    const meta = MODULE_META[node.name]||{};
    return \`<div class="tree-node tree-module">
      <div class="tree-toggle" onclick="toggleNode('\${id}')">
        <span class="tree-arrow" id="arr-\${id}">▶</span>
        <span>\${meta.emoji||'📁'} \${esc(node.name)}</span>
        <span class="tree-count">(\${total} cases)</span>
      </div>
      <div class="tree-children hidden" id="children-\${id}">
        \${node.children.map((c,i)=>renderNode(c,id+'-'+i)).join('')}
      </div>
    </div>\`;
  }
  if(node.type === 'section'){
    return \`<div class="tree-node tree-section">
      <div class="tree-toggle" onclick="toggleNode('\${id}')">
        <span class="tree-arrow" id="arr-\${id}">▶</span>
        <span>\${esc(node.name)}</span>
        <span class="tree-count">(\${node.count})</span>
      </div>
      <div class="tree-children hidden" id="children-\${id}">
        \${(node.cases||[]).map(c=>\`<div class="tree-case">
          <span class="case-id">C\${c.id}</span>
          <span class="case-title">\${esc(c.title)}</span>
          <span class="case-badges" style="display:flex;gap:3px">\${tierBadge(c.tier)}\${c.smoke?badge('smoke','S'):''}\${c.regression?badge('regression','R'):''}</span>
        </div>\`).join('')}
      </div>
    </div>\`;
  }
  return '';
}

function toggleNode(id){
  const children = document.getElementById('children-'+id);
  const arrow = document.getElementById('arr-'+id);
  if(!children) return;
  children.classList.toggle('hidden');
  arrow.classList.toggle('open');
}

function expandAll(){
  document.querySelectorAll('.tree-children').forEach(el=>el.classList.remove('hidden'));
  document.querySelectorAll('.tree-arrow').forEach(el=>el.classList.add('open'));
}
function collapseAll(){
  document.querySelectorAll('.tree-children').forEach((el,i)=>{ if(i>0) el.classList.add('hidden'); });
  document.querySelectorAll('.tree-arrow').forEach((el,i)=>{ if(i>0) el.classList.remove('open'); });
}

// Edit panel
let editPanelOpen = false;
function toggleEditPanel(){
  editPanelOpen = !editPanelOpen;
  document.getElementById('edit-panel').classList.toggle('open', editPanelOpen);
}
function addDiagramNode(){
  const val = document.getElementById('add-node-input').value.trim();
  if(!val) return;
  diagData.children.push({name: val, type: 'module', children: []});
  saveDiag(); renderDiagram();
}
function exportDiagram(){
  const blob = new Blob([JSON.stringify(diagData,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'coverage-diagram.json'; a.click();
}
function importDiagram(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{ try{ diagData=JSON.parse(ev.target.result); saveDiag(); renderDiagram(); }catch(err){ alert('Invalid JSON'); }};
  reader.readAsText(file);
}
function resetDiagram(){
  if(!confirm('Reset diagram to default? This will clear all edits.')) return;
  localStorage.removeItem(DIAG_KEY);
  diagData = buildDiagramData(); renderDiagram();
}

// ---- Suite pages ----
function populateModuleFilter(id, cases){
  const sel = document.getElementById(id);
  const mods = [...new Set(cases.map(c=>c.module))].sort();
  const cur = sel.value;
  while(sel.options.length > 1) sel.remove(1);
  mods.forEach(m=>{ const o=document.createElement('option');o.value=m;o.textContent=m;sel.appendChild(o); });
  sel.value = cur;
}

function filterCases(cases, search, module, tier){
  return cases.filter(c=>{
    if(search && !c.title.toLowerCase().includes(search.toLowerCase()) && !String(c.id).includes(search)) return false;
    if(module && c.module !== module) return false;
    if(tier && c.tier !== tier) return false;
    return true;
  });
}

function renderSuite(type){
  const suiteMap = {smoke, regression};
  const cases = suiteMap[type];
  const search = document.getElementById(type+'-search').value;
  const module = document.getElementById(type+'-module').value;
  const tier = document.getElementById(type+'-tier') ? document.getElementById(type+'-tier').value : '';
  populateModuleFilter(type+'-module', cases);
  const filtered = filterCases(cases, search, module, tier);
  document.getElementById(type+'-subtitle').textContent = \`\${filtered.length} of \${cases.length} cases\`;
  const el = document.getElementById(type+'-list');
  if(!filtered.length){ el.innerHTML='<div class="no-results">No cases match your filters.</div>'; return; }
  // Group by module then section
  const byMod = {};
  filtered.forEach(c=>{ if(!byMod[c.module]) byMod[c.module]={}; if(!byMod[c.module][c.section]) byMod[c.module][c.section]=[]; byMod[c.module][c.section].push(c); });
  let html='';
  Object.entries(byMod).forEach(([mod,bySec])=>{
    html += \`<div class="group-header">\${MODULE_META[mod]?.emoji||'📁'} \${mod}</div>\`;
    Object.entries(bySec).forEach(([sec,cases])=>{
      html += \`<div class="section-header">📂 \${sec}</div>\`;
      cases.forEach(c=>{ html += caseRow(c); });
    });
  });
  el.innerHTML = html;
}

// ---- Tier pages ----
function renderTierPage(id){
  const tierCases = {tier0,tier1,tier2,tier3}[id];
  const label = {tier0:'Tier 0',tier1:'Tier 1',tier2:'Tier 2',tier3:'Tier 3'}[id];
  document.getElementById(id+'-title').textContent = label + ' — ' + tierCases.length + ' Cases';
  document.getElementById(id+'-subtitle').textContent = 'Cases classified as ' + label;
  const modCov = [...new Set(tierCases.map(c=>c.module))].length;
  document.getElementById(id+'-summary').innerHTML = \`
    <div class="sb-item"><div class="sb-val">\${tierCases.length}</div><div class="sb-lbl">Total Cases</div></div>
    <div class="sb-item"><div class="sb-val">\${modCov}</div><div class="sb-lbl">Modules Covered</div></div>
    <div class="sb-item"><div class="sb-val">\${tierCases.filter(c=>c.smoke).length}</div><div class="sb-lbl">Smoke Cases</div></div>
    <div class="sb-item"><div class="sb-val">\${tierCases.filter(c=>c.regression).length}</div><div class="sb-lbl">Regression Cases</div></div>
  \`;
  populateModuleFilter(id+'-module', tierCases);
  renderTierTable(id);
}

function renderTierTable(id){
  const tierCases = {tier0,tier1,tier2,tier3}[id];
  const search = document.getElementById(id+'-search').value;
  const module = document.getElementById(id+'-module').value;
  const filtered = filterCases(tierCases, search, module, '');
  const wrap = document.getElementById(id+'-table-wrap');
  if(!filtered.length){ wrap.innerHTML='<div class="no-results">No cases match your filters.</div>'; return; }
  let html = \`<table class="data-table">
    <thead><tr><th>Case ID</th><th>Title</th><th>Module</th><th>Section</th><th>Smoke</th><th>Regression</th><th>Priority</th></tr></thead>
    <tbody>\`;
  filtered.forEach(c=>{
    html += \`<tr>
      <td><span class="case-id">C\${c.id}</span></td>
      <td>\${esc(c.title)}</td>
      <td>\${esc(c.module)}</td>
      <td>\${esc(c.section)}</td>
      <td>\${c.smoke?badge('smoke','Smoke'):''}</td>
      <td>\${c.regression?badge('regression','Reg'):''}</td>
      <td>\${badge(c.priority,c.priority)}</td>
    </tr>\`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

// ---- Module detail ----
function renderModuleDetail(modName){
  const meta = MODULE_META[modName] || {emoji:'📁',desc:'',tags:[]};
  const mCases = byModule[modName] || [];
  const ms = mCases.filter(c=>c.smoke);
  const mr = mCases.filter(c=>c.regression);
  const prioVals = {'Critical':4,'High':3,'Medium':2,'Low':1};
  const avgPrio = mCases.length ? mCases.reduce((s,c)=>s+(prioVals[c.priority]||2),0)/mCases.length : 0;
  const prioLabel = avgPrio >= 3.5 ? 'Critical' : avgPrio >= 2.5 ? 'High' : avgPrio >= 1.5 ? 'Medium' : 'Low';
  document.getElementById('module-detail-title').innerHTML = meta.emoji + ' ' + esc(modName);
  const el = document.getElementById('module-detail-content');
  // Group by section
  const bySec = {};
  mCases.forEach(c=>{ if(!bySec[c.section]) bySec[c.section]=[]; bySec[c.section].push(c); });

  const smokeOnly = mCases.filter(c=>c.smoke && !c.regression);
  const regOnly = mCases.filter(c=>c.regression && !c.smoke);
  const both = mCases.filter(c=>c.smoke && c.regression);
  const others = mCases.filter(c=>!c.smoke && !c.regression);

  const stcPassSyncHtml = '';
  const stcSyncHtml = '';

  let html = \`
    <div class="detail-desc">\${meta.desc}</div>
    <div class="detail-stats">
      <div class="detail-stat"><div class="ds-val">\${mCases.length}</div><div class="ds-lbl">Total</div></div>
      <div class="detail-stat"><div class="ds-val" style="color:#059669">\${ms.length}</div><div class="ds-lbl">Smoke</div></div>
      <div class="detail-stat"><div class="ds-val" style="color:#7c3aed">\${mr.length}</div><div class="ds-lbl">Regression</div></div>
      <div class="detail-stat"><div class="ds-val" style="color:#d97706">\${prioLabel}</div><div class="ds-lbl">Avg Priority</div></div>
    </div>
    <div class="tags" style="margin-bottom:16px">\${(meta.tags||[]).map(t=>\`<span class="tag">\${t}</span>\`).join('')}</div>
    \${stcPassSyncHtml}
    \${stcSyncHtml}
    <div class="filter-bar" style="margin-bottom:12px">
      <input type="text" class="search-input" id="mod-search" placeholder="🔍 Search in \${esc(modName)}..." oninput="filterModCases('\${modName.replace(/'/g,"\\\\'")}')">
    </div>
    <div id="mod-cases-list">\${renderModCasesList(mCases)}</div>\`;
  el.innerHTML = html;
  el._allCases = mCases;
}

function renderModCasesList(cases){
  if(!cases.length) return '<div class="no-results">No cases.</div>';
  const smokeC = cases.filter(c=>c.smoke);
  const regOnlyC = cases.filter(c=>c.regression && !c.smoke);
  const otherC = cases.filter(c=>!c.smoke && !c.regression);
  let html = '';
  if(smokeC.length){ html += '<div class="group-header">🔥 Smoke Cases</div>'; smokeC.forEach(c=>{ html+=caseRow(c); }); }
  if(regOnlyC.length){ html += '<div class="group-header">🔁 Regression Only</div>'; regOnlyC.forEach(c=>{ html+=caseRow(c); }); }
  if(otherC.length){ html += '<div class="group-header">📋 Other Cases</div>'; otherC.forEach(c=>{ html+=caseRow(c); }); }
  return html;
}

function filterModCases(modName){
  const search = document.getElementById('mod-search').value.toLowerCase();
  const el = document.getElementById('module-detail-content');
  const cases = el._allCases || byModule[modName] || [];
  const filtered = search ? cases.filter(c=>c.title.toLowerCase().includes(search)||String(c.id).includes(search)) : cases;
  document.getElementById('mod-cases-list').innerHTML = renderModCasesList(filtered);
}

// ---- Badge counters ----
function updateBadges(){
  document.getElementById('nb-smoke').textContent = smoke.length;
  document.getElementById('nb-regression').textContent = regression.length;
  document.getElementById('nb-t0').textContent = tier0.length;
  document.getElementById('nb-t1').textContent = tier1.length;
  document.getElementById('nb-t2').textContent = tier2.length;
  document.getElementById('nb-t3').textContent = tier3.length;
}

// ---- Keyboard shortcut ----
document.addEventListener('keydown', e=>{
  if(e.key === '/' && document.activeElement.tagName !== 'INPUT'){
    e.preventDefault();
    const searches = ['smoke-search','regression-search','tier0-search','tier1-search','tier2-search','tier3-search','mod-search'];
    for(const id of searches){ const el = document.getElementById(id); if(el && el.offsetParent){ el.focus(); break; }}
  }
});

// ---- Init ----
updateBadges();
buildModuleNav();
buildOverview();
renderDiagram();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(OUT_DIR, 'presentation.html'), html);
const size = fs.statSync(path.join(OUT_DIR, 'presentation.html')).size;
console.log('presentation.html written:', Math.round(size/1024) + ' KB');
