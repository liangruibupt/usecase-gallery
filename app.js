const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = (i) => String(i + 1).padStart(2, "0");
const modelName = (id) => id.replace(/^(us|eu|apac|global)\.anthropic\./, "");
const kTokens = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

let cases = [];
let filter = "All";

function totals(run) {
  return run.turns.reduce(
    (t, x) => ({ input: t.input + x.usage.input, output: t.output + x.usage.output, seconds: t.seconds + x.seconds }),
    { input: 0, output: 0, seconds: 0 },
  );
}

function cover(c) {
  if (c.cover) return `<img class="cover" src="${esc(c.cover)}" alt="" loading="lazy">`;
  const docs = c.outputs.filter((o) => o.kind === "document").slice(0, 3);
  return `<div class="doc-stack">${docs
    .map((d, i) => `<span style="transform: translate(${(docs.length - 1 - i) * 10}px, ${(docs.length - 1 - i) * -10}px) rotate(${(i - 1) * 2}deg)">${esc(d.title)}</span>`)
    .join("")}</div>`;
}

function renderIndex() {
  const tags = ["All", ...new Set(cases.flatMap((c) => [c.source.site, ...c.tags]))];
  const shown = cases.filter((c) => filter === "All" || c.source.site === filter || c.tags.includes(filter));
  app.innerHTML = `
    <div class="toolbar">
      <span class="count">${shown.length} of ${cases.length} use cases</span>
      ${tags.map((t) => `<button class="filter" aria-pressed="${t === filter}" data-filter="${esc(t)}">${esc(t)}</button>`).join("")}
    </div>
    <section class="grid">
      ${shown
        .map(
          (c, i) => `
        <a class="card" href="#/${esc(c.slug)}" style="animation-delay:${i * 90}ms">
          <div class="no">${num(cases.indexOf(c))}<small>${esc(c.source.site)}<br>${esc(c.source.category)} · ${esc(c.source.published)}</small></div>
          <span class="stamp">Reproduced</span>
          <div class="cover-wrap">${cover(c)}</div>
          <div>
            <h2>${esc(c.title)}</h2>
            <p>${esc(c.summary)}</p>
            <div class="meta">
              <span class="src">${esc(modelName(c.run.model))}</span>
              <span>${c.run.turns.length} turns</span>
              <span>${c.outputs.length} outputs</span>
            </div>
          </div>
        </a>`,
        )
        .join("")}
    </section>`;
  app.querySelectorAll(".filter").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.filter;
      renderIndex();
    }),
  );
}

function images(c) {
  const imgs = c.outputs.filter((o) => o.kind === "image");
  if (!imgs.length) return "";
  return `
    <div class="section-head"><h2>Outputs</h2><span>${imgs.length} images · click to open full size</span></div>
    <div class="plates">
      ${imgs
        .map(
          (o) => `
        <figure class="plate">
          <a href="${esc(o.href)}" target="_blank" rel="noopener"><img src="${esc(o.preview)}" alt="${esc(o.name)}" loading="lazy"></a>
          <figcaption><span>${esc(o.name)}<br><small>Turn ${esc(o.turn)}</small></span><a href="${esc(o.source)}" download>editable .svg ↓</a> <a href="${esc(o.href)}" download>300 DPI .png ↓</a></figcaption>
        </figure>`,
        )
        .join("")}
    </div>`;
}

function documents(c) {
  const docs = c.outputs.filter((o) => o.kind === "document");
  if (!docs.length) return "";
  return `
    <div class="section-head"><h2>Documents</h2><span>${docs.length} editable Word files</span></div>
    <div class="reader">
      <ul class="doc-list">
        ${docs
          .map(
            (d, i) => `<li><button data-doc="${i}" aria-current="${i === 0}"><span class="n">${num(i)}</span>${esc(d.title)}<small>${esc(d.name)} · turn ${esc(d.turn.slice(0, 2))}</small></button></li>`,
          )
          .join("")}
      </ul>
      <div class="doc-pane">
        <div class="doc-tools"><a class="btn primary" id="dl-docx" download>Download .docx</a><a class="btn" id="dl-md" download>Markdown</a></div>
        <article class="doc-body" id="doc-body"></article>
      </div>
    </div>`;
}

function conversation(c) {
  return `
    <div class="section-head"><h2>Conversation</h2><span>every prompt sent, every reply received</span></div>
    <ol class="timeline">
      ${c.run.turns
        .map(
          (t, i) => `
        <li class="turn ${t.label === "Self-check" ? "check" : ""}">
          <div class="turn-label"><b>${num(i)}</b>${esc(t.label)}<span>${kTokens(t.usage.output)} tokens out · ${Math.round(t.seconds)}s</span></div>
          <div>
            <div class="prompt">${esc(t.prompt)}${t.attached_images ? `<span class="attach">+ ${t.attached_images} rendered image(s) attached by the runner</span>` : ""}</div>
            <details class="reply" ${i < 2 ? "open" : ""}><summary>Model reply</summary><div class="reply-body">${t.reply_html}</div></details>
            ${t.files.length ? `<div class="made">${t.files.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
          </div>
        </li>`,
        )
        .join("")}
    </ol>`;
}

function renderCase(c) {
  const t = totals(c.run);
  app.innerHTML = `
    <a class="back" href="#/">← All use cases</a>
    <section class="hero">
      <div>
        <h1>${esc(c.title)}</h1>
        <p class="lede">${esc(c.summary)}</p>
      </div>
      <dl class="ledger">
        <div><dt>Source</dt><dd><a href="${esc(c.source.url)}" target="_blank" rel="noopener">${esc(c.source.title)}</a></dd></div>
        <div><dt>Published</dt><dd>${esc(c.source.site)} · ${esc(c.source.category)} · ${esc(c.source.published)}</dd></div>
        <div><dt>Original setup</dt><dd>${esc(c.source.original_setup)}</dd></div>
        <div class="vs"><dt>Reproduced with</dt><dd>${esc(modelName(c.run.model))} (${esc(c.run.provider)})</dd></div>
        <div><dt>Run</dt><dd>${c.run.turns.length} turns · ${kTokens(t.input)} in / ${kTokens(t.output)} out · ${Math.round(t.seconds / 60)} min · ${esc(c.run.finished.slice(0, 10))}</dd></div>
      </dl>
    </section>
    ${images(c)}
    ${documents(c)}
    ${conversation(c)}`;

  const docs = c.outputs.filter((o) => o.kind === "document");
  const show = (i) => {
    document.getElementById("doc-body").innerHTML = docs[i].preview;
    document.getElementById("dl-docx").href = docs[i].href;
    document.getElementById("dl-md").href = docs[i].source;
    app.querySelectorAll("[data-doc]").forEach((b) => b.setAttribute("aria-current", String(+b.dataset.doc === i)));
  };
  app.querySelectorAll("[data-doc]").forEach((b) => b.addEventListener("click", () => show(+b.dataset.doc)));
  if (docs.length) show(0);
}

function route() {
  const slug = location.hash.replace(/^#\/?/, "");
  const c = cases.find((x) => x.slug === slug);
  if (slug && !c) app.innerHTML = `<p class="empty">No use case called “${esc(slug)}”. <a href="#/">Back to all</a></p>`;
  else if (c) renderCase(c);
  else renderIndex();
  window.scrollTo(0, 0);
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
