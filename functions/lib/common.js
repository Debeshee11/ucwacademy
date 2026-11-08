/* Shared setup for every backend function: Firebase Admin, region, error helpers. */
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { ADMIN_EMAILS } = require("./staff");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const FV = admin.firestore.FieldValue;
const REGION = "asia-south1";

/* Set ENFORCE_APPCHECK=1 on the functions (see LAUNCH-CHECKLIST.md) once the web app sends App Check tokens. */
const APPCHECK = process.env.ENFORCE_APPCHECK === "1";
/* A fresh builder each time, so one function's memory or timeout never leaks into the next. */
const makeR = (extra = {}) => functions.region(REGION).runWith({ ...(APPCHECK ? { enforceAppCheck: true } : {}), ...extra });

const fail = (code, msg) => { throw new functions.https.HttpsError(code, msg); };
const needAuth = ctx => { if (!ctx.auth) fail("unauthenticated", "Sign in first."); return ctx.auth.uid; };
const needAdmin = ctx => { needAuth(ctx); if (!ADMIN_EMAILS.includes(String(ctx.auth.token.email || "").toLowerCase())) fail("permission-denied", "Admin only."); };
const day = (t = Date.now()) => new Date(t + 5.5 * 3600e3).toISOString().slice(0, 10); /* IST day */

module.exports = { functions, admin, db, FV, makeR, fail, needAuth, needAdmin, day };
