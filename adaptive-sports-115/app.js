/* 成績公告頁：資料來源是一份 Google 試算表（成績登打表）。
 * 同事在試算表填學校並在「公布」欄打 V，這頁每 20 秒自動讀取，只顯示已公布的列。 */
import { renderResultsTable, renderSpiritList, esc, fmtTime, FLAG_SVG } from './results-table.js';

const SHEET_ID = '1lj7sc9EZZIIZT8ofp3pXNpLuj0wjnZT16mjpKn6s_BQ';
const SHEET_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1`;
const POLL_MS = 20000;
const DIVISIONS = [
  { id: 1, code: 'elementary', name: '國小組', award_places: 8, spirit_places: 8 },
  { id: 2, code: 'junior', name: '國中組', award_places: 3, spirit_places: 3 },
];
const KNOCKOUT = ['沙包投擲賽'];
const $ = (s) => document.querySelector(s);

const state = { data: null, lastText: null, changedAt: null, divisionId: 1, itemId: '', query: '', lastOk: null, failing: false };

// 本機測試時可用 ?src=xxx.csv 指定資料來源
const srcOverride = ['localhost', '127.0.0.1'].includes(location.hostname) ? new URLSearchParams(location.search).get('src') : null;

// ---------- CSV 解析 ----------
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const truthy = (v) => /^(v|V|✓|✔|true|TRUE|是|1|o|O|公布|已公布|y|Y)$/.test(String(v || '').trim());

/** 把試算表整理成頁面需要的結構。 */
function buildData(text) {
  const rows = parseCsv(text).map((r) => r.map((c) => String(c ?? '').trim()));
  const head = rows.shift() || [];
  const col = (name, fallback) => { const i = head.indexOf(name); return i >= 0 ? i : fallback; };
  const C = { div: col('組別', 0), item: col('項目', 1), rank: col('名次', 2), school: col('學校', 3), score: col('成績', 4), remark: col('備註', 5), pub: col('公布', 6) };
  const items = [];
  const itemByName = new Map();
  const buckets = new Map();
  let announcement = '';
  for (const r of rows) {
    const div = r[C.div];
    if (!div) continue;
    if (div === '公告') { if (truthy(r[C.pub]) && r[C.school]) announcement = r[C.school]; continue; }
    const d = DIVISIONS.find((x) => x.name === div || x.name.startsWith(div));
    const name = r[C.item];
    if (!d || !name) continue;
    if (!itemByName.has(name)) {
      const it = { id: items.length + 1, name, kind: name === '精神總錦標' ? 'spirit' : KNOCKOUT.includes(name) ? 'knockout' : 'ranked', score_unit: null };
      items.push(it); itemByName.set(name, it);
    }
    const it = itemByName.get(name);
    const rank = parseInt(r[C.rank], 10);
    const school = r[C.school];
    if (!truthy(r[C.pub]) || !school || !Number.isInteger(rank) || rank < 1) continue;
    const key = `${d.id}:${it.id}`;
    if (!buckets.has(key)) buckets.set(key, { division_id: d.id, item_id: it.id, revision: 1, published_at: null, rows: [] });
    buckets.get(key).rows.push({ rank, tied: false, school, label: '', score: r[C.score] || null, remark: r[C.remark] || null });
  }
  const results = [];
  for (const b of buckets.values()) {
    const count = {};
    b.rows.forEach((x) => { count[x.rank] = (count[x.rank] || 0) + 1; });
    b.rows.forEach((x) => { x.tied = count[x.rank] > 1; });
    b.rows.sort((a, c) => a.rank - c.rank || a.school.localeCompare(c.school, 'zh-Hant'));
    results.push(b);
  }
  // 精神總錦標排最後
  items.sort((a, b) => (a.kind === 'spirit') - (b.kind === 'spirit'));
  return { announcement, divisions: DIVISIONS, items, results };
}

// ---------- 讀取 ----------
async function fetchResults() {
  let res;
  try {
    res = await fetch(srcOverride || `${SHEET_CSV}&_=${Date.now()}`, { cache: 'no-store' });
  } catch {
    return setFailure('無法連線');
  }
  if (!res.ok) return setFailure(`回應 ${res.status}`);
  const text = await res.text();
  if (text.trim().startsWith('<')) return setFailure('試算表尚未開放「知道連結的任何人可檢視」');
  if (text !== state.lastText) {
    state.lastText = text;
    state.changedAt = new Date();
    state.data = buildData(text);
    renderAll();
  }
  setOk();
}

function setOk() { state.lastOk = new Date(); state.failing = false; $('#error-banner').hidden = true; renderStatus(); }
function setFailure(msg) {
  state.failing = true;
  const b = $('#error-banner');
  b.hidden = false;
  b.textContent = `更新失敗（${msg}）。${state.lastOk ? `目前顯示的是 ${fmtTime(state.lastOk)} 取得的資料，` : ''}系統將自動重試，或請重新整理頁面。`;
  renderStatus();
}
function renderStatus() {
  const el = $('#update-status');
  if (state.failing) el.innerHTML = '<span class="dot err"></span>更新失敗';
  else if (state.data?.results.length) el.innerHTML = `<span class="dot"></span>最後更新：${fmtTime(state.changedAt)}　<span class="help">每 20 秒自動檢查</span>`;
  else el.innerHTML = '<span class="dot"></span>目前尚無已公布成績　<span class="help">每 20 秒自動檢查</span>';
}

// ---------- 渲染 ----------
function currentDivision() { return DIVISIONS.find((d) => d.id === state.divisionId) || DIVISIONS[0]; }

function renderAll() {
  const { announcement, items, results } = state.data;
  $('#division-seg').innerHTML = DIVISIONS.map((d) => `<button type="button" data-id="${d.id}" aria-pressed="${d.id === state.divisionId}">${esc(d.name)}</button>`).join('');
  const sel = $('#item-select');
  const opts = ['<option value="">全部項目</option>', ...items.map((i) => `<option value="${i.id}">${esc(i.name)}</option>`)].join('');
  if (sel.innerHTML !== opts) sel.innerHTML = opts;
  sel.value = state.itemId;
  $('#school-search').value = state.query;
  $('#hero-stats').innerHTML = `<span><b>${results.length}</b> / ${items.length * DIVISIONS.length} 項已公布</span>${state.changedAt ? `<span>最後更新 <b>${fmtTime(state.changedAt)}</b></span>` : ''}`;
  const an = $('#announce');
  if (announcement) { an.hidden = false; $('#announce-text').textContent = announcement; } else an.hidden = true;
  renderResults();
}

function renderResults() {
  if (!state.data) return;
  const d = currentDivision();
  const { items, results } = state.data;
  const q = state.query.trim();
  $('#award-rule').textContent = `${d.name}：核定前 ${d.award_places} 名（前三名頒獎牌、獎狀及獎品${d.award_places > 3 ? `，第 4–${d.award_places} 名頒獎狀` : ''}），精神總錦標前 ${d.spirit_places} 名頒錦旗`;
  $('#print-note').textContent = `115年度新竹縣第23屆特殊教育學生適應體育趣味運動競賽｜${d.name}｜列印時間 ${fmtTime(new Date())}`;
  const blocks = [];
  let any = false;
  for (const item of items.filter((i) => !state.itemId || String(i.id) === String(state.itemId))) {
    const r = results.find((x) => x.division_id === d.id && x.item_id === item.id);
    let rows = r?.rows || [];
    if (q) rows = rows.filter((x) => x.school.includes(q));
    if (q && !rows.length) continue;
    any = true;
    if (item.kind === 'spirit') {
      blocks.push(`<section class="section spirit" aria-labelledby="item-${item.id}">
        <div class="section-head"><h2 id="item-${item.id}">${FLAG_SVG}${esc(item.name)}<span class="visually-hidden">（${esc(d.name)}）</span></h2><span class="tag tag-navy">前 ${d.spirit_places} 名頒錦旗</span></div>
        ${renderSpiritList({ rows, division: d, query: q })}</section>`);
    } else {
      blocks.push(`<section class="section" aria-labelledby="item-${item.id}">
        <div class="section-head"><h2 id="item-${item.id}">${esc(item.name)}</h2>${item.kind === 'knockout' ? '<span class="tag">單淘汰賽</span>' : ''}</div>
        ${renderResultsTable({ rows, division: d, item, query: q })}</section>`);
    }
  }
  if (!any) blocks.push(`<div class="section"><p class="empty">${q ? `找不到包含「${esc(q)}」的已公布成績。` : '<strong>成績尚未公告</strong>'}</p></div>`);
  $('#results').innerHTML = blocks.join('');
}

// ---------- 事件 ----------
$('#division-seg').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  state.divisionId = Number(b.dataset.id);
  $('#division-seg').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  renderResults();
});
$('#item-select').addEventListener('change', (e) => { state.itemId = e.target.value; renderResults(); });
$('#school-search').addEventListener('input', (e) => { state.query = e.target.value; renderResults(); });
$('#btn-print').addEventListener('click', () => window.print());
$('#btn-qr').addEventListener('click', () => $('#qr-dialog').showModal());
$('#btn-qr-close').addEventListener('click', () => $('#qr-dialog').close());
$('#btn-copy-url').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#qr-url').textContent); $('#btn-copy-url').textContent = '已複製'; } catch { /* ignore */ }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchResults(); });
window.addEventListener('online', fetchResults);

fetchResults();
setInterval(fetchResults, POLL_MS);
