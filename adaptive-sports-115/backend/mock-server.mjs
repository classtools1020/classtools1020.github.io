/* 本機測試用：用 Node 模擬 Apps Script 環境，直接執行 Code.gs 的真實邏輯（記憶體試算表）。
 * 用法：node backend/mock-server.mjs [port]  → http://localhost:8091/exec */
import fs from 'node:fs';
import http from 'node:http';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(dir, 'Code.gs'), 'utf8');

// ---- 迷你 SpreadsheetApp ----
const sheets = new Map();
class Range {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = this.sh.rows[this.r - 1 + i] || []; out.push(Array.from({ length: this.nc }, (_, j) => row[this.c - 1 + j] ?? '')); } return out; }
  setValues(v) { for (let i = 0; i < v.length; i++) { const idx = this.r - 1 + i; while (this.sh.rows.length <= idx) this.sh.rows.push([]); for (let j = 0; j < v[i].length; j++) this.sh.rows[idx][this.c - 1 + j] = v[i][j]; } return this; }
  setValue(v) { return this.setValues([[v]]); }
  setFontWeight() { return this; }
}
class Sheet {
  constructor(name) { this.name = name; this.rows = []; }
  appendRow(r) { this.rows.push([...r]); return this; }
  getLastRow() { return this.rows.length; }
  getLastColumn() { return Math.max(1, ...this.rows.map((r) => r.length)); }
  getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
  deleteRow(i) { this.rows.splice(i - 1, 1); }
  setFrozenRows() {}
}
const SpreadsheetApp = { getActive: () => ({ getSheetByName: (n) => sheets.get(n) || null, insertSheet: (n) => { const s = new Sheet(n); sheets.set(n, s); return s; } }) };
const ContentService = { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this; } }) };
const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
const Utilities = { formatDate: (d) => new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 19).replace('T', ' ') };
const ctx = { SpreadsheetApp, ContentService, LockService, Utilities, console };
vm.createContext(ctx);
vm.runInContext(code, ctx);
console.log(ctx.setup());
console.log('人員：', JSON.stringify(sheets.get('人員').rows.slice(1)));

const port = Number(process.argv[2] || 8091);
http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8' };
  const url = new URL(req.url, `http://localhost:${port}`);
  if (req.method === 'GET') {
    const out = ctx.doGet({ parameter: Object.fromEntries(url.searchParams) });
    res.writeHead(200, cors); res.end(out.text); return;
  }
  let body = '';
  req.on('data', (d) => { body += d; });
  req.on('end', () => { const out = ctx.doPost({ postData: { contents: body } }); res.writeHead(200, cors); res.end(out.text); });
}).listen(port, () => console.log(`mock Apps Script: http://localhost:${port}/exec`));
