// Search box for the long Agency and Component lists in the sidebar.
// Typing filters the names (also matches initials, e.g. "DHS"); picking one sets the dashboard's own dropdown.
(function () {
  const CSS = `
.bk-search{position:relative;margin:0 0 6px}
.bk-search input{width:100%;padding:8px 10px 8px 32px;border:1px solid var(--b200,#c9e2f4);border-radius:8px;font:inherit;font-size:15px;color:var(--ink,#21304a);background:#fff}
.bk-search input:focus{outline:2px solid var(--b400,#78b7e2);outline-offset:0}
.bk-search .ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--b700,#3a6ebb);pointer-events:none}
.bk-search .list{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:1000;background:#fff;border:1px solid var(--b200,#c9e2f4);border-radius:8px;box-shadow:0 6px 18px rgba(33,48,74,.12);max-height:300px;overflow-y:auto;display:none}
.bk-search .list.open{display:block}
.bk-search .item{padding:7px 10px;font-size:14px;line-height:1.3;cursor:pointer;color:var(--ink,#21304a)}
.bk-search .item:hover,.bk-search .item.on{background:var(--b50,#f2f7fc)}
.bk-search .item mark{background:var(--b100,#e1eef8);color:inherit;padding:0;border-radius:2px}
.bk-search .empty{padding:7px 10px;font-size:13px;color:var(--muted,#5b6676)}
.sidebar .bk-search input{padding-left:32px !important}
.bk-search:has(+ select:disabled){display:none}`;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const SMALL = new Set(["of", "the", "and", "for", "on", "in", "to", "a", "an", "&"]);
  const initials = t => t.replace(/\(.*?\)/g, " ").split(/[\s,\-\/]+/).filter(w => w && !SMALL.has(w.toLowerCase()) && /^[A-Za-z]/.test(w)).map(w => w[0]).join("").toUpperCase();
  const LABELS = ["agency", "component"];

  function labelOf(select) {
    const form = select.closest("form");
    const lab = form && form.querySelector("label");
    return lab ? lab.textContent.trim().toLowerCase() : "";
  }

  function attach(select) {
    if (select.dataset.bkSearch) return;
    select.dataset.bkSearch = "1";
    const kind = labelOf(select);
    const box = document.createElement("div");
    box.className = "bk-search";
    box.innerHTML = '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg><input type="search" autocomplete="off"><div class="list" role="listbox"></div>';
    const input = box.querySelector("input");
    const list = box.querySelector(".list");
    input.placeholder = kind === "component" ? "Search components…" : "Search, e.g. DHS or Justice";
    input.setAttribute("aria-label", input.placeholder);
    select.parentElement.insertBefore(box, select);
    let hits = [], active = 0;

    const options = () => [...select.options].filter(o => !o.disabled).map(o => ({ value: o.value, text: o.textContent.trim(), ini: initials(o.textContent) }));
    const pick = o => {
      select.value = o.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      input.value = "";
      close();
    };
    const close = () => { list.classList.remove("open"); hits = []; };
    const render = () => {
      const q = input.value.trim();
      if (!q) { close(); return; }
      const ql = q.toLowerCase(), qu = q.toUpperCase();
      hits = options().filter(o => o.text.toLowerCase().includes(ql) || (q.length >= 2 && o.ini.startsWith(qu)))
        .sort((a, b) => (b.ini === qu) - (a.ini === qu) || a.text.toLowerCase().indexOf(ql) - b.text.toLowerCase().indexOf(ql))
        .slice(0, 50);
      active = 0;
      list.replaceChildren();
      if (!hits.length) {
        const e = document.createElement("div"); e.className = "empty"; e.textContent = "No match"; list.append(e);
      }
      hits.forEach((o, i) => {
        const d = document.createElement("div");
        d.className = "item" + (i === active ? " on" : "");
        d.setAttribute("role", "option");
        const at = o.text.toLowerCase().indexOf(ql);
        if (at >= 0) {
          const m = document.createElement("mark"); m.textContent = o.text.slice(at, at + q.length);
          d.append(o.text.slice(0, at), m, o.text.slice(at + q.length));
        } else d.textContent = o.text;
        d.addEventListener("mousedown", ev => { ev.preventDefault(); pick(o); });
        list.append(d);
      });
      list.classList.add("open");
    };
    const highlight = () => list.querySelectorAll(".item").forEach((d, i) => { d.classList.toggle("on", i === active); if (i === active) d.scrollIntoView({ block: "nearest" }); });
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", () => setTimeout(close, 120));
    input.addEventListener("keydown", ev => {
      if (!hits.length) { if (ev.key === "Escape") input.value = ""; return; }
      if (ev.key === "ArrowDown") { active = Math.min(hits.length - 1, active + 1); highlight(); ev.preventDefault(); }
      else if (ev.key === "ArrowUp") { active = Math.max(0, active - 1); highlight(); ev.preventDefault(); }
      else if (ev.key === "Enter") { pick(hits[active]); ev.preventDefault(); }
      else if (ev.key === "Escape") { input.value = ""; close(); }
    });
  }

  // the dashboard (re)builds these dropdowns as choices change: attach to each new one
  const scan = () => document.querySelectorAll(".sidebar form select:not([multiple])").forEach(s => {
    if (LABELS.includes(labelOf(s))) attach(s);
  });
  const start = () => {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
