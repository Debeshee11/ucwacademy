/* Everyday wording. Most lessons were first written for advisers and say "client". A student, a homemaker or a retired person
   is not anyone's adviser, so for them the same facts read as their own money. Pure functions, no imports, tested in node. */

const AN = w => (/^[aeiou]/i.test(w) ? "an" : "a");
const cap = (s, like) => (/^[A-Z]/.test(like) ? s[0].toUpperCase() + s.slice(1) : s);

const RULES = [
  [/\b(Your|your|The|the) client from the story\b/g, (m, a) => cap("the person in the story", a)],
  [/\b(Your|your|The|the|This|this|That|that) client's\b/g, (m, a) => cap("your", a)],
  [/\b(Each|each|Every|every|Any|any|A|a|An|an) client's\b/g, (m, a) => /^(a|an)$/i.test(a) ? cap("a person's", a) : cap(a.toLowerCase() + " person's", a)],
  [/^(A|An) client\b/, () => "Someone"],
  [/\b(A|a|An|an) ([A-Za-z-]+(?: [A-Za-z-]+)?) client\b/g, (m, art, adj) => cap(AN(adj), art) + " " + adj + " investor"],
  [/^Client\b/, () => "Someone"],
  [/\b(A|a) client\b/g, (m, a) => cap("someone", a)],
  [/\b(Your|your) clients\b/g, (m, a) => cap("people you know", a)],
  [/\b(Your|your|The|the) client\b/g, (m, a) => cap("the investor", a)],
  [/\bclient by client\b/g, () => "case by case"],
  [/\bClients\b/g, "Investors"],
  [/\bclients\b/g, "investors"],
  [/\bClient\b/g, "Investor"],
  [/\bclient\b/g, "investor"],
  [/(^|[.!?]\s+)RMs\b/g, (m, p) => p + "Advisers"],
  [/(^|[.!?]\s+)RM\b/g, (m, p) => p + "Adviser"],
  [/\bRMs\b/g, "advisers"],
  [/\bRM\b/g, "adviser"],
  [/\brelationship managers?\b/gi, m => (/s$/i.test(m) ? "advisers" : "adviser")]
];

/* Rewrites one string. Anything without these words comes back unchanged. */
export function plain(t) {
  if (typeof t !== "string" || !/client|\bRMs?\b|relationship manager/i.test(t)) return t;
  let s = t;
  for (const [re, to] of RULES) s = s.replace(re, to);
  return s;
}

/* Rewrites every string inside an object or list, leaving numbers, ids and flags alone. */
export function plainDeep(v) {
  if (typeof v === "string") return plain(v);
  if (Array.isArray(v)) return v.map(plainDeep);
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = k === "id" || k === "answer" ? v[k] : plainDeep(v[k]); return o; }
  return v;
}

/* Words that mean the text is still about doing a job, not about one's own money. Used by the content check. */
export const JOB_WORDS = /\b(pitch(?:ing)?|you may (?:say|sell)|mis-?selling|your (?:book|practice)|sales? (?:call|pitch)|client (?:calls?|meetings?)|in meetings?|tell (?:your |the )?(?:investor|client)s?)\b/i;
