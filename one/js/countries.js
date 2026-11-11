/* Country picker for mobile numbers. India first; anywhere else works too: choose "Other" and type + and the code. */
import { h } from "./dom.js";

export const COUNTRIES = [
  ["+91", "India"], ["+971", "United Arab Emirates"], ["+1", "United States / Canada"], ["+44", "United Kingdom"], ["+65", "Singapore"],
  ["+61", "Australia"], ["+64", "New Zealand"], ["+966", "Saudi Arabia"], ["+974", "Qatar"], ["+965", "Kuwait"], ["+968", "Oman"], ["+973", "Bahrain"],
  ["+49", "Germany"], ["+33", "France"], ["+31", "Netherlands"], ["+353", "Ireland"], ["+41", "Switzerland"], ["+39", "Italy"], ["+34", "Spain"], ["+46", "Sweden"],
  ["+60", "Malaysia"], ["+852", "Hong Kong"], ["+81", "Japan"], ["+82", "South Korea"], ["+66", "Thailand"], ["+62", "Indonesia"], ["+63", "Philippines"],
  ["+27", "South Africa"], ["+254", "Kenya"], ["+256", "Uganda"], ["+255", "Tanzania"], ["+234", "Nigeria"], ["+230", "Mauritius"],
  ["+977", "Nepal"], ["+94", "Sri Lanka"], ["+880", "Bangladesh"], ["+975", "Bhutan"], ["+92", "Pakistan"], ["+55", "Brazil"], ["+52", "Mexico"], ["+7", "Russia"], ["+86", "China"]
];

export function countryPicker(current = "+91") {
  const sel = h("select", { class: "input", id: "cc", "aria-label": "Country code", autocomplete: "tel-country-code" },
    COUNTRIES.map(([c, n]) => h("option", { value: c, selected: c === current }, `${n} (${c})`)), h("option", { value: "" }, "Other: type + and the code"));
  return sel;
}

/* The text to hand to cleanMobile: a typed "+" number is kept as it is; otherwise the chosen country code is put in front. */
export function joinNumber(sel, raw) {
  const t = String(raw || "").trim();
  if (t.startsWith("+") || !sel || !sel.value || sel.value === "+91") return t;
  return sel.value + t.replace(/\D/g, "").replace(/^0+/, "");
}
