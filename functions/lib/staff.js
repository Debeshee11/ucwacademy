/* The staff list for the backend. Keep it in step with listed() in firestore.rules and STAFF in one/js/config.js.
   `npm test` fails if the three lists differ. */
const STAFF_DOMAIN = "@uppercrustwealth.com";
const ADMIN_EMAILS = ["admin@uppercrustwealth.com"];
const STAFF = [
  "manojrohit", "roshanshah", "hemantpatel", "savan", "palakshah", "harshil_patel", "navin", "kanchanbhagwat", "omkar",
  "prakashpatel", "ops", "sudheerkumar", "sandeep", "yuvraj", "equity", "crm", "ishagil", "bijalmehta", "aasthapanwar",
  "happy", "dhruvpawashe", "admin"
].map(n => n + STAFF_DOMAIN);

module.exports = { STAFF, STAFF_DOMAIN, ADMIN_EMAILS };
