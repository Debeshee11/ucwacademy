/* Who counts as staff. No names live in the code or the public repository.
   Staff = a verified mailbox on the company domain. The roster (for the admin activity table and verifyStaff)
   is the Firestore document config/staff { emails: [...] }, readable by the admin only. */
const STAFF_DOMAIN = "@uppercrustwealth.com";
const ADMIN_EMAILS = ["admin@uppercrustwealth.com"];
const isStaffEmail = e => String(e || "").toLowerCase().endsWith(STAFF_DOMAIN);

let cached = null;
async function roster(db) {
  if (cached && Date.now() - cached.t < 300e3) return cached.list;
  const d = await db.doc("config/staff").get();
  const list = (d.exists && Array.isArray(d.get("emails")) ? d.get("emails") : []).map(x => String(x).toLowerCase()).filter(isStaffEmail);
  cached = { list, t: Date.now() };
  return list;
}

module.exports = { STAFF_DOMAIN, ADMIN_EMAILS, isStaffEmail, roster };
