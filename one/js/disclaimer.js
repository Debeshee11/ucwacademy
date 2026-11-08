/* The standard risk wording shown wherever fund returns, NAV or rankings appear. Keep it in one place. */
import { h } from "./dom.js";

export const MF_RISK = "Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance may or may not be sustained in the future and is not a guarantee of future returns. Fund names, NAV, returns and ranks are shown for learning only. They are not a recommendation or advice to buy, sell or hold any scheme.";

export const riskNote = () => h("div", { class: "card tint small", role: "note" }, h("b", {}, "Important. "), MF_RISK);
