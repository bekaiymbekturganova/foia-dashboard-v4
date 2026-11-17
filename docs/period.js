// Period bar (Bekaiym's design): a timeline of fiscal years at the top of the page.
// It drives the dashboard's own "Fiscal years [from] to [to]" input, which stays the single source of truth.
(function () {
  const CSS = `
.bk-period{flex:none;background:#fff;border:1px solid var(--b100,#e1eef8);border-radius:12px;padding:14px 20px 10px;margin:0 0 12px}
.bk-period .tl-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.bk-period .tl-title{font-weight:700;font-size:17px;color:var(--b950,#21304a)}
.bk-period .presets{display:flex;gap:6px;flex-wrap:wrap}
.bk-period .presets button{border:1px solid var(--b200,#c9e2f4);background:#fff;color:var(--b800,#355a98);font:inherit;font-size:13px;font-weight:600;padding:4px 10px;border-radius:999px;cursor:pointer}
.bk-period .presets button:hover,.bk-period .presets button.on{background:var(--b600,#4582cc);border-color:var(--b600,#4582cc);color:#fff}
.bk-period .track{position:relative;display:flex;justify-content:space-between;margin:14px 4px 2px}
.bk-period .rail{position:absolute;left:10px;right:10px;top:9px;height:4px;background:var(--b100,#e1eef8);border-radius:2px}
.bk-period .fill{position:absolute;top:9px;height:4px;background:var(--b600,#4582cc);border-radius:2px}
.bk-period .yr{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;background:none;border:0;font:inherit;padding:0;color:var(--muted,#5b6676);min-width:0;z-index:1}
.bk-period .yr .dot{width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--b300,#a4d0ec);transition:transform .1s}
.bk-period .yr.in .dot{border-color:var(--b600,#4582cc);background:var(--b200,#c9e2f4)}
.bk-period .yr.end .dot{background:var(--b600,#4582cc);border-color:var(--b600,#4582cc);box-shadow:0 0 0 4px var(--b100,#e1eef8)}
.bk-period .yr.in,.bk-period .yr.end{color:var(--ink,#21304a)}
.bk-period .yr.end{font-weight:700}
.bk-period .yr span{font-size:12px}
.bk-period .yr:hover .dot{transform:scale(1.12)}
.bk-period .tl-foot{font-size:12px;color:var(--muted,#5b6676);margin-top:6px}
.sidebar .years{display:none !important}
/* the period bar takes some height: let the page scroll instead of squeezing the charts */
.bslib-sidebar-layout > .main{overflow-y:auto !important}
.bslib-sidebar-layout > .main > .sidebar-content{flex:none !important;min-height:100%}
.bslib-sidebar-layout > .main > .sidebar-content > .bslib-grid{flex:none !important;min-height:calc(100vh - 80px)}
@media (max-width:900px){
  .bk-period{padding:12px}
  .bk-period .yr span{font-size:10px;writing-mode:vertical-rl;transform:rotate(180deg)}
  .bk-period .yr .dot{width:14px;height:14px;border-width:2px}
  .bk-period .rail,.bk-period .fill{top:6px}
}`;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  let box = null, selA = null, selB = null, years = [], pending = null;

  const current = () => {
    const a = +selA.value, b = +selB.value;
    return [Math.min(a, b), Math.max(a, b)];
  };
  // set the dashboard's own year inputs; its "change" handler updates the whole page
  const setRange = (a, b) => {
    selA.value = String(Math.min(a, b));
    selB.value = String(Math.max(a, b));
    selB.dispatchEvent(new Event("change", { bubbles: true }));
    draw();
  };

  function draw() {
    if (!box) return;
    const [y0, y1] = pending != null ? [pending, pending] : current();
    const last = years[years.length - 1];
    box.querySelector(".tl-title").textContent = y0 === y1 ? `Period: FY${y0}` : `Period: FY${y0} – FY${y1}`;
    const presets = [["All years", years[0], last], ["Last 10 years", last - 9, last], ["Last 5 years", last - 4, last], [`FY${last} only`, last, last]]
      .filter(([, a]) => a >= years[0]);
    const pre = box.querySelector(".presets");
    pre.replaceChildren(...presets.map(([label, a, b]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.classList.toggle("on", pending == null && a === y0 && b === y1);
      btn.onclick = () => { pending = null; setRange(a, b); };
      return btn;
    }));
    const track = box.querySelector(".track");
    const rail = document.createElement("div"); rail.className = "rail";
    const fill = document.createElement("div"); fill.className = "fill";
    const n = years.length - 1 || 1;
    const i0 = years.indexOf(y0), i1 = years.indexOf(y1);
    fill.style.left = `calc(10px + (100% - 20px) * ${i0 / n})`;
    fill.style.width = `calc((100% - 20px) * ${(i1 - i0) / n})`;
    track.replaceChildren(rail, fill, ...years.map(y => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "yr" + (y === y0 || y === y1 ? " end" : y > y0 && y < y1 ? " in" : "");
      b.title = `FY${y}`;
      b.innerHTML = '<div class="dot"></div><span></span>';
      b.querySelector("span").textContent = y;
      b.onclick = () => {
        if (pending == null) { pending = y; draw(); }
        else { const a = pending; pending = null; setRange(a, y); }
      };
      return b;
    }));
    box.querySelector(".tl-foot").textContent = pending != null
      ? `Start: FY${pending}. Now click the end year (or the same year for one year)`
      : "Click a start year, then an end year · or use the buttons";
  }

  function mount() {
    const wrap = document.querySelector(".sidebar .years");
    const host = document.querySelector(".bslib-sidebar-layout > .main > .sidebar-content");
    if (!wrap || !host) return false;
    const sels = wrap.querySelectorAll("select");
    if (sels.length < 2) return false;
    [selA, selB] = sels;
    years = [...selA.options].map(o => +o.value).filter(Number.isFinite).sort((a, b) => a - b);
    if (!years.length) return false;
    box = document.createElement("section");
    box.className = "bk-period";
    box.setAttribute("aria-label", "Period");
    box.innerHTML = '<div class="tl-head"><div class="tl-title"></div><div class="presets"></div></div><div class="track"></div><div class="tl-foot"></div>';
    host.prepend(box);
    selA.addEventListener("change", draw);
    selB.addEventListener("change", draw);
    draw();
    return true;
  }

  // the dashboard builds its inputs after the data loads: wait for them
  const start = () => {
    if (mount()) return;
    const obs = new MutationObserver(() => { if (mount()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
