/* UpperCrust One — settings. Everything you may need to change lives in this one file. */

/* Firebase project settings. These values are public identifiers, not secrets. */
export const FIREBASE = {
  apiKey: "AIzaSyB82Len3tSVCZ282D97rN3JEbkDNmeDzD0",
  authDomain: "ucwacademy.firebaseapp.com",
  projectId: "ucwacademy",
  storageBucket: "ucwacademy.firebasestorage.app",
  messagingSenderId: "125615394980",
  appId: "1:125615394980:web:d946bbaed518d266ba5631"
};

/* The one account that can open the Team view. Must match isAdmin() in firestore.rules. */
export const ADMIN_EMAIL = "admin@uppercrustwealth.com";

/* Headlines are published by .github/workflows/update-headlines.yml to the news-data branch of this repository. */
export const NEWS_BASE = "https://raw.githubusercontent.com/Debeshee11/ucwacademy/news-data/";

/* The daily fund list, NAV and returns are published by .github/workflows/update-funds.yml to the funds-data branch. */
export const FUNDS_BASE = "https://raw.githubusercontent.com/Debeshee11/ucwacademy/funds-data/";

/* Optional. When set, Client Lab offers written feedback from an AI service you host (see README, "AI feedback").
   Leave empty to hide the button. */
export const AI_ENDPOINT = "";

/* Pass marks and rules. Change here, not in the views. */
export const RULES = {
  modulePass: 70,       /* % to pass a module quiz */
  examPass: 80,         /* % to pass a course exam or a refresher */
  moduleQuestions: 10,  /* questions drawn for a module quiz */
  examQuestions: 20,    /* questions drawn for each course exam */
  tierPass: { b: 80, i: 75, h: 70 },  /* pass mark for the Beginner, Intermediate and Hard exams */
  refreshQuestions: 15, /* questions drawn for a refresher */
  dailyQuestions: 5,
  reviseMax: 12,
  validMonths: 12,      /* how long a credential stays current */
  intervals: [1, 2, 7, 21, 60]  /* days until a question comes back, by box */
};

/* Company email domain. Sign-ups with this domain must use the employee tab. */
export const STAFF_DOMAIN = "@uppercrustwealth.com";

/* Employees, for the activity roster. Keep in step with listed() in firestore.rules. */
export const STAFF = ["manojrohit@uppercrustwealth.com", "roshanshah@uppercrustwealth.com", "hemantpatel@uppercrustwealth.com", "savan@uppercrustwealth.com", "palakshah@uppercrustwealth.com", "harshil_patel@uppercrustwealth.com", "navin@uppercrustwealth.com", "kanchanbhagwat@uppercrustwealth.com", "omkar@uppercrustwealth.com", "prakashpatel@uppercrustwealth.com", "ops@uppercrustwealth.com", "sudheerkumar@uppercrustwealth.com", "sandeep@uppercrustwealth.com", "yuvraj@uppercrustwealth.com", "equity@uppercrustwealth.com", "crm@uppercrustwealth.com", "ishagil@uppercrustwealth.com", "bijalmehta@uppercrustwealth.com", "aasthapanwar@uppercrustwealth.com", "happy@uppercrustwealth.com", "dhruvpawashe@uppercrustwealth.com", "admin@uppercrustwealth.com", "admin@uppercrustwealth.com"];

export const ORG = "UpperCrust Wealth";
