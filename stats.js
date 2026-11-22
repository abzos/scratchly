// Scratchly stats frissito. A GitHub Actions futtatja 10 percenkent.
// A fee tarca tranzakcioibol szamolja ki az osszes visszaszerzett SOL-t.
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync("config.js", "utf8"), ctx);
const CFG = ctx.window.SCRATCHLY_CONFIG;
const RPC = process.env.RPC_URL || CFG.RPC_URL || "https://api.mainnet-beta.solana.com";
const MAX_PER_RUN = 150;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let rid = 0;
async function rpc(method, params) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rid, method, params }) });
      if (r.status === 429) { await sleep(1500 * (i + 1)); if (i === 3) throw new Error("HTTP 429 (rate limit)"); continue; }
      const txt = await r.text();
      if (!r.ok) throw new Error("HTTP " + r.status + ": " + txt.slice(0, 100).replace(/\s+/g, " "));
      let j; try { j = JSON.parse(txt); } catch (e) { throw new Error("Bad response: " + txt.slice(0, 100).replace(/\s+/g, " ")); }
      if (j.error) throw new Error(j.error.message);
      return j.result;
    } catch (e) { if (i === 3) throw e; await sleep(1000 * (i + 1)); }
  }
}
const short = s => s.slice(0, 4) + "..." + s.slice(-4);

async function main() {
  let S = { totalReclaimed: 0, totalFees: 0, accounts: 0, wallets: 0, lastSig: null, recent: [], updated: null, _seen: [] };
  try { S = Object.assign(S, JSON.parse(fs.readFileSync("stats.json", "utf8"))); } catch (e) {}
  const seen = new Set(S._seen);

  let all = [], before;
  for (;;) {
    const opts = { limit: 1000 };
    if (S.lastSig) opts.until = S.lastSig;
    if (before) opts.before = before;
    const page = await rpc("getSignaturesForAddress", [CFG.FEE_WALLET, opts]);
    all = all.concat(page);
    if (page.length < 1000) break;
    before = page[page.length - 1].signature;
  }
  all.reverse();
  const batch = all.slice(0, MAX_PER_RUN);
  console.log("new signatures:", all.length, "processing:", batch.length);

  for (const s of batch) {
    if (s.err) continue;
    const tx = await rpc("getTransaction", [s.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]);
    if (!tx || !tx.meta || tx.meta.err) continue;
    const keys = tx.transaction.message.accountKeys.map(k => (typeof k === "string" ? k : k.pubkey));
    let closed = 0, reclaimed = 0, fee = 0, dest = null;
    for (const ix of tx.transaction.message.instructions) {
      const p = ix.parsed;
      if (!p) continue;
      if ((ix.program === "spl-token" || ix.program === "spl-token-2022") && p.type === "closeAccount") {
        closed++;
        const idx = keys.indexOf(p.info.account);
        if (idx >= 0) reclaimed += Math.min(tx.meta.preBalances[idx], 4000000);
        dest = p.info.destination || dest;
      }
      if (ix.program === "stake" && p.type === "withdraw") { closed++; reclaimed += Math.min(Number(p.info.lamports || 0), 2282880); dest = p.info.destination || dest; }
      if (ix.program === "bpf-upgradeable-loader" && p.type === "close") { closed++; const bi = keys.indexOf(p.info.account); if (bi >= 0) reclaimed += tx.meta.preBalances[bi]; dest = p.info.recipient || p.info.destination || dest; }
      if (ix.program === "system" && p.type === "transfer" && p.info.destination === CFG.FEE_WALLET) fee += Number(p.info.lamports);
    }
    if (!closed) continue;
    S.totalReclaimed += reclaimed;
    S.totalFees += fee;
    S.accounts += closed;
    if (dest) seen.add(dest);
    S.recent.unshift({ w: dest ? short(dest) : "unknown", l: reclaimed, n: closed, t: tx.blockTime, f: fee, s: s.signature });
    S.sigs = (S.sigs || []).concat(s.signature).slice(-200); S.lastT = tx.blockTime;
    S.recent = S.recent.slice(0, 10);
  }
  if (batch.length) S.lastSig = batch[batch.length - 1].signature;
  S.wallets = seen.size;
  S._seen = [...seen];
  S.updated = new Date().toISOString(); delete S.error; delete S.errorAt;
  fs.writeFileSync("stats.json", JSON.stringify(S));
  console.log("done:", S.totalReclaimed, "lamports,", S.accounts, "accounts,", S.wallets, "wallets");
}
main().catch(e => {
  // a hibat beleirjuk a stats.json-ba, igy az oldalon (app.scratchly.cfd/stats.json) is lathato
  console.error(e);
  let S = {}; try { S = JSON.parse(fs.readFileSync("stats.json", "utf8")); } catch (x) {}
  let host = "?"; try { host = new URL(RPC).host; } catch (x) { host = "invalid RPC url"; }
  S.error = String(e && e.message ? e.message : e).slice(0, 300) + " [rpc: " + host + "]";
  S.errorAt = new Date().toISOString();
  fs.writeFileSync("stats.json", JSON.stringify(S));
  process.exit(0);
});
