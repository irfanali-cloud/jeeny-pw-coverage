/**
 * fetch.js — Fetches fresh Payments & Wallets test cases from TestRail
 * and regenerates all JSON files.
 * Usage: node fetch.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: 'jeeny1.testrail.io',
  user: 'irfan.ali@jeeny.me',
  apiKey: 'l.B6uf0zb7ofrsq4SCwJ-LIeg5ttAXUr3BSqfT2PF',
  projectId: 1,
  sectionIds: [895,877,869,879,880,2980,881,882,1280,883,886,888,884,887,885,878,897,898,924,963,1228,1229,1263,1276,1552,1617,3014,5878]
};

const OUT_DIR = __dirname;

const sectionMap = {
  895: "Payments & Wallets", 877: "Add card / Delete card",
  869: "Wallet Transactions for Cashback", 879: "Credit Card rides",
  880: "Apple pay rides", 2980: "Apple pay Rides (Pa<Actual fare)",
  881: "FDM rides", 882: "Tabby Rides", 1280: "Tabby New Registration",
  883: "Wallet Topup", 886: "Excessive Capture",
  888: "Credit topup via CC for driver", 884: "Transaction History",
  887: "Voucher Codes", 885: "STCPay", 878: "Cash rides",
  897: "Mokafaa Integration Wallet Topup Burn",
  898: "EARN Mokafaa Integration for Jeeny Rides",
  924: "SNB Apple Pay MADA", 963: "Checkout Apple Pay",
  1228: "Jeeny Matrix Refund Alert", 1229: "SQS Queue Improvement Credit Card",
  1263: "Restricting Cash Rides Outstanding Balances",
  1276: "Payment Observability", 1552: "Add Card Credit Topup CC rides Checkout",
  1617: "Auto Enable Passenger Wallet", 3014: "Apple Pay Skip Destination",
  5878: "Passenger Wallet and Cancellation Fines"
};

const moduleMap = {
  877: "Card Management", 1552: "Card Management",
  879: "Credit Card Rides", 1229: "Credit Card Rides", 886: "Credit Card Rides",
  880: "Apple Pay", 2980: "Apple Pay", 924: "Apple Pay", 963: "Apple Pay", 3014: "Apple Pay",
  878: "Cash Rides",
  883: "Wallet", 869: "Wallet", 884: "Wallet", 1617: "Wallet", 5878: "Wallet",
  882: "Tabby", 1280: "Tabby",
  885: "STCPay", 881: "FDM",
  897: "Mokafaa", 898: "Mokafaa",
  888: "Driver Top-Up",
  887: "Promotions & Restrictions", 1263: "Promotions & Restrictions",
  1276: "Payment Observability", 1228: "Payment Observability",
  895: "Payments & Wallets"
};

const tierMap = { 1: "Tier 0", 2: "Tier 1", 3: "Tier 2", 4: "Tier 3" };
const priorityMap = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low" };

function testrailGet(endpoint) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONFIG.user}:${CONFIG.apiKey}`).toString('base64');
    const options = {
      hostname: CONFIG.host,
      path: `/index.php?/api/v2/${endpoint}`,
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

async function fetchSection(sectionId) {
  let allCases = [];
  let offset = 0;
  const limit = 250;
  while (true) {
    const url = `get_cases/${CONFIG.projectId}&section_id=${sectionId}&limit=${limit}&offset=${offset}`;
    const result = await testrailGet(url);
    const cases = result.cases || result;
    if (!Array.isArray(cases) || cases.length === 0) break;
    allCases = allCases.concat(cases);
    if (cases.length < limit) break;
    offset += limit;
  }
  return allCases;
}

function transformCase(c) {
  return {
    id: c.id,
    title: c.title,
    tier: tierMap[c.custom_case_tier] || "Tier 3",
    smoke: !!c.custom_case_smoke,
    regression: !!c.custom_case_regression,
    priority: priorityMap[c.priority_id] || "Medium",
    module: moduleMap[c.section_id] || "Payments & Wallets",
    section: sectionMap[c.section_id] || "Unknown",
    folder: "Payments & Wallets / " + (sectionMap[c.section_id] || "Unknown")
  };
}

async function main() {
  console.log('Fetching test cases from TestRail...');
  let allRaw = [];

  for (const sectionId of CONFIG.sectionIds) {
    process.stdout.write(`  Section ${sectionId} (${sectionMap[sectionId]})... `);
    try {
      const cases = await fetchSection(sectionId);
      console.log(`${cases.length} cases`);
      allRaw = allRaw.concat(cases);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 200)); // rate limit
  }

  const cases = allRaw.map(transformCase);
  // Deduplicate by id
  const seen = new Set();
  const unique = cases.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });

  fs.writeFileSync(path.join(OUT_DIR, 'all-cases-data.json'), JSON.stringify(unique, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'smoke-cases.json'), JSON.stringify(unique.filter(c => c.smoke), null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'regression-cases.json'), JSON.stringify(unique.filter(c => c.regression), null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'tier-0-cases.json'), JSON.stringify(unique.filter(c => c.tier === 'Tier 0'), null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'tier-1-cases.json'), JSON.stringify(unique.filter(c => c.tier === 'Tier 1'), null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'tier-2-cases.json'), JSON.stringify(unique.filter(c => c.tier === 'Tier 2'), null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'tier-3-cases.json'), JSON.stringify(unique.filter(c => c.tier === 'Tier 3'), null, 2));

  console.log('\nDone!');
  console.log(`Total: ${unique.length} | Smoke: ${unique.filter(c=>c.smoke).length} | Regression: ${unique.filter(c=>c.regression).length}`);
  console.log(`Tier 0: ${unique.filter(c=>c.tier==='Tier 0').length} | Tier 1: ${unique.filter(c=>c.tier==='Tier 1').length} | Tier 2: ${unique.filter(c=>c.tier==='Tier 2').length} | Tier 3: ${unique.filter(c=>c.tier==='Tier 3').length}`);
  console.log('\nRun "node build.js" to regenerate presentation.html');
}

main().catch(console.error);
