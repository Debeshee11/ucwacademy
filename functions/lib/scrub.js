/* Masks email addresses and phone numbers in free text before it is stored or shown to others. */
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?\d[\s().-]?){9,15}\d/g;
const scrub = t => String(t || "").replace(EMAIL, "[email hidden]").replace(PHONE, "[number hidden]");
module.exports = { scrub };
