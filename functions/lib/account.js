/* A learner can delete their own account and every record of it. */
const { admin, db, makeR, fail, needAuth } = require("./common");
const { ADMIN_EMAILS } = require("./staff");

const R = makeR();

async function deleteWhere(q) {
  const snap = await q.get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const b = db.batch(); snap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
  }
}

exports.deleteAccount = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  if (ADMIN_EMAILS.includes(String(ctx.auth.token.email || "").toLowerCase())) fail("permission-denied", "The administrator account cannot be deleted here.");
  for (const p of ["learners", "nmres", "roll", "board", "rate"]) await db.doc(`${p}/${uid}`).delete().catch(() => {});
  await deleteWhere(db.collection("credentials").where("uid", "==", uid));
  await deleteWhere(db.collection("errors").where("uid", "==", uid));
  await admin.auth().deleteUser(uid);
  return { ok: true };
});
