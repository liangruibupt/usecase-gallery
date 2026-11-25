const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = (i) => String(i + 1).padStart(2, "0");
const modelName = (id) => id.replace(/^(us|eu|apac|global)\.anthropic\./, "");
const kTokens = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const LANGS = { all: "All languages", en: "English", zh: "中文" };
const READER_KINDS = { document: "Word", deck: "PowerPoint", sheet: "Excel", file: "File" };

let cases = [];
const state = { lang: "all", tag: "All", q: "" };
const views = new Map();

function cover(c) {
  if (c.cover) return `<img class="cover" src="${esc(c.cover)}" alt="" loading="lazy">`;
  const titles = c.doc_titles.length ? c.doc_titles : [c.title];
  return `<div class="doc-stack">${titles
    .map((t, i) => `<span style="transform: translate(${(titles.length - 1 - i) * 10}px, ${(titles.length - 1 - i) * -10}px) rotate(${(i - 1) * 2}deg)">${esc(t)}</span>`)
    .join("")}</div>`;
}

function matches(c) {
  const q = state.q.trim().toLowerCase();
  return (
    (state.lang === "all" || c.lang === state.lang) &&
    (state.tag === "All" || c.tags.includes(state.tag)) &&
    (!q || [c.title, c.summary, c.source.title, ...c.tags].join(" ").toLowerCase().includes(q))
  );
}

function topTags() {
  const count = new Map();
  cases.filter((c) => state.lang === "all" || c.lang === state.lang).forEach((c) => c.tags.forEach((t) => count.set(t, (count.get(t) || 0) + 1)));
  return ["All", ...[...count].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t)];
}

function cards(shown) {
  return (
    shown
      .map(
        (c, i) => `
      <a class="card" href="#/${esc(c.slug)}" lang="${c.lang === "zh" ? "zh-CN" : "en"}" style="animation-delay:${Math.min(i, 12) * 70}ms">
        <div class="no">${num(cases.indexOf(c))}<small>${esc(c.source.site)}<br>${esc(c.source.category)} · ${esc(c.source.published)}</small></div>
        <span class="stamp">Reproduced</span>
        <div class="cover-wrap">${cover(c)}</div>
        <div>
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.summary)}</p>
          <div class="meta">
            <span class="src">${esc(modelName(c.model))}</span>
            <span>${c.turns} turns</span>
            <span>${c.outputs} outputs</span>
          </div>
        </div>
      </a>`,
      )
      .join("") || `<p class="empty">Nothing matches.</p>`
  );
}

function renderIndex() {
  const langs = Object.keys(LANGS).filter((l) => l === "all" || cases.some((c) => c.lang === l));
  app.innerHTML = `
    <div class="toolbar">
      <span class="count"></span>
      <input class="search" type="search" placeholder="Search" value="${esc(state.q)}" aria-label="Search use cases">
    </div>
    <div class="toolbar filters">
      ${langs.map((l) => `<button class="filter" aria-pressed="${l === state.lang}" data-lang="${l}">${LANGS[l]}</button>`).join("")}
      <span class="sep"></span>
      ${topTags().map((t) => `<button class="filter" aria-pressed="${t === state.tag}" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}
    </div>
    <section class="grid"></section>`;
  const refresh = () => {
    const shown = cases.filter(matches);
    app.querySelector(".count").textContent = `${shown.length} of ${cases.length} use cases`;
    app.querySelector(".grid").innerHTML = cards(shown);
  };
  app.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { state.lang = b.dataset.lang; state.tag = "All"; renderIndex(); }));
  app.querySelectorAll("[data-tag]").forEach((b) => b.addEventListener("click", () => { state.tag = b.dataset.tag; renderIndex(); }));
  app.querySelector(".search").addEventListener("input", (e) => { state.q = e.target.value; refresh(); });
  refresh();
}

function plates(items) {
  return `<div class="plates">${items
    .map(
      (o) => `
      <figure class="plate">
        <a href="${esc(o.href)}" target="_blank" rel="noopener"><img src="${esc(o.preview)}" alt="${esc(o.name)}" loading="lazy"></a>
        <figcaption><span>${esc(o.name)}<br><small>${o.turn ? `Turn ${esc(o.turn)}` : "Input"}</small></span><span><a href="${esc(o.source)}" download>editable .svg ↓</a> <a href="${esc(o.href)}" download>.png ↓</a></span></figcaption>
      </figure>`,
    )
    .join("")}</div>`;
}

function pages(items) {
  return items
    .map(
      (o) => `
      <figure class="page-frame">
        <div class="frame-bar"><span>${esc(o.name)}${o.turn ? ` · turn ${esc(o.turn.slice(0, 2))}` : " · input"}</span><a class="btn" href="${esc(o.href)}" target="_blank" rel="noopener">Open full page ↗</a></div>
        <iframe src="${esc(o.href)}" sandbox="allow-scripts" loading="lazy" title="${esc(o.name)}"></iframe>
      </figure>`,
    )
    .join("");
}

function reader(items, id) {
  return `
    <div class="reader" data-reader="${id}">
      <ul class="doc-list">
        ${items
          .map(
            (d, i) => `<li><button data-doc="${i}" aria-current="${i === 0}"><span class="n">${num(i)}</span>${esc(d.title)}<small>${READER_KINDS[d.kind]} · ${esc(d.name)}${d.turn ? ` · turn ${esc(d.turn.slice(0, 2))}` : ""}</small></button></li>`,
          )
          .join("")}
      </ul>
      <div class="doc-pane">
        <div class="doc-tools"><a class="btn primary" data-dl download></a><a class="btn" data-src download>Source</a></div>
        <article class="doc-body"></article>
      </div>
    </div>`;
}

function wireReader(root, items) {
  const show = (i) => {
    root.querySelector(".doc-body").innerHTML = items[i].preview;
    const dl = root.querySelector("[data-dl]");
    dl.href = items[i].href;
    dl.textContent = `Download .${items[i].href.split(".").pop()}`;
    const src = root.querySelector("[data-src]");
    src.href = items[i].source;
    src.hidden = items[i].source === items[i].href;
    root.querySelectorAll("[data-doc]").forEach((b) => b.setAttribute("aria-current", String(+b.dataset.doc === i)));
  };
  root.querySelectorAll("[data-doc]").forEach((b) => b.addEventListener("click", () => show(+b.dataset.doc)));
  show(0);
}

const inReader = (items) => items.filter((o) => o.kind in READER_KINDS);

function fileGroups(items, id) {
  const of = (kind) => items.filter((o) => o.kind === kind);
  return [
    of("image").length ? plates(of("image")) : "",
    of("page").length ? pages(of("page")) : "",
    inReader(items).length ? reader(inReader(items), id) : "",
  ].join("");
}

function section(title, note, body) {
  return body ? `<div class="section-head"><h2>${title}</h2><span>${note}</span></div>${body}` : "";
}

function versionList(versions) {
  if (!versions?.length) return "";
  return `
    <ol class="versions">
      ${versions
        .map(
          (ver) => `
        <li>
          <div class="ver-name"><b>${esc(ver.name)}</b>${ver.turns.map((t) => `<small>${esc(t === "Input" ? "Input file" : `Turn ${t}`)}</small>`).join("")}</div>
          <div>
            <p>${esc(ver.change)}</p>
            <div class="made">${ver.files.map((f) => `<a href="${esc(f.href)}" download>${esc(f.name)}</a>`).join("")}</div>
          </div>
        </li>`,
        )
        .join("")}
    </ol>`;
}

function conversation(v) {
  return `
    <ol class="timeline">
      ${v.run.turns
        .map(
          (t, i) => `
        <li class="turn ${t.label === "Self-check" ? "check" : ""}">
          <div class="turn-label"><b>${num(i)}</b>${esc(t.label)}<span>${kTokens(t.usage.output)} tokens out · ${Math.round(t.seconds)}s</span></div>
          <div>
            <div class="prompt">${esc(t.prompt)}${(t.attached_inputs || []).length ? `<span class="attach">+ input files: ${t.attached_inputs.map(esc).join(", ")}</span>` : ""}${t.attached_images ? `<span class="attach">+ ${t.attached_images} rendered image(s) attached by the runner</span>` : ""}</div>
            <details class="reply" ${i < 2 ? "open" : ""}><summary>Model reply</summary><div class="reply-body">${t.reply_html}</div></details>
            ${t.files.length ? `<div class="made">${t.files.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
          </div>
        </li>`,
        )
        .join("")}
    </ol>`;
}

function renderCase(v) {
  document.documentElement.lang = v.lang === "zh" ? "zh-CN" : "en";
  app.innerHTML = `
    <a class="back" href="#/">← All use cases</a>
    <section class="hero">
      <div>
        <h1>${esc(v.title)}</h1>
        <p class="lede">${esc(v.summary)}</p>
      </div>
      <dl class="ledger">
        <div><dt>Source</dt><dd><a href="${esc(v.source.url)}" target="_blank" rel="noopener">${esc(v.source.title)}</a></dd></div>
        <div><dt>Published</dt><dd>${esc(v.source.site)} · ${esc(v.source.category)} · ${esc(v.source.published)}</dd></div>
        <div><dt>Original setup</dt><dd>${esc(v.source.original_setup)}</dd></div>
        <div class="vs"><dt>Reproduced with</dt><dd>${esc(modelName(v.model))} (${esc(v.provider)})</dd></div>
        <div><dt>Run</dt><dd>${v.turns} turns · ${kTokens(v.usage.input)} in / ${kTokens(v.usage.output)} out · ${Math.max(1, Math.round(v.seconds / 60))} min · ${esc(v.finished.slice(0, 10))}</dd></div>
        ${v.source.notes ? `<div><dt>Reproduction notes</dt><dd>${esc(v.source.notes)}</dd></div>` : ""}
      </dl>
    </section>
    ${section("Inputs", "files given to the model in the first turn", fileGroups(v.inputs, "in"))}
    ${section("Versions", "what changed from one version to the next", versionList(v.versions))}
    ${section("Outputs", `${v.outputs.length} files the model delivered`, fileGroups(v.outputs, "out"))}
    ${section("Conversation", "every prompt sent, every reply received", conversation(v))}`;
  app.querySelectorAll("[data-reader]").forEach((root) => wireReader(root, inReader(root.dataset.reader === "in" ? v.inputs : v.outputs)));
}

async function route() {
  const slug = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  window.scrollTo(0, 0);
  if (!slug) {
    document.documentElement.lang = "en";
    return renderIndex();
  }
  if (!cases.some((c) => c.slug === slug)) {
    app.innerHTML = `<p class="empty">No use case called “${esc(slug)}”. <a href="#/">Back to all</a></p>`;
    return;
  }
  if (!views.has(slug)) views.set(slug, fetch(`cases/${slug}/view.json`).then((r) => r.json()));
  renderCase(await views.get(slug));
}

fetch("gallery.json")
  .then((r) => r.json())
  .then((g) => {
    cases = g.cases;
    route();
    addEventListener("hashchange", route);
  })
  .catch(() => {
    app.innerHTML = `<p class="empty">gallery.json is missing. Run <code>python -m hub.build</code>, then serve this folder.</p>`;
  });
