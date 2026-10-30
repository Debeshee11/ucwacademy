/* Admin: add funds and upload each month's portfolio holdings. Everything else (fund pages, changes, the holdings quiz) follows from this. */
import { h, toast } from "./dom.js";
import { D } from "./data.js";
import { db } from "./fb.js";
import * as Store from "./store.js";
import { page, notFound, isAdmin } from "./ui.js";
import { parseHoldings, loadLive, monthsOf, monthLabel, fundIds, fundName, slug } from "./holdings.js";

const thisMonth = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };

export function fundData() {
  if (!isAdmin()) return notFound("Only the administrator can open this.");
  const host = h("div", { class: "stack stack-xl" });
  const field = (label, el) => h("div", { class: "field" }, h("label", {}, label), el);
  const inp = (ph, extra = {}) => h("input", { class: "input", placeholder: ph, ...extra });

  function paint() {
    const ids = fundIds();
    const fundSel = h("select", { class: "input" }, [...ids.map(id => h("option", { value: id }, fundName(id))), h("option", { value: "+new" }, "＋ A fund not in the list")]);
    const month = inp("", { type: "month", value: thisMonth() });
    const nName = inp("Fund name, e.g. Parag Parikh Flexi Cap Fund"), nHouse = inp("Fund house, e.g. PPFAS Mutual Fund"), nCat = inp("Category, e.g. Equity: Flexi Cap"), nPdf = inp("Link to the official factsheet (optional)");
    const nBox = h("div", { class: "stack", hidden: true }, field("Fund name", nName), field("Fund house", nHouse), field("Category", nCat), field("Factsheet link", nPdf));
    const text = h("textarea", { class: "input", rows: 10, placeholder: "Paste two columns from the fund house's monthly portfolio file:\nSecurity name        % to NAV\nHDFC Bank Ltd        8.25\nICICI Bank Ltd       6.10" });
    const preview = h("div", { class: "stack stack-xs" }), save = h("button", { class: "btn primary", disabled: true }, "Save this month");
    let parsed = null;
    fundSel.addEventListener("change", () => { nBox.hidden = fundSel.value !== "+new"; });
    text.addEventListener("input", () => {
      parsed = parseHoldings(text.value); const p = parsed;
      preview.replaceChildren(...(p.rows.length ? [
        h("p", {}, h("b", {}, p.rows.length + " holdings"), ` · total ${p.total}%`, p.total < 90 || p.total > 101 ? h("span", { class: "error" }, "  Check the paste: a full portfolio adds up to about 100%.") : null),
        h("p", { class: "small mute" }, "Top: " + p.rows.slice(0, 4).map(r => `${r[0]} ${r[1]}%`).join(" · ")), p.skipped.length ? h("p", { class: "tiny mute" }, `${p.skipped.length} lines skipped (headers or totals).`) : null] : [h("p", { class: "mute" }, "Nothing readable yet.")]));
      save.disabled = !p.rows.length;
    });
    save.addEventListener("click", async () => {
      const d = db(); if (!d || !parsed?.rows.length) return;
      let id = fundSel.value;
      try {
        save.disabled = true; save.textContent = "Saving…";
        if (id === "+new") {
          if (!nName.value.trim()) throw new Error("Enter the fund name.");
          id = slug(nName.value);
          await d.doc("fundx/" + id).set({ name: nName.value.trim(), house: nHouse.value.trim(), category: nCat.value.trim(), pdf: nPdf.value.trim(), updated: Date.now() });
        }
        if (!month.value) throw new Error("Pick the month.");
        await d.doc(`fundmonths/${id}__${month.value}`).set({ fund: id, month: month.value, asOf: monthLabel(month.value), holdings: parsed.rows, by: Store.userEmail(), updated: Date.now() });
        await loadLive(); toast("Saved " + fundName(id) + " · " + monthLabel(month.value)); paint();
      } catch (e) { toast(e.message || "Could not save. Publish the latest firestore.rules."); save.disabled = false; save.textContent = "Save this month"; }
    });
    const saved = ids.flatMap(id => Object.keys(D.live.months[id] || {}).map(m => [id, m])).sort((a, b) => b[1].localeCompare(a[1]) || a[0].localeCompare(b[0]));
    host.replaceChildren(
      h("section", { class: "lib-panel" }, h("h2", { class: "lib-ptitle" }, "Upload a month's holdings"),
        h("ol", { class: "lib-bullets small" }, ["Download the fund's monthly portfolio from the fund house website (published within 10 days of month end).", "In Excel, select the security name and % to NAV columns and copy.", "Choose the fund and month, paste below, check the preview, Save."].map(t => h("li", {}, t))),
        field("Fund", fundSel), nBox, field("Month of the portfolio", month), field("Paste holdings", text), preview, save),
      h("section", { class: "lib-panel" }, h("h2", { class: "lib-ptitle" }, "Saved months"),
        saved.length ? h("ul", { class: "lib-rows" }, saved.map(([id, m]) => h("li", { class: "row-flex between" }, h("span", {}, h("b", {}, fundName(id)), ` · ${monthLabel(m)} · ${D.live.months[id][m].holdings.length} holdings`),
          h("button", { class: "btn ghost", style: "height:38px", on: { click: async () => { if (!confirm("Delete this month?")) return; await db().doc(`fundmonths/${id}__${m}`).delete(); await loadLive(); paint(); } } }, "Delete"))))
          : h("p", { class: "mute" }, "Nothing uploaded yet. Until then, funds show the top 10 from the factsheet.")));
  }
  paint();
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Fund data"), h("p", { class: "lead mute" }, "Add funds and upload each month's holdings. Fund pages and the holdings quiz update at once.")), host);
}
