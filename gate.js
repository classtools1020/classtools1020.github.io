/* 全站通關碼：沒輸入通關碼前看不到內容。
   預設只記到「關掉瀏覽器」為止（session cookie）；勾「這是我自己的電腦」才永久記住（localStorage）。
   這裡只放通關碼的 SHA-256，不放通關碼本身。 */
(function () {
  var HASH = "3b8618f72000bae051251bde92fb75d3e4017375abfe65d0f06dd647a36cd7b2";
  var KEY = "ct_gate2", CK = "ct_s";
  try { localStorage.removeItem("ct_gate"); } catch (e) {}   /* 舊版「永遠記住」一律作廢，公用電腦要重新輸入 */
  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}
  try { if (document.cookie.split("; ").indexOf(CK + "=" + HASH) >= 0) return; } catch (e) {}
  var root = document.documentElement;
  root.classList.add("ctlock");
  var st = document.createElement("style");
  st.textContent =
    "html.ctlock body>*:not(#ctgate){display:none!important}" +
    "html.ctlock body{background:#f4efe6!important;margin:0}" +
    "#ctgate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#f4efe6;font-family:'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif;color:#1f2a37}" +
    "#ctgate .box{text-align:center;padding:24px}" +
    "#ctgate .t{font-size:22px;font-weight:700;margin-bottom:16px}" +
    "#ctgate input{font-size:28px;letter-spacing:.3em;text-align:center;width:220px;padding:10px;border:2px solid #1f2a37;border-radius:10px;background:#fff;color:#1f2a37;font-family:inherit}" +
    "#ctgate button{display:block;margin:14px auto 0;font-size:20px;font-weight:700;padding:10px 34px;border:none;border-radius:10px;background:#1f2a37;color:#fff;cursor:pointer;font-family:inherit;touch-action:manipulation}" +
    "#ctgate .e{min-height:24px;margin-top:10px;color:#c8372d;font-weight:700}" +
    "#ctgate label{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px;font-size:17px;font-weight:700;cursor:pointer}" +
    "#ctgate label input{width:24px;height:24px;padding:0;letter-spacing:0;accent-color:#1f2a37}" +
    "#ctgate .s{font-size:14px;color:#5b6673;margin-top:6px}";
  (document.head || root).appendChild(st);
  function sha(t) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    });
  }
  function show() {
    if (document.getElementById("ctgate")) return;
    var g = document.createElement("div"); g.id = "ctgate";
    g.innerHTML = '<div class="box"><div class="t">請輸入通關碼</div><input id="ctcode" type="password" inputmode="numeric" autocomplete="off" maxlength="12"><button id="ctok">確定</button><label><input id="ctme" type="checkbox"> 這是我自己的電腦，記住我</label><div class="s">學校、公用電腦請不要勾：關掉瀏覽器就要重新輸入</div><div class="e" id="cterr"></div></div>';
    document.body.appendChild(g);
    var inp = document.getElementById("ctcode");
    function go() {
      sha(inp.value.trim()).then(function (h) {
        if (h === HASH) {
          if (document.getElementById("ctme").checked) { try { localStorage.setItem(KEY, HASH); } catch (e) {} }
          try { document.cookie = CK + "=" + HASH + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : ""); } catch (e) {}
          root.classList.remove("ctlock"); g.remove();
          try { dispatchEvent(new Event("resize")); } catch (e) {}
        } else { document.getElementById("cterr").textContent = "通關碼不正確"; inp.select(); }
      });
    }
    document.getElementById("ctok").onclick = go;
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    setTimeout(function () { inp.focus(); }, 50);
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
