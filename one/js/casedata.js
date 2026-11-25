/* Case Files: real events from Indian finance, told as short animated films.
   Rules: only facts from public records or major news reports, checked on 25 Nov 2026. No names are blamed beyond what courts or regulators found.
   Education only: nothing here is a tip, a rating or a view on any security. Each case lists its sources. Add a case by adding one object. */

export const CASES = [
  {
    id: "mehta-1992", year: "1992", title: "The boom built on borrowed money", short: "Harshad Mehta and the 1992 securities scam", tags: ["Market boom", "Bank receipts"], min: 3,
    c: "#E08A00", bg: "#FFF1D0", art: "spike", hook: "One broker moved the whole market. The money was not his.",
    scenes: [
      { t: "open", m: "think", date: "April 1992", ribbon: "Market boom", head: "Sensex races past 4,400", sub: "It was about 2,000 in January. The whole market is wild with joy.",
        cap: "Early 1992. In four months the Sensex has more than doubled. One broker, Harshad Mehta, is called the Big Bull. But where is all this buying money coming from?" },
      { t: "flow", m: "explain", title: "How banks lend to each other", nodes: [{ id: "a", x: 70, y: 120, ic: "bank", l: "Bank A" }, { id: "b", x: 290, y: 120, ic: "bank", l: "Bank B" }],
        edges: [{ a: "a", b: "b", kind: "paper", l: "government securities", o: -22, d: 0.8 }, { a: "b", b: "a", kind: "money", l: "cash", o: 22, d: 1.8 }],
        cap: "Banks sometimes need cash for a short while. In a ‘ready forward’ deal, Bank A hands government securities to Bank B and gets cash. About 15 days later, they swap back." },
      { t: "flow", m: "think", title: "A broker in the middle", nodes: [{ id: "a", x: 60, y: 60, ic: "bank", l: "Bank A" }, { id: "br", x: 180, y: 190, ic: "person", l: "Broker", tone: "gold" }, { id: "b", x: 300, y: 60, ic: "bank", l: "Bank B" }],
        edges: [{ a: "a", b: "br", kind: "paper", d: 0.8, o: -8 }, { a: "br", b: "b", kind: "paper", d: 1.4, o: -8 }, { a: "b", b: "br", kind: "money", d: 2.0, o: 8 }, { a: "br", b: "a", kind: "money", d: 2.6, o: 8 }],
        cap: "Banks often did these deals through a broker. So the cash and the papers passed through the broker's hands. That gave him a very powerful position." },
      { t: "flow", m: "warn", title: "The empty promise", nodes: [{ id: "s", x: 60, y: 60, ic: "bank", l: "Small bank", tone: "red", warn: true }, { id: "br", x: 180, y: 190, ic: "person", l: "Broker", tone: "gold" }, { id: "b", x: 300, y: 60, ic: "bank", l: "Big bank" }],
        edges: [{ a: "s", b: "br", kind: "bad", l: "bank receipt", d: 0.8 }, { a: "br", b: "b", kind: "bad", l: "receipt", d: 1.6 }, { a: "b", b: "br", kind: "money", l: "cash", d: 2.4 }],
        cap: "A bank receipt is a promise: ‘we are holding securities for you.’ Some small banks issued receipts with no securities behind them. The big bank paid real cash against an empty promise." },
      { t: "chart", m: "warn", title: "Sensex", unit: "", pts: [["Jan 1992", 2000], ["Apr 1992", 4467]], notes: [{ i: 0, t: "about 2,000" }, { i: 1, t: "4,467" }], down: 99, c: "#E08A00",
        cap: "The cash flowed into a few chosen shares. Prices shot up, which made everyone more confident, which brought more buying. Money from banks, not from savings, was lifting the market." },
      { t: "open", m: "think", date: "23 April 1992", ribbon: "From the news", head: "Journalist Sucheta Dalal reports about ₹500 crore missing from SBI", sub: "The first clue was a broker's flashy car outside the bank.",
        cap: "On 23 April 1992, journalist Sucheta Dalal wrote in The Times of India that about ₹500 crore had been taken from State Bank of India through these deals. The trail led to the broker." },
      { t: "chart", m: "warn", title: "Sensex", unit: "", pts: [["Apr 1992", 4467], ["Aug 1992", 2529]], notes: [{ i: 0, t: "4,467" }, { i: 1, t: "2,529|down 43%", pos: "left" }], down: 0, c: "#E8573D",
        cap: "Banks asked for their money back. Shares bought with that money were sold. By August the Sensex had fallen to 2,529, wiping out over ₹1 lakh crore of investors' wealth." },
      { t: "stats", m: "explain", tiles: [{ v: 4024, pre: "₹", suf: " cr", l: "missing from the banking system" }, { v: 43, suf: "%", l: "Sensex fall, April to August 1992" }],
        cap: "A committee led by RBI deputy governor R. Janakiraman put the money lost from banks at about ₹4,024 crore. The bank-receipt system was rebuilt after this." },
      { t: "choice", m: "think", q: "A broker earns small fees on bank deals, yet he buys shares worth hundreds of crores and arrives in a luxury car. What should make you ask questions?",
        opts: [{ t: "Nothing. He is just very good.", why: "A skill does not explain a gap this big. When the money and the business model do not match, ask more." }, { t: "His spending does not match what his business should earn.", ok: true, why: "Yes. When profits or lifestyle are far above what the work explains, ask where the money comes from." }, { t: "He is famous, so it must be safe.", why: "Fame is not proof. Many frauds were run by people everyone trusted." }] },
      { t: "lesson", m: "joy", title: "What to remember", items: [["trend", "A fast rise paid for with borrowed money is fragile. When the lending stops, the fall is quick."], ["person", "A middleman who touches both cash and papers needs strong checks, or the system is open to abuse."], ["search", "When results look too good, ask where the money comes from."], ["shield", "After 1992 the bank-receipt system was rebuilt with tighter controls."]] }
    ],
    sources: [["Business Today, Year 1992 round-up", "https://businesstoday.in/bt/story/year-1992-round-up/1/11663.html"], ["ThePrint, Harshad Mehta profile", "https://theprint.in/theprint-profile/scapegoat-or-mastermind-of-1992-scam-harshad-mehtas-fall-from-grace-still-haunts-family/1059017"], ["Wikipedia, 1992 Indian stock market scam", "https://en.wikipedia.org/wiki/1992_Indian_stock_market_scam"]]
  },
  {
    id: "satyam-2009", year: "2009", title: "The cash that never existed", short: "Satyam and the ₹7,000 crore accounting fraud", tags: ["Accounting fraud", "Governance"], min: 4,
    c: "#2556B8", bg: "#E6EEFF", art: "stack", hook: "On paper it had thousands of crores in the bank. In truth it did not.",
    scenes: [
      { t: "open", m: "warn", date: "7 January 2009", ribbon: "Breaking", head: "Satyam chairman resigns and says the accounts were false", sub: "Satyam was India's fourth-largest software company.",
        cap: "7 January 2009. The chairman of Satyam, a giant of Indian software, writes to his board and resigns. His letter says the company's accounts had been false for years." },
      { t: "pairs", m: "warn", groups: [{ t: "Cash and bank balance, ₹ crore", a: { l: "On the books", v: 5361, fake: 5040 }, b: { l: "Really there", v: 321 } }], stamp: "Did not exist",
        cap: "The books showed ₹5,361 crore in cash and bank. The letter said ₹5,040 crore of it did not exist. That is 94 percent of the cash." },
      { t: "ledger", m: "explain", title: "The four gaps in the letter", rows: [["Cash and bank balance that did not exist", 5040], ["Interest earned that did not exist", 376], ["Loans left out of the books", 1230], ["Customer dues overstated", 490]], total: "Over ₹7,000 crore",
        cap: "The letter listed four gaps. Cash that was not there. Interest that was never earned. Loans that were hidden. Dues from customers that were overstated. Together, over ₹7,000 crore." },
      { t: "pairs", m: "think", groups: [{ t: "Revenue, Jul–Sep 2008, ₹ crore", a: { l: "Reported", v: 2700 }, b: { l: "Real", v: 2112 } }, { t: "Operating profit, ₹ crore", a: { l: "Reported", v: 649 }, b: { l: "Real", v: 61 } }],
        cap: "Even one quarter was dressed up. For July to September 2008, Satyam reported revenue of ₹2,700 crore and a 24 percent margin. The letter said the real figures were ₹2,112 crore and 3 percent." },
      { t: "flow", m: "explain", title: "How the cash was made to look real", nodes: [{ id: "i", x: 60, y: 70, ic: "paper", l: "Fake invoices", tone: "red" }, { id: "s", x: 180, y: 190, ic: "paper", l: "Fake bank statements", tone: "red" }, { id: "k", x: 300, y: 70, ic: "cash", l: "Books show cash" }],
        edges: [{ a: "i", b: "s", kind: "bad", d: 0.8 }, { a: "s", b: "k", kind: "bad", d: 1.6 }],
        cap: "According to SEBI, fake invoices and fake bank statements were prepared so that the cash looked real. Anyone reading only the final report would see a healthy company." },
      { t: "flow", m: "warn", title: "The last attempt", nodes: [{ id: "s", x: 70, y: 130, ic: "building", l: "Satyam" }, { id: "m", x: 290, y: 130, ic: "building", l: "Maytas firms", tone: "gold" }],
        edges: [{ a: "s", b: "m", kind: "money", l: "about $1.6 billion", d: 0.9 }],
        cap: "In late 2008, Satyam's board proposed buying Maytas Properties and Maytas Infra for about $1.6 billion. These firms were linked to the founder's family, and the deal would have used up all the company's cash. It was dropped. SEBI later called it the last attempt to fill fake assets with real ones." },
      { t: "timeline", m: "explain", title: "What happened next", items: [["7 Jan 2009", "Chairman confesses and resigns", "red"], ["9 Jan 2009", "Satyam removed from Sensex and Nifty. The chairman is arrested", "red"], ["11 Jan 2009", "Government replaces the board", ""], ["2010", "His lawyers say he never wrote the letter", ""], ["Jul 2014", "SEBI bars him from the market for 14 years", ""], ["9 Apr 2015", "Special court convicts him and nine others. Seven years in jail", "green"]],
        cap: "Rescue moved fast. The board was replaced within days, and Tech Mahindra later took over the company. The courts took six years. The chairman later denied writing the letter, but the court convicted on the evidence." },
      { t: "choice", m: "think", q: "A company shows a huge pile of cash, yet earns very little interest on it and still borrows money. What does that suggest?",
        opts: [{ t: "Nothing, it is just careful.", why: "Careful companies put big cash to work or repay debt. Look closer when cash and borrowing sit side by side." }, { t: "Ask whether the cash is really there.", ok: true, why: "Yes. Big cash with low interest income and fresh borrowing is a classic reason to check the cash." }, { t: "It is a sign of strong growth.", why: "Growth does not explain idle cash plus new loans." }] },
      { t: "lesson", m: "joy", title: "What to remember", items: [["cash", "Cash should earn interest. Big cash with tiny interest income is a warning sign."], ["people", "Deals with a founder's family companies need extra scrutiny."], ["search", "Read the cash flow statement, not just profit. Profit can be dressed up."], ["shield", "Independent boards and auditors matter. Two former auditors were also convicted here."]] }
    ],
    sources: [["Business Today, The great Satyam robbery", "https://www.businesstoday.in/magazine/cover-story/story/the-great-satyam-robbery-245694-2009-01-20"], ["SEBI order on Satyam (2018)", "https://www.sebi.gov.in/sebi_data/attachdocs/oct-2018/1539701235947.pdf"], ["Business Standard, sentencing, 9 Apr 2015", "https://business-standard.com/article/pti-stories/satyam-s-raju-brother-get-seven-yrs-jail-rs-5-5-cr-fine-115040900679_1.html"], ["Kotak Neo, Satyam timeline", "https://www.kotakneo.com/investing-guide/articles/satyam-scam/"]]
  },
  {
    id: "ilfs-2018", year: "2018", title: "A bridge of short loans over a river of long projects", short: "IL&FS and the debt market shock", tags: ["Debt default", "Mutual funds"], min: 4,
    c: "#6B4FD6", bg: "#EFEAFF", art: "bridge", hook: "A top-rated group missed payments. Debt funds felt it within days.",
    scenes: [
      { t: "open", m: "warn", date: "September 2018", ribbon: "Market shock", head: "IL&FS, a top-rated infrastructure group, misses payments", sub: "Some of its bonds held the highest rating until early August.",
        cap: "September 2018. IL&FS builds roads, power plants and more. Weeks ago some of its bonds carried the highest rating. Now it is missing payments, and markets are shaking." },
      { t: "stats", m: "explain", tiles: [{ v: 91091, pre: "₹", suf: " cr", l: "group borrowings, March 2018" }, { v: 82, suf: "%", l: "of it owed by subsidiaries" }, { v: 1887, pre: "₹", suf: " cr", l: "loss in 2017-18" }],
        cap: "By March 2018 the group owed about ₹91,091 crore, mostly through its many subsidiaries. In 2017-18 it lost ₹1,887 crore on revenue of ₹18,799 crore." },
      { t: "lanes", m: "warn", title: "The mismatch", axis: ["now", "5 years", "10 years", "15 years"], rows: [{ l: "Loans due soon", segs: [[0, 1, "#E8573D"], [1, 2, "#E8573D"], [2, 3, "#E8573D"], [3, 4, "#E8573D"], [4, 5, "#E8573D"]] }, { l: "Road pays back", segs: [[0, 15, "#2F8F5B"]] }],
        cap: "Here is the trap. News reports said much of its money was short-term, due in months. But roads and power plants earn their money back slowly, over many years. When lenders stop renewing the loans, the bridge breaks." },
      { t: "timeline", m: "explain", title: "How it unfolded", items: [["June 2018", "First default, on ₹450 crore of short-term borrowing", "red"], ["Early Sept 2018", "Misses dues to SIDBI", "red"], ["Within days", "Rating agencies cut its ratings by many notches", "red"], ["17 Sept 2018", "Some of its debt is rated D, the default grade", "red"]],
        cap: "It began with a first default in June. By September it had missed dues to SIDBI. Rating agencies then cut its ratings by many notches within days, down to the default grade." },
      { t: "ripple", m: "warn", center: "IL&FS default", sats: [{ l: "Mutual funds", ic: "fund" }, { l: "Banks and lenders", ic: "bank" }, { l: "Insurers and pension funds", ic: "shield" }, { l: "Stock market", ic: "chart" }],
        cap: "A default is a stone in a pond. Mutual funds, banks, insurers and pension funds held its bonds. Worried investors began pulling money from other lenders too." },
      { t: "stats", m: "explain", tiles: [{ v: 32, l: "funds held IL&FS group bonds" }, { v: 12, l: "fund houses" }, { v: 2283, pre: "₹", suf: " cr", l: "total exposure, 31 Aug 2018" }],
        cap: "On 31 August 2018, 32 funds from 12 fund houses held about ₹2,283 crore of IL&FS group paper. Several held more than 5 percent of their portfolio in it." },
      { t: "pairs", m: "think", note: "Made-up numbers, to show the idea", groups: [{ t: "Price of a bond in a debt fund", a: { l: "Before the rating cut", v: 100 }, b: { l: "After the rating cut", v: 70 } }],
        cap: "When a rating falls, the market price of the bond falls, and the fund marks it down at once. So the fund's NAV drops, even though the fund has not sold anything. These numbers are made up, only to show the idea." },
      { t: "flow", m: "warn", title: "The second wave", nodes: [{ id: "f", x: 60, y: 70, ic: "warn", l: "Fear", tone: "red", warn: true }, { id: "m", x: 180, y: 190, ic: "fund", l: "Funds sell other papers" }, { id: "n", x: 300, y: 70, ic: "building", l: "Finance companies squeezed" }],
        edges: [{ a: "f", b: "m", kind: "bad", d: 0.8 }, { a: "m", b: "n", kind: "bad", d: 1.6 }],
        cap: "Fear spread. Funds sold the papers of other finance companies. One of them, DHFL, saw its money squeezed after a fund house sold ₹300 crore of its commercial papers. Credit tightened for many lenders." },
      { t: "choice", m: "think", q: "A debt fund holds a bond whose rating suddenly drops to default. What happens to the fund's NAV?",
        opts: [{ t: "Nothing, until the bond actually fails to pay.", why: "Funds mark bonds to market. The price falls as soon as the risk is known." }, { t: "It falls at once, as the bond is marked down.", ok: true, why: "Yes. Mark-to-market means a rating cut shows up in the NAV the same day." }, { t: "It rises, because the bond now pays more.", why: "A higher yield is the market's way of saying the price has dropped. NAV falls." }] },
      { t: "lesson", m: "joy", title: "What to remember", items: [["lock", "Match funding to the asset. Long projects need long money, not loans due in months."], ["search", "A rating is an opinion that can change quickly. It is not a guarantee."], ["fund", "Look at what a debt fund holds, and how much sits in any one name."], ["shield", "‘Debt’ and ‘safe’ are different words. Credit risk is real."]] }
    ],
    sources: [["Business Standard, How IL&FS tripped", "https://www.business-standard.com/article/companies/how-il-fs-tripped-118092501323_1.html"], ["Morningstar India, impact of the IL&FS downgrade on funds", "https://www.morningstar.in/posts/48660/impact-ilfs-downgrade-funds.aspx"], ["Quartz, timeline of the NBFC crisis", "https://qz.com/india/1860466"], ["India Today, Damage control (Oct 2018)", "https://www.pressreader.com/india/india-today/20181015/281522227034207"]]
  },
  {
    id: "franklin-2020", year: "2020", title: "When everyone runs for the door", short: "Franklin Templeton shuts six debt funds", tags: ["Liquidity", "Debt funds"], min: 4,
    c: "#1E8E56", bg: "#E4F6EC", art: "door", hook: "Debt funds sound calm. Then the exit door closed.",
    scenes: [
      { t: "open", m: "warn", date: "23 April 2020", ribbon: "Fund news", head: "Franklin Templeton shuts six debt funds", sub: "No one can buy or sell. Over ₹25,000 crore and about 3 lakh investors are affected.",
        cap: "23 April 2020. India is in lockdown. A fund house announces it will wind up six of its debt schemes. From now, no one can buy and no one can withdraw." },
      { t: "chips", m: "explain", title: "The six schemes", chips: ["Ultra Short Bond", "Low Duration", "Short Term Income", "Income Opportunities", "India Dynamic Accrual", "Credit Risk"],
        cap: "Names like ‘ultra short’ and ‘low duration’ tell you how long the bonds last. They do not tell you how safe the borrowers are. Always look at the credit quality as well." },
      { t: "chart", m: "warn", title: "Assets of the six schemes, ₹ crore", unit: "", pts: [["31 Mar 2020", 30854], ["22 Apr 2020", 25856]], notes: [{ i: 0, t: "₹30,854 cr" }, { i: 1, t: "₹25,856 cr|down 16%", pos: "left" }], down: 0, c: "#E8573D",
        cap: "After the lockdown began, investors rushed to withdraw. In three weeks the schemes' assets fell about 16 percent, even after the fund house borrowed to pay redemptions." },
      { t: "flow", m: "explain", title: "The squeeze", nodes: [{ id: "i", x: 60, y: 70, ic: "users", l: "Investors want out" }, { id: "f", x: 180, y: 190, ic: "fund", l: "Fund" }, { id: "b", x: 300, y: 70, ic: "chart", l: "Bond market", tone: "red", warn: true }],
        edges: [{ a: "i", b: "f", kind: "bad", l: "redeem", d: 0.8 }, { a: "f", b: "b", kind: "paper", l: "sell bonds", d: 1.6 }, { a: "b", b: "f", kind: "bad", l: "few buyers", d: 2.4, o: 10 }],
        cap: "To pay those leaving, a fund must sell bonds. But in the lockdown buyers had thinned out. The fund house said the bond market had dried up and left it no choice but to stop withdrawals." },
      { t: "timeline", m: "explain", title: "The long road", items: [["23 Apr 2020", "Six schemes wound up", "red"], ["Nov 2020", "SEBI issues a show-cause notice", ""], ["7 Jun 2021", "SEBI orders a ban on new debt schemes and a refund of fees", ""], ["28 Jun 2021", "The tribunal (SAT) stays the order. Appeals follow", ""], ["Aug 2023", "Investors have received over 100% of their April 2020 value", "green"]],
        cap: "Regulators investigated and the courts were drawn in. SEBI's order of June 2021 was stayed by the tribunal, and appeals followed. Meanwhile the fund sold its bonds slowly and paid investors back in stages." },
      { t: "stats", m: "joy", tiles: [{ v: 27109, pre: "₹", suf: " cr", l: "returned in all" }, { v: 100, suf: "%+", l: "of April 2020 value, by 2023" }],
        cap: "In the end investors received more than 100 percent of the schemes' value in April 2020, about ₹27,109 crore in all. But it took until 2023. Their money came back, but it was stuck for years. That is liquidity risk." },
      { t: "choice", m: "think", q: "What risk explains why investors waited years to get their money out?",
        opts: [{ t: "Liquidity risk: the bonds could not be sold quickly at fair prices.", ok: true, why: "Yes. Liquidity risk is about how fast you can exit, not only about whether you are repaid." }, { t: "Inflation risk.", why: "Inflation erodes value slowly. It does not lock the exit door." }, { t: "Currency risk.", why: "These were rupee bond funds. The issue was the exit, not the currency." }] },
      { t: "lesson", m: "joy", title: "What to check", items: [["fund", "Read the scheme category and the riskometer. Credit risk funds take more risk on purpose."], ["search", "Look at the credit quality of what the fund holds, not just the name."], ["lock", "Ask how quickly you could get your money out in a stressed market."], ["shield", "Keep emergency money in the simplest, most liquid places."]] }
    ],
    sources: [["Business Standard, Decoded: the Franklin Templeton saga", "https://www.business-standard.com/amp/article/markets/decoded-making-sense-of-the-franklin-templeton-mutual-fund-saga-121060901475_1.html"], ["The Wire, Franklin Templeton winds up six schemes", "https://thewire.in/business/franklin-templeton-debt-schemes-coronavirus"], ["Business Standard, liquidator completes asset sale (Aug 2023)", "https://business-standard.com/companies/news/liquidator-completes-franklin-templeton-s-debt-fund-asset-sale-process-123082200838_1.html"], ["Business Today, SAT stays SEBI order (Jun 2021)", "https://www.businesstoday.in/amp/latest/corporate/story/sat-stays-sebi-order-franklin-templeton-gets-interim-relief-299884-2021-06-28"]]
  },
  {
    id: "yesbank-2020", year: "2020", title: "The week the ATM said no", short: "Yes Bank, the moratorium and the AT1 bonds", tags: ["Bank run", "AT1 bonds"], min: 4,
    c: "#D6457A", bg: "#FFE8F0", art: "atm", hook: "A big private bank put a ₹50,000 limit on your own money.",
    scenes: [
      { t: "open", m: "warn", date: "5 March 2020", ribbon: "Banking news", head: "RBI limits withdrawals at Yes Bank to ₹50,000", sub: "The board is replaced. An administrator takes charge.",
        cap: "5 March 2020. The RBI puts Yes Bank under a 30-day moratorium. Each depositor can take out only ₹50,000, whatever the balance. The board is replaced and an administrator takes over." },
      { t: "chart", m: "think", title: "Yes Bank loan book, ₹ crore", unit: "", pts: [["Mar 2014", 55633], ["Sep 2019", 225000]], notes: [{ i: 0, t: "₹55,633 cr" }, { i: 1, t: "about ₹2.25 lakh cr|nearly 4x" }], down: 99, c: "#D6457A",
        cap: "How did it get here? From 2014 to 2019, Yes Bank's loans grew nearly four times. Growing that fast, many loans later turned bad. By December 2019, nearly 19 percent of the loans were bad." },
      { t: "chart", m: "warn", title: "Yes Bank deposits, ₹ crore", unit: "", pts: [["31 Dec 2019", 209000], ["5 Mar 2020", 137000]], notes: [{ i: 0, t: "₹2.09 lakh cr" }, { i: 1, t: "₹1.37 lakh cr|₹72,000 cr gone", pos: "left" }], down: 0, c: "#E8573D",
        cap: "Then depositors got nervous. In about two months deposits fell from ₹2.09 lakh crore to ₹1.37 lakh crore. About ₹72,000 crore walked out. That is a bank run." },
      { t: "flow", m: "explain", title: "The rescue", nodes: [{ id: "s", x: 60, y: 70, ic: "bank", l: "SBI-led investors" }, { id: "y", x: 180, y: 195, ic: "atm", l: "Yes Bank" }, { id: "r", x: 300, y: 70, ic: "shield", l: "RBI and Government" }],
        edges: [{ a: "s", b: "y", kind: "money", l: "about ₹10,000 cr", d: 0.9 }, { a: "r", b: "y", kind: "paper", l: "new board, plan", d: 1.8 }],
        cap: "A reconstruction plan followed. A group led by SBI put in about ₹10,000 crore of fresh capital, and a new board and plan were set up. The limit on withdrawals was lifted on 18 March, earlier than planned." },
      { t: "split", m: "explain", cols: [{ h: "Depositors", ic: "shield", tone: "green", lines: ["Limit lifted on 18 March 2020", "No depositor lost money"] }, { h: "AT1 bondholders", ic: "warn", tone: "red", lines: ["₹8,415 crore written down to zero", "Done on 14 March 2020"] }],
        cap: "Two groups of lenders, two different outcomes. Depositors were protected. Holders of AT1 bonds, a riskier kind of bond, saw ₹8,415 crore written down to zero." },
      { t: "timeline", m: "think", title: "The court fight", items: [["14 Mar 2020", "AT1 bonds written down", "red"], ["Jan 2023", "Bombay High Court strikes the write-down down", "green"], ["Oct 2026", "Supreme Court dismisses the appeals and upholds that ruling", "green"]],
        cap: "It did not end in 2020. In January 2023, the Bombay High Court struck the write-down down. In October 2026, the Supreme Court upheld that, saying the administrator lacked the power under the scheme. Further steps may follow." },
      { t: "choice", m: "think", q: "An AT1 bond pays a higher rate than a bank deposit. Why?",
        opts: [{ t: "Because the bank wants to reward loyal customers.", why: "Pricing follows risk, not loyalty." }, { t: "Because it carries more risk, including being written down.", ok: true, why: "Yes. AT1 bonds are built to absorb losses. The extra yield is the price of that risk." }, { t: "Because the RBI guarantees it.", why: "There is no such guarantee. That is exactly what the story shows." }] },
      { t: "lesson", m: "joy", title: "What to remember", items: [["shield", "Bank deposits are insured up to ₹5 lakh per depositor per bank, principal and interest together."], ["trend", "Very fast loan growth can hide weak loans. Watch bad-loan numbers."], ["search", "Higher yield means ask what can go wrong. Deposits, bonds and shares rank differently when things fail."], ["lock", "A bank run can happen in weeks. Confidence is the real capital."]] }
    ],
    sources: [["Yale Program on Financial Stability, Yes Bank 2020", "https://newbagehot.yale.edu/docs/india-yes-bank-capital-injection-2020"], ["BloombergQuint, moratorium and reconstruction scheme", "https://www.bloombergquint.com/business/yes-bank-moratorium-government-notifies-yes-bank-reconstruction-scheme"], ["Business Standard, Yes Bank crisis", "https://www.business-standard.com/amp/about/what-is-yes-bank-crisis"], ["Moneylife, Supreme Court on AT1 write-off (15 Oct 2026)", "https://www.moneylife.in/article/yes-bank-at1-bondholders-win-in-supreme-court-as-8415-crore-writeoff-is-struck-down/81958.html"], ["DICGC newsletter, current cover ₹5 lakh", "https://dicgc.org.in/sites/default/files/2026-05/safety-net-dicgc-newsletter-issue-5.pdf"]]
  }
];

export const caseById = id => CASES.find(c => c.id === id);
