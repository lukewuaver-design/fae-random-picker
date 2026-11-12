// 雲端代理：替抽籤頁對 MTBOX 送「切換設定檔」CGI 指令
// 做法參考 mt-camera-control 的 api/proxy.js，但 IP、帳密由使用者在頁面上填（不寫死在程式裡）。
// 安全限制：只會送 request=setProfile&profile=N 這一個指令，不轉送設備的回應內容，
//           也不連本機／區網位址（Vercel 本來就連不到區網，區網請用頁面上的「區網直連」）。

const HOST_RE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*(:\d{1,5})?$/i;

function isLocalHost(host) {
  const h = host.replace(/:\d+$/, '').toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const a = +m[1], b = +m[2];
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: '只接受 POST' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const host = String(body.host || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const user = String(body.user || '');
  const pass = String(body.pass || '');
  const profile = Number(body.profile);

  if (!HOST_RE.test(host)) return res.status(400).json({ ok: false, error: 'MTBOX IP 格式不對' });
  if (isLocalHost(host)) return res.status(400).json({ ok: false, error: '這是區網 IP，雲端連不到，請改用「區網直連」' });
  if (!Number.isInteger(profile) || profile < 1 || profile > 36) return res.status(400).json({ ok: false, error: '設定檔編號要在 1–36' });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(`http://${host}/request=setProfile&profile=${profile}`, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') },
    });
    if (r.status === 401 || r.status === 403) return res.status(200).json({ ok: false, status: r.status, error: '帳號或密碼不對' });
    if (!r.ok) return res.status(200).json({ ok: false, status: r.status, error: `MTBOX 回應 HTTP ${r.status}` });
    return res.status(200).json({ ok: true, status: r.status, profile });
  } catch (e) {
    const msg = e && e.name === 'AbortError' ? '連線逾時（6 秒沒回應）' : '連不到 MTBOX';
    return res.status(200).json({ ok: false, error: msg });
  } finally {
    clearTimeout(timer);
  }
};
