/* 本機測試用：以本機 PostgreSQL 模擬 Supabase 的 PostgREST（只實作本系統用到的 view 與 rpc）。
 * 用法：DATABASE_URL=postgres://... node backend/mock-postgrest.mjs 8092 */
import http from 'node:http';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/classtools1020/adaptive-sports-results-115/package.json');
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.argv[2] || 8092);
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Content-Type': 'application/json' };
http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, `http://localhost:${port}`);
  const m = url.pathname.match(/^\/rest\/v1\/(rpc\/)?([a-z_]+)$/);
  if (!m) { res.writeHead(404, cors); return res.end('{}'); }
  try {
    if (m[1]) {
      let body = ''; for await (const c of req) body += c;
      const args = JSON.parse(body || '{}');
      const names = Object.keys(args);
      const sql = `select ${m[2]}(${names.map((n, i) => `${n} => $${i + 1}`).join(', ')}) as r`;
      const { rows } = await pool.query(sql, names.map((n) => (typeof args[n] === 'object' ? JSON.stringify(args[n]) : args[n])));
      res.writeHead(200, cors); return res.end(JSON.stringify(rows[0].r));
    }
    const order = url.searchParams.get('order');
    const client = await pool.connect();
    try {
      await client.query('set role anon');
      const { rows } = await client.query(`select * from ${m[2]}${order ? ` order by ${order.replace(/[^a-z_,]/g, '')}` : ''}`);
      res.writeHead(200, cors); res.end(JSON.stringify(rows));
    } finally { await client.query('reset role'); client.release(); }
  } catch (e) { res.writeHead(400, cors); res.end(JSON.stringify({ message: e.message })); }
}).listen(port, () => console.log(`mock PostgREST on ${port}`));
