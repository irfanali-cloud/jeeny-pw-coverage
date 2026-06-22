const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('C:\\Users\\Irfan\\testrail-mcp\\pw_cases.json', 'utf8').replace(/^﻿/, ''));

const sectionMap = {
  895: "Payments & Wallets",
  877: "Add card / Delete card",
  869: "Wallet Transactions for Cashback",
  879: "Credit Card rides",
  880: "Apple pay rides",
  2980: "Apple pay Rides (Pa<Actual fare)",
  881: "FDM rides",
  882: "Tabby Rides",
  1280: "Tabby New Registration",
  883: "Wallet Topup",
  886: "Excessive Capture",
  888: "Credit topup via CC for driver",
  884: "Transaction History",
  887: "Voucher Codes",
  885: "STCPay",
  878: "Cash rides",
  897: "Mokafaa Integration Wallet Topup Burn",
  898: "EARN Mokafaa Integration for Jeeny Rides",
  924: "SNB Apple Pay MADA",
  963: "Checkout Apple Pay",
  1228: "Jeeny Matrix Refund Alert",
  1229: "SQS Queue Improvement Credit Card",
  1263: "Restricting Cash Rides Outstanding Balances",
  1276: "Payment Observability",
  1552: "Add Card Credit Topup CC rides Checkout",
  1617: "Auto Enable Passenger Wallet",
  3014: "Apple Pay Skip Destination",
  5878: "Passenger Wallet and Cancellation Fines"
};

const moduleMap = {
  877: "Card Management",
  1552: "Card Management",
  879: "Credit Card Rides",
  1229: "Credit Card Rides",
  886: "Credit Card Rides",
  880: "Apple Pay",
  2980: "Apple Pay",
  924: "Apple Pay",
  963: "Apple Pay",
  3014: "Apple Pay",
  878: "Cash Rides",
  883: "Wallet",
  869: "Wallet",
  884: "Wallet",
  1617: "Wallet",
  5878: "Wallet",
  882: "Tabby",
  1280: "Tabby",
  885: "STCPay",
  881: "FDM",
  897: "Mokafaa",
  898: "Mokafaa",
  888: "Driver Top-Up",
  887: "Promotions & Restrictions",
  1263: "Promotions & Restrictions",
  1276: "Payment Observability",
  1228: "Payment Observability",
  895: "Payments & Wallets"
};

const tierMap = { 1: "Tier 0", 2: "Tier 1", 3: "Tier 2", 4: "Tier 3" };
const priorityMap = { 1: "Critical", 2: "High", 3: "Medium", 4: "Low" };

const cases = raw.map(c => ({
  id: c.id,
  title: c.title,
  tier: tierMap[c.custom_case_tier] || "Tier 3",
  smoke: !!c.custom_case_smoke,
  regression: !!c.custom_case_regression,
  priority: priorityMap[c.priority_id] || "Medium",
  module: moduleMap[c.section_id] || "Payments & Wallets",
  section: sectionMap[c.section_id] || "Unknown",
  folder: "Payments & Wallets / " + (sectionMap[c.section_id] || "Unknown")
}));

const out = 'C:\\Users\\Irfan\\payments-wallets-coverage\\';

fs.writeFileSync(out + 'all-cases-data.json', JSON.stringify(cases, null, 2));
fs.writeFileSync(out + 'smoke-cases.json', JSON.stringify(cases.filter(c => c.smoke), null, 2));
fs.writeFileSync(out + 'regression-cases.json', JSON.stringify(cases.filter(c => c.regression), null, 2));
fs.writeFileSync(out + 'tier-0-cases.json', JSON.stringify(cases.filter(c => c.tier === 'Tier 0'), null, 2));
fs.writeFileSync(out + 'tier-1-cases.json', JSON.stringify(cases.filter(c => c.tier === 'Tier 1'), null, 2));
fs.writeFileSync(out + 'tier-2-cases.json', JSON.stringify(cases.filter(c => c.tier === 'Tier 2'), null, 2));
fs.writeFileSync(out + 'tier-3-cases.json', JSON.stringify(cases.filter(c => c.tier === 'Tier 3'), null, 2));

console.log('Total:', cases.length);
console.log('Smoke:', cases.filter(c => c.smoke).length);
console.log('Regression:', cases.filter(c => c.regression).length);
console.log('Tier 0:', cases.filter(c => c.tier === 'Tier 0').length);
console.log('Tier 1:', cases.filter(c => c.tier === 'Tier 1').length);
console.log('Tier 2:', cases.filter(c => c.tier === 'Tier 2').length);
console.log('Tier 3:', cases.filter(c => c.tier === 'Tier 3').length);
