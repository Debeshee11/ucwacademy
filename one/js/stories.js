/* Stories: swipeable, narrated money stories. Sarthi reads each card aloud (device voice), and Play story moves on by itself.
   Drawn inside a shadow root so its look cannot touch, or be touched by, the rest of the app. All art is inline SVG; no pictures are downloaded.
   Every string is {en, hi, gu}. Hindi and Gujarati text still needs a native-speaker review before wide release. */
import * as I18n from "./i18n.js";
import { mascot } from "./mascot.js";
import { iconFor, sceneFor } from "./storyart.js";
import { rateSave, FACES, FIX, waHref, siteUrl } from "./rate.js";
import { animHtml, startAnim, stopAnim, speakOf } from "./anim.js";

const CSS = `
:host,.st{--ink:#2B2118;--cream:#FFF8E7;--gold:#FFC531;--green:#1E8E56;--blue:#2556B8;--coral:#E8573D;--mute:#6B5A44;--line:#E7D9B8}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}:host{display:block;background:#F3E9CF;min-height:100dvh}
button{font:inherit;color:inherit;cursor:pointer}
.st{display:block;max-width:430px;height:100dvh;color:var(--ink);font-family:"Figtree","Noto Sans Devanagari","Noto Sans Gujarati",system-ui,sans-serif;margin:0 auto;background:var(--cream);position:relative;overflow:hidden;display:flex;flex-direction:column}
@media(min-width:520px){.st{height:min(900px,100dvh - 32px);margin:16px auto;border:3px solid var(--ink);border-radius:40px}}
/* Wide screens: the lesson uses the whole stage. The card gets the big left side; Sarthi and the buttons sit in a column on the right. */
@media(min-width:1000px){
.st{max-width:1180px;height:min(860px,100dvh - 32px);border-radius:44px}
.st .player{display:grid;grid-template-columns:minmax(0,1fr) 340px;grid-template-rows:auto auto minmax(0,1fr) auto auto auto;column-gap:36px;row-gap:12px;padding:22px 34px 26px}
.player>.bars,.player>.bar2{grid-column:1/-1}
.player>.body{grid-column:1;grid-row:3/7;padding-right:6px}
.player>.guide{grid-column:2;grid-row:3;align-self:end;flex-direction:column;align-items:stretch;gap:12px}
.player>.guide svg{width:170px;height:auto;align-self:center}
.player>.foot{grid-column:2;grid-row:4}
.player>.row{grid-column:2;grid-row:5}
.player>.small{grid-column:2;grid-row:6}
.h{font-size:46px}.s{font-size:20px}
}
.scroll{flex:1;overflow:auto;padding:22px 20px 28px}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px 6px}
.lang{display:flex;gap:6px}
.lang button{border:2px solid var(--ink);background:#fff;border-radius:99px;padding:6px 12px;font-weight:800;font-size:13px;min-height:36px}
.lang button[aria-pressed=true]{background:var(--gold)}
h1{font-size:32px;line-height:1.05;margin:0 0 8px;font-weight:800}
.sub{color:var(--mute);font-size:15px;line-height:1.45;margin:0 0 18px}
.tile{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:#fff;border:3px solid var(--ink);border-radius:22px;padding:14px;margin-bottom:12px;min-height:76px}
.tile .dot{width:48px;height:48px;border-radius:14px;border:3px solid var(--ink);flex:none;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px}
.tile b{display:block;font-size:18px;line-height:1.15}
.tile span{font-size:13px;color:var(--mute)}
.tile .done{margin-left:auto;font-weight:800;font-size:12px;color:var(--green)}
/* player */
.player{flex:1;display:flex;flex-direction:column;padding:16px 20px 18px;gap:12px;min-height:0}
.bars{display:flex;gap:5px}.bars i{flex:1;height:5px;border-radius:3px;background:#2B211833}.bars i.on{background:var(--ink)}
.hud{display:flex;gap:6px;margin-left:auto;margin-right:4px}.hud b{background:#fff;border:2px solid var(--ink);border-radius:999px;padding:1px 8px;font-size:12px}.hud .cb{background:#FFE08A}
.fx{position:absolute;left:50%;bottom:170px;transform:translateX(-50%);z-index:5;padding:6px 14px;border:2px solid var(--ink);border-radius:999px;font-weight:900;font-size:14px;pointer-events:none;box-shadow:0 3px 0 var(--ink)}.fx.ok{background:#8DE3AE}.fx.no{background:#FFD0C2}
.stats{display:flex;gap:10px;justify-content:center}.stats span{background:#fff;border:2px solid var(--ink);border-radius:14px;padding:6px 12px;font-size:12px;font-weight:700;display:flex;flex-direction:column;align-items:center}.stats b{font-size:18px}
@media (prefers-reduced-motion:no-preference){.fx{animation:fxp 1.4s ease-out forwards}@keyframes fxp{0%{transform:translate(-50%,10px) scale(.7);opacity:0}15%{transform:translate(-50%,0) scale(1.1);opacity:1}80%{opacity:1}100%{transform:translate(-50%,-26px);opacity:0}}}
.bar2{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:800}
.x{border:2px solid var(--ink);background:#fff;border-radius:99px;width:40px;height:40px;font-weight:800}
.body{flex:1;overflow:auto;display:flex;flex-direction:column;gap:12px;min-height:0}
.art{align-self:center;max-width:100%}
.h{font-size:34px;line-height:1.06;font-weight:800;margin:0}
.s{font-size:17px;line-height:1.4;margin:0;color:#4A3C2C}
.small{font-size:12px;color:var(--mute);line-height:1.35}
.foot{display:flex;align-items:center;justify-content:space-between;gap:10px}
.btn{border:3px solid var(--ink);background:#fff;border-radius:16px;padding:0 16px;min-height:48px;font-weight:800;font-size:15px;display:inline-flex;align-items:center;gap:8px}
.btn.go{background:var(--gold)}
.btn[disabled]{opacity:.45;cursor:default}
.card{background:#fff;border:3px solid var(--ink);border-radius:20px;padding:14px 16px}
.row{display:flex;gap:10px}
.sikka{position:absolute;right:14px;bottom:78px;display:flex;align-items:flex-end;gap:6px;pointer-events:none}
.tipb{background:#fff;border:3px solid var(--ink);border-radius:14px 14px 4px 14px;padding:8px 10px;font-size:12px;font-weight:700;max-width:170px;line-height:1.3}
input[type=range]{width:100%;height:44px;accent-color:#2556B8}
.msg{background:#fff;border:3px solid var(--ink);border-radius:4px 18px 18px 18px;padding:11px 13px;font-size:15px;line-height:1.4;text-align:left;width:100%}
.msg[aria-pressed=true]{background:#FFE3E3;border-color:var(--coral)}
.msg.ok{background:#E3F6EB;border-color:var(--green)}
.why{font-size:13px;line-height:1.35;color:var(--coral);font-weight:700;margin-top:6px}
.good{color:var(--green)}
.stepper{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:8px 12px}
.stepper b{font-size:20px}
.stepper .sb{width:44px;height:44px;border-radius:12px;border:3px solid var(--ink);background:var(--gold);font-size:22px;font-weight:800}
.stepper .sb[disabled]{opacity:.35}
.pts{display:flex;flex-direction:column;gap:10px}
.pt{display:flex;align-items:center;gap:12px;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:12px 14px;font-size:17px;font-weight:700;line-height:1.25}
.pt i{width:34px;height:34px;border-radius:50%;border:3px solid var(--ink);flex:none;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800}
.seg2{display:flex;gap:8px}.seg2 button{flex:1;border:3px solid var(--ink);background:#fff;border-radius:14px;min-height:48px;font-weight:800;font-size:15px}.seg2 button[aria-pressed=true]{background:var(--gold)}
.note{font-size:12px;color:var(--mute);text-align:center;padding:6px 0}
.rate{width:100%;max-width:460px;background:#fff;border:3px solid var(--ink);border-radius:22px;padding:12px 14px;display:grid;gap:8px;text-align:center}.rate .rq{font-weight:800}.rfaces{display:flex;justify-content:center;gap:8px}.rfaces button{font-size:28px;width:52px;height:52px;border-radius:16px;border:2px solid var(--line);background:#FFF8E7;cursor:pointer;transition:transform .12s}.rfaces button:hover{transform:translateY(-3px) scale(1.08)}.rfaces button.on{background:var(--gold);border-color:var(--ink)}.rout{display:grid;gap:8px;justify-items:center;font-size:14px}.rout .row2{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.rout .chips2{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.rout .chips2 button{padding:6px 12px;border-radius:999px;border:2px solid var(--ink);background:#fff;font-weight:700;cursor:pointer}
a.btn,a.btn:visited{color:var(--ink)}
/* lively player: drifting backdrop, floating coins, a coin on the progress bar, a framed stage on wide screens */
.player{position:relative;overflow:hidden}.player>*{position:relative;z-index:1}
.player::before{content:"";position:absolute;inset:-10%;z-index:0;pointer-events:none;background:radial-gradient(circle at 10% 18%,rgba(255,197,49,.38) 0 44px,transparent 46px),radial-gradient(circle at 90% 82%,rgba(255,255,255,.6) 0 70px,transparent 72px),radial-gradient(circle at 72% 10%,rgba(255,255,255,.55) 0 34px,transparent 36px),radial-gradient(circle at 30% 92%,rgba(255,197,49,.25) 0 54px,transparent 56px)}
.bgc{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}.bgc i{position:absolute;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE08A,#F2B01E);border:3px solid #C98600;font:800 16px Figtree,sans-serif;font-style:normal;color:#7A4F00;opacity:.8}
.bgc i:nth-child(1){left:6%;top:30%}.bgc i:nth-child(2){left:46%;top:84%;width:28px;height:28px}.bgc i:nth-child(3){left:93%;top:46%;width:30px;height:30px}.bgc i:nth-child(4){left:60%;top:6%;width:26px;height:26px}
.bars i.cur{position:relative;background:var(--ink)}.bars i.cur::after{content:"₹";position:absolute;right:-9px;top:-9px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#FFE08A,#F2B01E);border:2px solid #C98600;font:800 11px Figtree,sans-serif;color:#7A4F00;z-index:2}
.hud b{display:inline-block;padding:3px 10px;border-radius:999px;background:#fff;border:2px solid var(--ink)}
@media (prefers-reduced-motion:no-preference){.bgc i{animation:cfloat 6s ease-in-out infinite}.bgc i:nth-child(2){animation-delay:-2s}.bgc i:nth-child(3){animation-delay:-4s}.bgc i:nth-child(4){animation-delay:-1s}@keyframes cfloat{50%{transform:translateY(-16px) rotate(18deg)}}.player::before{animation:stdrift 14s ease-in-out infinite alternate}@keyframes stdrift{to{transform:translate(2%,-2%) scale(1.04)}}.guide svg{animation:bob 3.6s ease-in-out infinite}.art svg{animation:artf 5s ease-in-out infinite}@keyframes artf{50%{transform:translateY(-8px)}}}
@media(min-width:1000px){.player>.body{background:rgba(255,255,255,.62);border:3px solid var(--ink);border-bottom-width:8px;border-radius:36px;padding:30px 40px;justify-content:center;align-items:center;text-align:center;box-shadow:0 22px 40px -28px rgba(43,33,24,.5)}.fact .art svg,.body>.art svg{width:min(320px,100%);height:auto}.fact .big{font-size:32px;line-height:1.28;max-width:760px}.fact .num{padding:2px 12px;border-radius:14px}.player>.guide svg{width:230px}.player>.guide .tipb{font-size:15px;padding:12px 14px}.hud b{font-size:15px}.bars i{height:8px}}
@media (prefers-reduced-motion:no-preference){.pop{animation:pop .25s ease-out}@keyframes pop{from{transform:scale(.96);opacity:.4}to{transform:none;opacity:1}}}

.player{position:relative}
.guide{display:flex;align-items:center;gap:8px;min-height:44px}
.guide .tipb{flex:1;max-width:none;border-radius:4px 14px 14px 14px;font-size:13px}
.sarthi{flex:none}.mo,.ey{transform-box:fill-box;transform-origin:center}
.trk{display:flex;flex-direction:column;gap:8px}
.stn{display:flex;align-items:center;gap:10px;opacity:.45;transition:opacity .25s}.stn.past,.stn.now{opacity:1}
.pin{width:44px;height:44px;border-radius:50%;border:3px solid var(--ink);background:var(--c);display:flex;align-items:center;justify-content:center;font-weight:800;flex:none}
.stx{background:#fff;border:3px solid var(--ink);border-radius:14px;padding:6px 10px;flex:1;display:flex;flex-direction:column;min-height:44px;justify-content:center}
.stx b{font-size:15px}.stx span{font-size:13px;color:#4A3C2C;line-height:1.3}
.stn.now .stx{background:#FFF1C2}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border:3px solid var(--ink);border-radius:14px;min-height:48px;padding:0 14px;font-weight:800;font-size:15px}
.tg{font-style:normal;font-size:10px;font-weight:800;background:var(--gold);border:2px solid var(--ink);border-radius:99px;padding:1px 7px;vertical-align:middle}
.lnk{border:0;background:none;font-weight:800;font-size:14px;color:var(--blue);padding:8px 0;min-height:44px;text-align:left}
.cf{position:absolute;inset:0;overflow:hidden;pointer-events:none}.cf i{position:absolute;top:-16px;left:var(--x);width:9px;height:14px;background:var(--c);border:2px solid var(--ink);border-radius:2px}

.chat{display:flex;flex-direction:column;gap:10px}.msgrow{display:flex;gap:8px;align-items:flex-end}.msgrow.r{flex-direction:row-reverse}
.av{width:44px;height:44px;border-radius:50%;border:3px solid var(--ink);background:#fff;overflow:hidden;flex:none;display:flex;align-items:center;justify-content:center}.av svg{width:42px;height:42px}
.bub{background:#fff;border:3px solid var(--ink);border-radius:18px 18px 18px 4px;padding:10px 12px;font-size:16px;line-height:1.4;max-width:78%}.msgrow.r .bub{border-radius:18px 18px 4px 18px;background:#FFF1C2}
.tile2{display:flex;align-items:center;gap:10px;background:none;border:0;padding:0;text-align:left;width:100%}.tile2 .pin{background:var(--c)}.tile2 .stx{opacity:.9}.tile2.open .stx{background:#FFF1C2}
.opt{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:10px 12px;min-height:54px}
.opt .ol{width:30px;height:30px;border-radius:50%;border:3px solid var(--ink);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none;background:var(--cream)}
.opt .ot{font-size:15px;line-height:1.35;font-weight:700;flex:1}.opt .why2{display:block;font-weight:600;font-size:13px;margin-top:5px;color:#4A3C2C}
.opt.ok{background:#E3F6EB;border-color:var(--green)}.opt.no{background:#FFE3E3;border-color:var(--coral)}.opt[disabled]{opacity:1;cursor:default}
button:focus-visible,input:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
@media (prefers-reduced-motion:no-preference){
.sarthi{animation:bob 2.6s ease-in-out infinite}.talk .sarthi{animation:hop .35s ease-in-out infinite alternate}.talk .mo{animation:mouth .16s ease-in-out infinite alternate}
.ey{animation:blink 4s infinite}
.cf i{animation:fall 2.6s var(--d) ease-in forwards}
@keyframes bob{50%{transform:translateY(-3px)}}@keyframes hop{to{transform:translateY(-5px) rotate(-5deg)}}@keyframes mouth{to{transform:scaleY(2.4)}}
@keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}@keyframes fall{to{transform:translateY(110vh) rotate(540deg)}}}
.fact{display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center}.fact .big{font-size:23px;line-height:1.3;font-weight:800}.fact .num{display:inline-block;background:#FFC531;border:3px solid var(--ink);border-radius:10px;padding:0 7px;margin:0 1px;white-space:nowrap}
.egr{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#fff;border:3px solid var(--ink);border-radius:14px;padding:9px 12px;font-weight:700;font-size:15px}.egr.sum{background:#FFE9A8}.egr b{font-weight:800}.egr .bar{flex:1;height:12px;border-radius:6px;background:#EFE6D2;overflow:hidden;border:2px solid var(--ink)}.egr .bar i{display:block;height:100%;background:#3CC47A}
.tr{display:flex;flex-direction:column;gap:12px}.tr-in{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-weight:800;font-size:15px}.tr-in input{grid-column:1/3;width:100%;accent-color:#2B2118;height:28px}.tr-in b{font-size:17px}
.tr-out{display:flex;flex-direction:column;gap:8px}.tr-lead{font-size:14px;font-weight:800;color:#7A6A55}.tr-big{font-size:38px;line-height:1.05;font-weight:800}.tr-bar{display:flex;height:22px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;background:#fff}.tr-bar i{background:#8EC5FF;transition:width .25s}.tr-bar b{background:#3CC47A;transition:width .25s}.tr-leg{display:flex;justify-content:space-between;gap:8px;font-size:13px;font-weight:800}
.anim{display:flex;flex-direction:column;gap:8px}.anim svg{width:100%;height:auto;max-height:46vh;background:#fffdf5;border:3px solid var(--ink);border-radius:20px}.cap{min-height:44px;font-size:17px;font-weight:800;line-height:1.3;text-align:center}
.who{font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;opacity:.75}
`;

/* A lesson built from the course data can be played in the same player: stories(root, null, { lesson, exit, onDone }). */
export function stories(root, startId, custom) {
  root.replaceChildren();
  const host = document.createElement("div");
  root.append(host);
  const sh = host.attachShadow({ mode: "open" });
  sh.innerHTML = `<style>${CSS}</style><div class="st"></div>`;
  run(sh.querySelector(".st"), startId, custom);
  document.title = "Stories · UpperCrust Academy";
}

function run(appEl, startId, custom) {
/* ---------- text helpers: every string is {en,hi,gu} ---------- */
const T = (en, hi, gu) => ({ en, hi, gu });
let LANG = I18n.getLang();
const tx = o => (o && typeof o === "object" ? o[LANG] || o.en : o);
const U = {
  nextline: T("Next line", "अगली पंक्ति", "આગળની લીટી"), tapEach: T("Tap each one", "हर एक को दबाइए", "દરેકને દબાવો"), pickOne: T("Pick an answer", "एक उत्तर चुनिए", "એક જવાબ પસંદ કરો"),
  eng: T("English", "अंग्रेज़ी", "અંગ્રેજી"), correct: T("Correct", "सही", "સાચું"), notThis: T("Not this one", "यह नहीं", "આ નહીં"),
  stories: T("Stories", "कहानियाँ", "વાર્તાઓ"),
  play: T("Play story", "कहानी चलाइए", "વાર્તા ચલાવો"), pause: T("Pause", "रोकिए", "અટકાવો"),
  nextstop: T("Next stop", "अगला पड़ाव", "આગળનું સ્ટૉપ"),
  arrived: T("Trade complete. The shares are in the demat account.", "सौदा पूरा। शेयर डीमैट खाते में हैं।", "સોદો પૂર્ણ. શેર ડીમેટ ખાતામાં છે."),
  tapOrder: T("Tap the next stop in the journey.", "यात्रा का अगला पड़ाव दबाइए।", "સફરનું આગળનું સ્ટૉપ દબાવો."),
  notyet: T("Not that one yet. Think about what comes next.", "अभी वह नहीं। सोचिए आगे क्या आता है।", "હજી એ નહીં. વિચારો કે આગળ શું આવે છે."),
  ordered: T("In order!", "क्रम सही!", "ક્રમ સાચો!"),
  learnaid: T("Learning aid. Exam wording follows the official NISM workbook.", "सीखने का साधन। परीक्षा की भाषा आधिकारिक NISM वर्कबुक के अनुसार होती है।", "શીખવાનું સાધન. પરીક્ષાની ભાષા અધિકૃત NISM વર્કબુક મુજબ હોય છે."),
  exit: T("Back to the Academy", "अकादमी में वापस", "એકેડેમીમાં પાછા"),
  sikkaSays: T("Sarthi reads every card aloud.", "सारथी हर कार्ड पढ़कर सुनाता है।", "સારથિ દરેક કાર્ડ વાંચી સંભળાવે છે."),
  lessons: T("Pick a story", "एक कहानी चुनिए", "એક વાર્તા પસંદ કરો"),
  intro: T("Nine money stories. Press Play story and Sarthi tells them aloud, or tap to go at your own pace.", "नौ धन-कहानियाँ। 'कहानी चलाइए' दबाइए और सारथी उन्हें बोलकर सुनाएगा, या अपनी गति से आगे बढ़िए।", "નવ પૈસાની વાર્તાઓ. 'વાર્તા ચલાવો' દબાવો અને સારથિ તે બોલીને સંભળાવશે, અથવા તમારી ગતિએ આગળ વધો."),
  listen: T("Listen", "सुनिए", "સાંભળો"), next: T("Next", "आगे", "આગળ"), back: T("Back", "पीछे", "પાછળ"),
  start: T("Start", "शुरू करें", "શરૂ કરો"), done: T("Done", "पूरा", "પૂર્ણ"), cardOf: T("Card {0} of {1}", "कार्ड {0} / {1}", "કાર્ડ {0} / {1}"),
  novoice: T("No voice for this language on this device.", "इस उपकरण पर इस भाषा की आवाज़ उपलब्ध नहीं है।", "આ ઉપકરણ પર આ ભાષાનો અવાજ ઉપલબ્ધ નથી."),
  illus: T("Illustration, not a promise.", "केवल उदाहरण, कोई वादा नहीं।", "ફક્ત ઉદાહરણ, કોઈ વચન નથી."),
  myth: T("Myth", "भ्रांति", "ભ્રમ"), fact: T("Fact", "तथ्य", "હકીકત"),
  right: T("Right!", "सही!", "સાચું!"), wrong: T("Not quite.", "पूरी तरह नहीं।", "બરાબર નહીં."),
  complete: T("Story complete", "कहानी पूरी हुई", "વાર્તા પૂર્ણ થઈ"), nextStory: T("Next story", "अगली कहानी", "આગળની વાર્તા"),
  all: T("All stories", "सभी कहानियाँ", "બધી વાર્તાઓ"), copy: T("Copy share text", "साझा करने का पाठ कॉपी करें", "શેર કરવાનો લખાણ કૉપિ કરો"), copied: T("Copied", "कॉपी हो गया", "કૉપિ થયું"),
  brand: T("UpperCrust Academy · Money lessons for everyone", "अपरक्रस्ट अकादमी · सबके लिए धन-संबंधी पाठ", "અપરક્રસ્ટ એકેડેમી · બધા માટે પૈસા-સંબંધી પાઠ"),
  found: T("Red flags found: {0} of 3", "लाल झंडे मिले: {0} / 3", "લાલ ઝંડા મળ્યા: {0} / 3"),
  tapflags: T("Tap the messages that look like red flags.", "जो संदेश खतरे की घंटी जैसे लगें, उन्हें दबाइए।", "જે સંદેશા ખતરાની ઘંટડી જેવા લાગે તેમને દબાવો."),
  normal: T("That one is normal.", "यह सामान्य है।", "આ સામાન્ય છે."),
  lakh: T("lakh", "लाख", "લાખ"), crore: T("crore", "करोड़", "કરોડ"), yrs: T("years", "वर्ष", "વર્ષ"), yr: T("yr", "वर्ष", "વર્ષ")
};
const fill = (s, ...a) => String(s).replace(/\{(\d)\}/g, (_, i) => a[i]);
const money = n => {
  if (n >= 1e7) return "₹" + (Math.round(n / 1e6) / 10) + " " + tx(U.crore);
  if (n >= 1e5) return "₹" + (Math.round(n / 1e4) / 10) + " " + tx(U.lakh);
  return "₹" + Math.round(n).toLocaleString("en-IN");
};
/* ---------- art ---------- */
const O = 'stroke="#2B2118" stroke-width="3"';
const ART = {
  chai: `<svg viewBox="0 0 300 250" width="300" height="250" role="img" aria-label="A steaming chai glass and a gold coin"><circle cx="150" cy="130" r="108" fill="#FFF8E7" ${O}/><path d="M118 62c-8-10 8-18 0-30M150 62c-8-10 8-18 0-30M182 62c-8-10 8-18 0-30" ${O} fill="none" stroke-linecap="round"/><path d="M96 78h108l-12 92a24 24 0 0 1-24 20h-36a24 24 0 0 1-24-20z" fill="#E8A33D" ${O}/><path d="M204 94h18a16 16 0 0 1 0 36h-12" fill="none" ${O}/><rect x="82" y="198" width="136" height="10" rx="5" fill="#2B2118"/><circle cx="240" cy="48" r="26" fill="#FFC531" ${O}/><text x="240" y="57" text-anchor="middle" font-size="26" font-weight="800" fill="#2B2118">₹</text></svg>`,
  alert: `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A phone showing a warning sign"><rect x="86" y="14" width="128" height="196" rx="22" fill="#fff" ${O}/><path d="M150 50 196 130H104z" fill="#FFC531" ${O} stroke-linejoin="round"/><rect x="146" y="76" width="8" height="30" rx="4" fill="#2B2118"/><circle cx="150" cy="118" r="5" fill="#2B2118"/><text x="150" y="166" text-anchor="middle" font-size="22" font-weight="800" fill="#C0392B">+40%</text><text x="150" y="188" text-anchor="middle" font-size="13" font-weight="800" fill="#2B2118">GUARANTEED?</text></svg>`,
  wallet: `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A wallet with coins flying out"><rect x="70" y="80" width="170" height="110" rx="18" fill="#E8573D" ${O}/><rect x="190" y="116" width="62" height="40" rx="14" fill="#FFC531" ${O}/><circle cx="214" cy="136" r="6" fill="#2B2118"/><circle cx="100" cy="46" r="20" fill="#FFC531" ${O}/><circle cx="150" cy="30" r="20" fill="#FFC531" ${O}/><circle cx="204" cy="52" r="20" fill="#FFC531" ${O}/><text x="100" y="53" text-anchor="middle" font-size="18" font-weight="800">₹</text><text x="150" y="37" text-anchor="middle" font-size="18" font-weight="800">₹</text><text x="204" y="59" text-anchor="middle" font-size="18" font-weight="800">₹</text></svg>`,
  double: `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="One coin becoming two"><circle cx="90" cy="120" r="48" fill="#FFC531" ${O}/><text x="90" y="132" text-anchor="middle" font-size="38" font-weight="800">₹</text><path d="M148 120h40M176 106l16 14-16 14" fill="none" ${O} stroke-linecap="round" stroke-linejoin="round"/><circle cx="236" cy="96" r="40" fill="#FFC531" ${O}/><circle cx="236" cy="144" r="40" fill="#FFC531" ${O}/><text x="236" y="150" text-anchor="middle" font-size="30" font-weight="800">₹</text><text x="150" y="30" text-anchor="middle" font-size="30" font-weight="800" fill="#1E8E56">x2 ?</text></svg>`,
  bill: `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A hospital bill and a cross"><rect x="86" y="12" width="128" height="196" rx="10" fill="#fff" ${O}/><rect x="104" y="34" width="92" height="12" rx="6" fill="#EFE6D2"/><rect x="104" y="56" width="70" height="12" rx="6" fill="#EFE6D2"/><rect x="104" y="78" width="80" height="12" rx="6" fill="#EFE6D2"/><text x="150" y="140" text-anchor="middle" font-size="30" font-weight="800" fill="#C0392B">₹5,00,000</text><path d="M138 160h24M150 148v24" stroke="#1E8E56" stroke-width="8" stroke-linecap="round"/></svg>`,
  sikka: `<svg viewBox="0 0 64 64" width="56" height="56" role="img" aria-label="A gold coin"><circle cx="32" cy="32" r="26" fill="#FFC531" ${O}/><circle cx="32" cy="32" r="19" fill="none" stroke="#C99A12" stroke-width="3"/><circle cx="24" cy="28" r="4" fill="#2B2118"/><circle cx="40" cy="28" r="4" fill="#2B2118"/><path d="M23 38q9 9 18 0" fill="none" ${O} stroke-linecap="round"/></svg>`
};
ART.trade = `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A phone with a green Buy button"><rect x="96" y="12" width="108" height="196" rx="22" fill="#fff" ${O}/><rect x="112" y="40" width="76" height="52" rx="10" fill="#EFE6D2"/><path d="M120 80l16-16 12 10 18-22 12 10" fill="none" stroke="#1E8E56" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="112" y="136" width="76" height="40" rx="14" fill="#1E8E56" ${O}/><text x="150" y="163" text-anchor="middle" font-size="19" font-weight="800" fill="#fff">BUY</text><circle cx="236" cy="70" r="26" fill="#FFC531" ${O}/><text x="236" y="79" text-anchor="middle" font-size="24" font-weight="800">₹</text><path d="M210 100l-8 12" ${O} stroke-linecap="round"/></svg>`;
const sikka = (px, mood = "happy") => mascot({ view: "head", px: Math.round(px * 0.9), mood });
const CHAR = {
  meena: `<svg viewBox="0 0 300 230" width="290" height="222" role="img" aria-label="Meena, a stall owner, smiling"><rect x="14" y="196" width="272" height="12" rx="6" fill="#2B2118"/><circle cx="110" cy="100" r="50" fill="#F2C9A0" ${O}/><path d="M60 92c0-40 100-50 100 0c-12-18-88-22-100 0z" fill="#2B2118"/><circle cx="94" cy="104" r="5" fill="#2B2118"/><circle cx="126" cy="104" r="5" fill="#2B2118"/><path d="M94 124q16 14 32 0" fill="none" ${O} stroke-linecap="round"/><path d="M64 152c14 24 78 24 92 0l8 44H56z" fill="#E8573D" ${O}/><circle cx="230" cy="150" r="36" fill="#FFC531" ${O}/><text x="230" y="162" text-anchor="middle" font-size="34" font-weight="800">₹</text></svg>`,
  dadi: `<svg viewBox="0 0 300 230" width="290" height="222" role="img" aria-label="Dadi, a grandmother with glasses, raising a finger"><rect x="14" y="196" width="272" height="12" rx="6" fill="#2B2118"/><circle cx="110" cy="100" r="50" fill="#F2C9A0" ${O}/><path d="M60 96c4-44 96-44 100 0c-20-14-80-14-100 0z" fill="#DDD6CB" ${O}/><circle cx="110" cy="44" r="18" fill="#DDD6CB" ${O}/><circle cx="92" cy="104" r="12" fill="none" ${O}/><circle cx="128" cy="104" r="12" fill="none" ${O}/><path d="M104 104h6" ${O}/><circle cx="92" cy="104" r="3" fill="#2B2118"/><circle cx="128" cy="104" r="3" fill="#2B2118"/><path d="M96 126q14 8 28 0" fill="none" ${O} stroke-linecap="round"/><path d="M60 152c14 24 78 24 92 0l8 44H52z" fill="#2556B8" ${O}/><path d="M214 190v-70" ${O} stroke-width="14" stroke-linecap="round" stroke="#F2C9A0"/><path d="M214 190v-70" stroke="#2B2118" stroke-width="3" stroke-linecap="round" opacity="0"/><text x="214" y="104" text-anchor="middle" font-size="22" font-weight="800" fill="#C0392B">!</text></svg>`,
  rohan: `<svg viewBox="0 0 300 230" width="290" height="222" role="img" aria-label="Rohan, a young man with a salary slip"><rect x="14" y="196" width="272" height="12" rx="6" fill="#2B2118"/><circle cx="110" cy="100" r="50" fill="#E9B98A" ${O}/><path d="M62 92c0-36 96-40 96 0c-10-12-86-14-96 0z" fill="#2B2118"/><circle cx="94" cy="104" r="5" fill="#2B2118"/><circle cx="126" cy="104" r="5" fill="#2B2118"/><path d="M96 124q14 12 28 0" fill="none" ${O} stroke-linecap="round"/><path d="M64 152c14 24 78 24 92 0l8 44H56z" fill="#1E8E56" ${O}/><rect x="190" y="90" width="80" height="100" rx="8" fill="#fff" ${O}/><rect x="202" y="104" width="56" height="8" rx="4" fill="#EFE6D2"/><rect x="202" y="122" width="40" height="8" rx="4" fill="#EFE6D2"/><text x="230" y="168" text-anchor="middle" font-size="16" font-weight="800">₹30,000</text></svg>`
};
const tplus = () => `<svg viewBox="0 0 300 150" width="320" height="160" role="img" aria-label="Day T, then day T plus 1"><rect x="10" y="20" width="118" height="100" rx="16" fill="#FFE9A8" ${O}/><text x="69" y="52" text-anchor="middle" font-size="13" font-weight="800">DAY T</text><text x="69" y="86" text-anchor="middle" font-size="26" font-weight="800">Buy</text><text x="69" y="108" text-anchor="middle" font-size="11" font-weight="700">trade matched</text><path d="M136 70h28M154 58l12 12-12 12" fill="none" ${O} stroke-width="4" stroke-linecap="round"/><rect x="172" y="20" width="118" height="100" rx="16" fill="#D9F2E3" ${O}/><text x="231" y="52" text-anchor="middle" font-size="13" font-weight="800">DAY T+1</text><text x="231" y="86" text-anchor="middle" font-size="24" font-weight="800">Settled</text><text x="231" y="108" text-anchor="middle" font-size="11" font-weight="700">shares in demat</text></svg>`;
const avatar = ch => ch === "sikka" ? sikka(40) : (CHAR[ch] || CHAR.meena).replace(/viewBox="[^"]*" width="\d+" height="\d+"/, 'viewBox="60 48 100 100" width="42" height="42"');
ART.pot = `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="Many small pots flowing into one big pot"><g ${O}><circle cx="40" cy="50" r="22" fill="#FFC531"/><circle cx="40" cy="110" r="22" fill="#FFC531"/><circle cx="40" cy="170" r="22" fill="#FFC531"/></g><text x="40" y="58" text-anchor="middle" font-size="20" font-weight="800">₹</text><text x="40" y="118" text-anchor="middle" font-size="20" font-weight="800">₹</text><text x="40" y="178" text-anchor="middle" font-size="20" font-weight="800">₹</text><path d="M70 55C110 60 120 90 140 100M70 110h70M70 165C110 160 120 130 140 120" fill="none" ${O} stroke-linecap="round"/><path d="M150 80h130l-12 110c-1 10-8 16-18 16h-70c-10 0-17-6-18-16z" fill="#8EC5FF" ${O}/><rect x="146" y="70" width="138" height="16" rx="8" fill="#fff" ${O}/><text x="215" y="150" text-anchor="middle" font-size="26" font-weight="800">₹1 Cr</text></svg>`;
ART.unit = `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A price tag showing NAV 20 rupees"><rect x="70" y="40" width="160" height="140" rx="22" fill="#FFF1C2" ${O}/><circle cx="96" cy="66" r="9" fill="#fff" ${O}/><text x="150" y="92" text-anchor="middle" font-size="16" font-weight="800">NAV</text><text x="150" y="140" text-anchor="middle" font-size="46" font-weight="800">₹20</text><text x="150" y="164" text-anchor="middle" font-size="13" font-weight="700">one unit, today</text><circle cx="248" cy="62" r="22" fill="#FFC531" ${O}/><text x="248" y="70" text-anchor="middle" font-size="22" font-weight="800">1</text></svg>`;
ART.vault = `<svg viewBox="0 0 300 220" width="300" height="220" role="img" aria-label="A vault guarded by a shield"><rect x="70" y="40" width="160" height="140" rx="20" fill="#8EC5FF" ${O}/><circle cx="150" cy="110" r="38" fill="#fff" ${O}/><circle cx="150" cy="110" r="6" fill="#2B2118"/><path d="M150 110l22-20" ${O} stroke-linecap="round"/><path d="M236 40l34 12v30c0 24-14 40-34 48-20-8-34-24-34-48V52z" fill="#3CC47A" ${O}/><path d="M222 84l10 10 18-20" fill="none" ${O} stroke-width="5" stroke-linecap="round"/></svg>`;
const bars = (spec) => { // [[h, label, color, valueLabel]]
  let x = 14, out = "";
  spec.forEach(([h, l, c]) => { out += `<rect x="${x}" y="${220 - h}" width="48" height="${h}" rx="6" fill="${c}" ${O}/><text x="${x + 24}" y="242" text-anchor="middle" font-size="12" font-weight="800" fill="#2B2118">${l}</text>`; x += 62; });
  return `<svg viewBox="0 0 ${x + 6} 252" width="320" height="240" role="img" aria-label="Bars"><rect x="4" y="222" width="${x}" height="4" rx="2" fill="#2B2118"/>${out}</svg>`;
};
/* ---------- the five lessons ---------- */
const LESSONS = [
{ id: "sip", color: "#FFE9A8", n: "1", title: T("What is a SIP?", "SIP क्या है?", "SIP શું છે?"), sub: T("Meena and the chai money", "मीना और चाय के पैसे", "મીના અને ચાના પૈસા"), cards: [
  { k: "hook", art: "chai", h: T("Can ₹100 a day make you rich?", "क्या रोज़ ₹100 आपको अमीर बना सकते हैं?", "શું રોજના ₹100 તમને અમીર બનાવી શકે?"), s: T("That is one cup of chai. Meena thought it was nothing. Then she tried something.", "यह बस एक चाय का दाम है। मीना को लगा कि यह कुछ नहीं। फिर उसने कुछ आज़माया।", "આ બસ એક ચાનો ભાવ છે. મીનાને લાગ્યું કે તે કંઈ નથી. પછી તેણે કંઈક અજમાવ્યું.") },
  { k: "meet", ch: "meena", h: T("Same amount. Same date. Every month.", "वही राशि। वही तारीख़। हर महीने।", "એ જ રકમ. એ જ તારીખ. દર મહિને."), s: T("Meena puts ₹3,000 aside on the 5th of every month. That is a SIP, a systematic investment plan. She does not watch the market. She just shows up.", "मीना हर महीने की 5 तारीख़ को ₹3,000 अलग रखती है। इसे SIP यानी व्यवस्थित निवेश योजना कहते हैं। वह बाज़ार को नहीं देखती। बस हर बार हाज़िर रहती है।", "મીના દર મહિનાની 5 તારીખે ₹3,000 અલગ રાખે છે. તેને SIP એટલે વ્યવસ્થિત રોકાણ યોજના કહે છે. તે બજાર જોતી નથી. બસ દર વખતે હાજર રહે છે.") },
  { k: "picture", h: T("20 years later", "20 साल बाद", "20 વર્ષ પછી"), s: T("Yellow is what Meena put in: ₹7.2 lakh. Green is what it could become: about ₹30 lakh, at an assumed 12% a year.", "पीला वह है जो मीना ने लगाया: ₹7.2 लाख। हरा वह है जो वह बन सकता है: लगभग ₹30 लाख, मानकर कि हर साल 12% मिले।", "પીળો રંગ મીનાએ રોકેલી રકમ છે: ₹7.2 લાખ. લીલો રંગ તે જે બની શકે તે છે: આશરે ₹30 લાખ, દર વર્ષે 12% ધારીને."), svg: () => bars([[10, "1", "#FFC531"], [24, "5", "#FFC531"], [60, "10", "#FFC531"], [120, "15", "#1E8E56"], [200, "20", "#1E8E56"]]), tip: T("Time does most of the work.", "समय अधिकतर काम करता है।", "સમય મોટા ભાગનું કામ કરે છે.") },
  { k: "sip", h: T("Your turn. Drag it.", "अब आपकी बारी। खिसकाइए।", "હવે તમારો વારો. ખસેડો."), s: T("I can put aside every month", "मैं हर महीने अलग रख सकता/सकती हूँ", "હું દર મહિને અલગ રાખી શકું છું") },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Small and steady beats big and rare.", "छोटा और नियमित, बड़े और कभी-कभार से बेहतर है।", "નાનું અને નિયમિત, મોટા અને ક્યારેક કરતાં સારું છે."), T("Time does most of the work.", "समय अधिकतर काम करता है।", "સમય મોટા ભાગનું કામ કરે છે."), T("Markets move, so stay the course.", "बाज़ार चढ़ता-उतरता है, इसलिए टिके रहिए।", "બજાર ઉપર-નીચે થાય છે, તેથી ટકી રહો.")] }
] },
{ id: "scam", color: "#FFD9C7", n: "2", title: T("Spot the scam", "धोखा पहचानिए", "છેતરપિંડી ઓળખો"), sub: T("Dadi's three rules", "दादी के तीन नियम", "દાદીના ત્રણ નિયમો"), cards: [
  { k: "hook", art: "alert", h: T("Guaranteed 40% a month?", "हर महीने पक्का 40%?", "દર મહિને પાક્કું 40%?"), s: T("If it sounds too good to be true, it is. Dadi knows a few tricks.", "अगर बात इतनी अच्छी लगे कि सच न लगे, तो वह सच नहीं होती। दादी कुछ चालें जानती हैं।", "જો વાત એટલી સારી લાગે કે સાચી ન લાગે, તો તે સાચી નથી. દાદી થોડી ચાલ જાણે છે.") },
  { k: "meet", ch: "dadi", h: T("Dadi's three rules", "दादी के तीन नियम", "દાદીના ત્રણ નિયમો"), s: T("No one can guarantee profit. Never share your OTP. Never pay to join a money group.", "कोई भी मुनाफ़े की गारंटी नहीं दे सकता। अपना OTP कभी साझा न करें। पैसे कमाने वाले समूह में शामिल होने के लिए कभी भुगतान न करें।", "કોઈ નફાની ગેરંટી આપી શકતું નથી. તમારો OTP ક્યારેય શેર ન કરો. પૈસા કમાવાના ગ્રુપમાં જોડાવા ક્યારેય ચૂકવણી ન કરો."), tip: T("Pause. Ask someone you trust.", "रुकिए। किसी भरोसेमंद से पूछिए।", "અટકો. કોઈ ભરોસાપાત્રને પૂછો.") },
  { k: "scam", h: T("Spot the red flags", "खतरे की घंटियाँ पहचानिए", "ખતરાની ઘંટડીઓ ઓળખો") },
  { k: "myth", h: T("Myth or fact?", "भ्रांति या तथ्य?", "ભ્રમ કે હકીકત?"), q: T("A registered adviser can promise you 30% returns.", "पंजीकृत सलाहकार आपको 30% प्रतिफल का वादा कर सकता है।", "નોંધાયેલા સલાહકાર તમને 30% વળતરનું વચન આપી શકે છે."), ans: "myth", why: T("No one can promise returns in markets. A promise like that is a red flag.", "बाज़ार में कोई प्रतिफल का वादा नहीं कर सकता। ऐसा वादा खतरे की घंटी है।", "બજારમાં કોઈ વળતરનું વચન આપી શકતું નથી. આવું વચન ખતરાની ઘંટડી છે.") },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Check the SEBI registration number.", "SEBI पंजीकरण संख्या जाँचिए।", "SEBI નોંધણી નંબર તપાસો."), T("Never share your OTP.", "अपना OTP कभी साझा न करें।", "તમારો OTP ક્યારેય શેર ન કરો."), T("If cheated, call 1930 at once.", "धोखा हो तो तुरंत 1930 पर कॉल करें।", "છેતરપિંડી થાય તો તરત 1930 પર કૉલ કરો.")] }
] },
{ id: "budget", color: "#D8ECFF", n: "3", title: T("Split your ₹100", "अपने ₹100 बाँटिए", "તમારા ₹100 વહેંચો"), sub: T("Rohan's first salary", "रोहन की पहली तनख़्वाह", "રોહનનો પહેલો પગાર"), cards: [
  { k: "hook", art: "wallet", h: T("You earn ₹100. Where does it go?", "आप ₹100 कमाते हैं। वह कहाँ जाता है?", "તમે ₹100 કમાઓ છો. તે ક્યાં જાય છે?"), s: T("Most people cannot say. Rohan could not either.", "अधिकतर लोग बता नहीं पाते। रोहन भी नहीं बता सका।", "મોટા ભાગના લોકો કહી શકતા નથી. રોહન પણ કહી શક્યો નહીં.") },
  { k: "meet", ch: "rohan", h: T("₹30,000 gone in 20 days", "₹30,000, 20 दिन में ख़त्म", "₹30,000, 20 દિવસમાં ખતમ"), s: T("Rohan got his first salary and spent without a plan. By the 20th, nothing was left to save.", "रोहन को पहली तनख़्वाह मिली और उसने बिना योजना के खर्च किया। 20 तारीख़ तक बचत के लिए कुछ नहीं बचा।", "રોહનને પહેલો પગાર મળ્યો અને તેણે યોજના વગર ખર્ચ્યો. 20 તારીખ સુધીમાં બચત માટે કંઈ ન બચ્યું.") },
  { k: "picture", h: T("The 50-30-20 idea", "50-30-20 का विचार", "50-30-20 નો વિચાર"), s: T("A starting point: half for needs, a third for wants, the rest for saving. Your own life may need a different split.", "एक शुरुआती बिंदु: आधा ज़रूरतों के लिए, लगभग एक तिहाई इच्छाओं के लिए, बाकी बचत के लिए। आपके जीवन में अलग बँटवारा भी चल सकता है।", "એક શરૂઆતનો મુદ્દો: અડધું જરૂરિયાતો માટે, લગભગ ત્રીજો ભાગ ઇચ્છાઓ માટે, બાકીનું બચત માટે. તમારા જીવનમાં અલગ વહેંચણી પણ ચાલી શકે."), svg: () => bars([[110, "50", "#8EC5FF"], [66, "30", "#FF9C6B"], [44, "20", "#3CC47A"]]), tip: T("Pay yourself first.", "पहले ख़ुद को भुगतान कीजिए।", "પહેલાં પોતાને ચૂકવો.") },
  { k: "budget", h: T("Split Rohan's ₹100", "रोहन के ₹100 बाँटिए", "રોહનના ₹100 વહેંચો") },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Decide the split before you spend.", "खर्च से पहले बँटवारा तय कीजिए।", "ખર્ચ પહેલાં વહેંચણી નક્કી કરો."), T("Save first, spend what is left.", "पहले बचाइए, जो बचे वह खर्च कीजिए।", "પહેલાં બચાવો, જે વધે તે ખર્ચો."), T("50-30-20 is a start, not a law.", "50-30-20 शुरुआत है, कानून नहीं।", "50-30-20 શરૂઆત છે, કાયદો નથી.")] }
] },
{ id: "r72", color: "#D9F2E3", n: "4", title: T("Double your money", "पैसा दोगुना कीजिए", "પૈસા બમણા કરો"), sub: T("The rule of 72", "72 का नियम", "72 નો નિયમ"), cards: [
  { k: "hook", art: "double", h: T("How long to double your money?", "पैसा दोगुना होने में कितना समय लगेगा?", "પૈસા બમણા થવામાં કેટલો સમય લાગશે?"), s: T("There is a quick trick you can do in your head.", "एक आसान तरकीब है जो आप मन में कर सकते हैं।", "એક સહેલી યુક્તિ છે જે તમે મનમાં કરી શકો છો.") },
  { k: "meet", ch: "meena", h: T("Divide 72 by the yearly return", "72 को सालाना प्रतिफल से भाग दीजिए", "72 ને વાર્ષિક વળતરથી ભાગો"), s: T("At 12% a year, 72 ÷ 12 = 6. Money doubles in about 6 years, if that return holds.", "साल का 12% हो, तो 72 ÷ 12 = 6। पैसा लगभग 6 साल में दोगुना होगा, यदि वह प्रतिफल बना रहे।", "વર્ષે 12% હોય, તો 72 ÷ 12 = 6. પૈસા લગભગ 6 વર્ષમાં બમણા થાય, જો તે વળતર ટકે.") },
  { k: "r72", h: T("Drag the return", "प्रतिफल खिसकाइए", "વળતર ખસેડો") },
  { k: "myth", h: T("Myth or fact?", "भ्रांति या तथ्य?", "ભ્રમ કે હકીકત?"), q: T("A higher return always means doubling sooner, with no catch.", "ऊँचा प्रतिफल हमेशा जल्दी दोगुना करता है, इसमें कोई शर्त नहीं।", "ઊંચું વળતર હંમેશાં વહેલું બમણું કરે છે, કોઈ શરત નથી."), ans: "myth", why: T("Higher returns usually come with higher risk. They are never certain.", "ऊँचे प्रतिफल के साथ आम तौर पर ऊँचा जोखिम होता है। वे कभी निश्चित नहीं होते।", "ઊંચા વળતર સાથે સામાન્ય રીતે ઊંચું જોખમ હોય છે. તે ક્યારેય નિશ્ચિત નથી.") },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Years to double = 72 ÷ yearly return.", "दोगुना होने के वर्ष = 72 ÷ वार्षिक प्रतिफल।", "બમણા થવાના વર્ષ = 72 ÷ વાર્ષિક વળતર."), T("It is an estimate, not a promise.", "यह एक अनुमान है, वादा नहीं।", "આ એક અંદાજ છે, વચન નથી."), T("Higher return usually means higher risk.", "ऊँचे प्रतिफल का अर्थ प्रायः ऊँचा जोखिम है।", "ઊંચા વળતરનો અર્થ સામાન્ય રીતે ઊંચું જોખમ.")] }
] },
{ id: "health", color: "#E8E0FF", n: "5", title: T("One hospital bill", "अस्पताल का एक बिल", "હોસ્પિટલનું એક બિલ"), sub: T("Why health cover matters", "स्वास्थ्य बीमा क्यों ज़रूरी है", "આરોગ્ય વીમો કેમ જરૂરી છે"), cards: [
  { k: "hook", art: "bill", h: T("One hospital bill. ₹5 lakh.", "अस्पताल का एक बिल। ₹5 लाख।", "હોસ્પિટલનું એક બિલ. ₹5 લાખ."), s: T("It can arrive in any family, at any time, with no warning.", "यह किसी भी परिवार में, किसी भी समय, बिना चेतावनी के आ सकता है।", "તે કોઈ પણ પરિવારમાં, કોઈ પણ સમયે, ચેતવણી વગર આવી શકે છે.") },
  { k: "meet", ch: "dadi", h: T("Dadi falls ill", "दादी बीमार पड़ीं", "દાદી બીમાર પડ્યાં"), s: T("The family has ₹8 lakh saved for a house. The bill is ₹5 lakh. What happens next depends on one decision made years ago.", "परिवार ने घर के लिए ₹8 लाख बचाए हैं। बिल ₹5 लाख का है। आगे क्या होगा, यह वर्षों पहले लिए गए एक निर्णय पर निर्भर है।", "પરિવારે ઘર માટે ₹8 લાખ બચાવ્યા છે. બિલ ₹5 લાખનું છે. આગળ શું થશે તે વર્ષો પહેલાં લીધેલા એક નિર્ણય પર આધાર રાખે છે.") },
  { k: "health", h: T("Switch the cover on and off", "बीमा चालू और बंद कीजिए", "વીમો ચાલુ અને બંધ કરો") },
  { k: "myth", h: T("Myth or fact?", "भ्रांति या तथ्य?", "ભ્રમ કે હકીકત?"), q: T("Health insurance pays every rupee of every bill, with no conditions.", "स्वास्थ्य बीमा हर बिल का हर रुपया चुकाता है, बिना किसी शर्त के।", "આરોગ્ય વીમો દરેક બિલનો દરેક રૂપિયો ચૂકવે છે, કોઈ શરત વગર."), ans: "myth", why: T("Policies have limits, waiting periods and exclusions. Read them before you buy.", "पॉलिसियों में सीमाएँ, प्रतीक्षा अवधि और अपवाद होते हैं। खरीदने से पहले उन्हें पढ़िए।", "પૉલિસીઓમાં મર્યાદાઓ, રાહ જોવાનો સમયગાળો અને અપવાદો હોય છે. ખરીદતાં પહેલાં તે વાંચો.") },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Buy cover before you need it.", "ज़रूरत पड़ने से पहले बीमा लीजिए।", "જરૂર પડે તે પહેલાં વીમો લો."), T("Savings are for goals, not for bills.", "बचत लक्ष्यों के लिए है, बिलों के लिए नहीं।", "બચત લક્ષ્યો માટે છે, બિલ માટે નહીં."), T("Read limits, waiting periods and exclusions.", "सीमाएँ, प्रतीक्षा अवधि और अपवाद पढ़िए।", "મર્યાદાઓ, રાહ જોવાનો સમયગાળો અને અપવાદો વાંચો.")] }
] }
,{ id: "trade", color: "#FFF1D0", n: "6", tag: "NISM", title: T("A share trade's journey", "एक शेयर सौदे की यात्रा", "એક શેર સોદાની સફર"), sub: T("Rohan taps Buy", "रोहन ने 'ख़रीदें' दबाया", "રોહને 'ખરીદો' દબાવ્યું"), cards: [
  { k: "hook", art: "trade", h: T("Rohan taps Buy. Then what?", "रोहन ने 'ख़रीदें' दबाया। फिर क्या?", "રોહને 'ખરીદો' દબાવ્યું. પછી શું?"), s: T("10 shares, one tap. Behind it, five parties get to work.", "10 शेयर, एक टैप। इसके पीछे पाँच पक्ष काम में लग जाते हैं।", "10 શેર, એક ટૅપ. તેની પાછળ પાંચ પક્ષ કામે લાગે છે."), tip: T("Let us follow the trade.", "चलिए, सौदे के पीछे चलें।", "ચાલો, સોદાની પાછળ જઈએ.") },
  { k: "journey", h: T("Follow the trade", "सौदे के पीछे चलिए", "સોદાની પાછળ ચાલો"), st: [
    [T("You", "आप", "તમે"), T("Place the order in your broker's app.", "अपने ब्रोकर के ऐप में ऑर्डर दीजिए।", "તમારા બ્રોકરની ઍપમાં ઑર્ડર આપો."), "#FFC531"],
    [T("Broker", "ब्रोकर", "બ્રોકર"), T("Sends your order to the exchange.", "आपका ऑर्डर एक्सचेंज तक भेजता है।", "તમારો ઑર્ડર એક્સચેન્જ સુધી મોકલે છે."), "#8EC5FF"],
    [T("Stock exchange", "स्टॉक एक्सचेंज", "સ્ટૉક એક્સચેન્જ"), T("Matches buyers and sellers.", "ख़रीदार और विक्रेता को मिलाता है।", "ખરીદનાર અને વેચનારને મેળવે છે."), "#FF9C6B"],
    [T("Clearing corporation", "क्लियरिंग कॉर्पोरेशन", "ક્લિયરિંગ કૉર્પોરેશન"), T("Guarantees the trade and works out who owes what.", "सौदे की गारंटी देता है और हिसाब लगाता है कि किसे क्या देना है।", "સોદાની ખાતરી આપે છે અને હિસાબ કરે છે કે કોને શું આપવાનું છે."), "#D8B4FE"],
    [T("Depository", "डिपॉज़िटरी", "ડિપોઝિટરી"), T("Moves the shares into your demat account.", "शेयर आपके डीमैट खाते में पहुँचाती है।", "શેર તમારા ડીમેટ ખાતામાં પહોંચાડે છે."), "#3CC47A"]
  ] },
  { k: "picture", h: T("Settlement is T+1", "निपटान T+1 में होता है", "સેટલમેન્ટ T+1 માં થાય છે"), s: T("T is the trade day. Shares and money settle one working day later. Weekends and exchange holidays do not count.", "T सौदे का दिन है। शेयर और पैसे का निपटान एक कार्य-दिवस बाद होता है। सप्ताहांत और एक्सचेंज की छुट्टियाँ गिनी नहीं जातीं।", "T એટલે સોદાનો દિવસ. શેર અને પૈસાનું સેટલમેન્ટ એક કામકાજી દિવસ પછી થાય છે. સપ્તાહાંત અને એક્સચેન્જની રજાઓ ગણાતી નથી."), svg: () => tplus(), tip: T("T is Trade day. Plus one working day.", "T यानी सौदे का दिन। उसके बाद एक कार्य-दिवस।", "T એટલે સોદાનો દિવસ. પછી એક કામકાજી દિવસ.") },
  { k: "myth", h: T("Myth or fact?", "भ्रांति या तथ्य?", "ભ્રમ કે હકીકત?"), q: T("The stock exchange keeps your shares safe for you.", "स्टॉक एक्सचेंज आपके शेयर आपके लिए सुरक्षित रखता है।", "સ્ટૉક એક્સચેન્જ તમારા શેર તમારા માટે સાચવી રાખે છે."), ans: "myth", why: T("Your shares sit in your demat account with a depository (NSDL or CDSL). The exchange only matches the trade.", "आपके शेयर डिपॉज़िटरी (NSDL या CDSL) में आपके डीमैट खाते में रहते हैं। एक्सचेंज केवल सौदा मिलाता है।", "તમારા શેર ડિપોઝિટરી (NSDL કે CDSL) માં તમારા ડીમેટ ખાતામાં રહે છે. એક્સચેન્જ ફક્ત સોદો મેળવે છે.") },
  { k: "order", h: T("Put the journey in order", "यात्रा को क्रम में लगाइए", "સફરને ક્રમમાં ગોઠવો"), seq: [0, 1, 2, 3] },
  { k: "remember", h: T("Remember these three", "ये तीन बातें याद रखिए", "આ ત્રણ વાત યાદ રાખો"), pts: [T("Order, broker, exchange, clearing corporation, depository.", "ऑर्डर, ब्रोकर, एक्सचेंज, क्लियरिंग कॉर्पोरेशन, डिपॉज़िटरी।", "ઑર્ડર, બ્રોકર, એક્સચેન્જ, ક્લિયરિંગ કૉર્પોરેશન, ડિપોઝિટરી."), T("Equity cash trades settle on T+1.", "इक्विटी कैश सौदों का निपटान T+1 पर होता है।", "ઇક્વિટી કૅશ સોદાનું સેટલમેન્ટ T+1 પર થાય છે."), T("Your shares live in your demat account, not at the exchange.", "आपके शेयर आपके डीमैट खाते में रहते हैं, एक्सचेंज में नहीं।", "તમારા શેર તમારા ડીમેટ ખાતામાં રહે છે, એક્સચેન્જમાં નહીં.")] }
] },{ id: "mf1", en: true, color: "#D8ECFF", n: "7", tag: "MF", title: T("Many small pots, one big pot"), sub: T("Meena and the shared pot"), cards: [
  { k: "hook", art: "pot", h: T("1,000 people. One big pot."), s: T("Meena has ₹10,000 and no idea which company to pick. So do 999 others. What if they all pooled their money?"), tip: T("That idea is a mutual fund.") },
  { k: "dialog", h: T("Meena has an idea"), lines: [["meena",T("I have ₹10,000 saved. I want to invest, but I cannot pick shares.")],["rohan",T("Same here. What if we all put our money in one big pot?")],["meena",T("And hire a professional to invest it across many companies?")],["rohan",T("Yes. We each own a share of the pot, in proportion to what we put in.")],["sikka",T("That is a mutual fund. Your share of the pot is held as units.")]] },
  { k: "pool", h: T("Watch the pot move"), lab: T("Value of the pot today"), each: T("Meena's ₹10,000 is now worth"), tip: T("Gains and losses are shared in the same proportion.") },
  { k: "myth", h: T("Myth or fact?"), q: T("A professional runs it, so it cannot lose money."), ans: "myth", why: T("Experts choose the investments, but the market sets the price. Your units can go down as well as up. A fund spreads risk. It does not remove it.") },
  { k: "pick", h: T("Check yourself"), q: T("Meena puts ₹10,000 into a mutual fund. What does she own?"), opts: [T("A share of the company the fund manager likes most"),T("Units of the fund, a proportional share of everything it holds"),T("A fixed deposit with a promised return from the fund house"),T("A loan she has made to the fund house, which it must repay")], ans: 1, why: [T("Funds hold many companies. Meena does not own any one of them directly."),T("Right. The fund holds many investments and her units are a slice of the whole pot."),T("A fixed deposit promises a return. A mutual fund promises nothing, and its value moves with the market."),T("She is not lending to the fund house. She is buying a share of the fund's investments.")] },
  { k: "pick", h: T("Check yourself"), q: T("A fund holds shares of 50 companies. One company's shares fall 40%. What is the most likely effect on a unit holder?"), opts: [T("A small fall in unit value, because that company is only a part of the pot"),T("No change, because the fund manager always sells before a fall"),T("The whole investment is lost, because one company failed"),T("The fund house must pay the loss from its own money")], ans: 0, why: [T("Right. Spreading across many holdings softens the effect of any one of them."),T("No manager can sell every fall in advance, so this cannot be counted on."),T("The loss is limited to that one company's share of the fund, not the whole."),T("The fund house does not cover investment losses. They belong to the unit holders.")] },
  { k: "pick", h: T("Check yourself"), q: T("Which sentence best explains why someone with ₹10,000 might choose a mutual fund over buying one stock?"), opts: [T("A mutual fund always earns more than a single stock"),T("A mutual fund has zero running fees, so it is cheaper to hold"),T("A mutual fund lets a small amount be spread across many holdings"),T("A mutual fund's value never changes day to day")], ans: 2, why: [T("No rule says a fund beats a stock. It depends on what each one holds."),T("Funds do charge fees, and these come out of the fund's value."),T("Right. Spreading a small amount widely is the main practical advantage."),T("The unit value is recalculated every business day and moves with the market.")] },
  { k: "remember", h: T("Remember these three"), pts: [T("A mutual fund is a shared pot, managed by a professional."),T("You own units of the fund, not the individual shares."),T("Spreading risk is not the same as removing it.")] }
] },{ id: "mf2", en: true, color: "#FFE9A8", n: "8", tag: "MF", title: T("Units and NAV"), sub: T("What Rohan actually owns"), cards: [
  { k: "hook", art: "unit", h: T("What is a NAV?"), s: T("Rohan sees \"NAV ₹20\" on his screen. His friend says her ₹12 is a better deal. Is it?"), tip: T("Let us find out.") },
  { k: "dialog", h: T("Two friends, two NAVs"), lines: [["rohan",T("My fund's NAV is ₹20.")],["meena",T("Mine is only ₹12. So I got a cheaper fund.")],["rohan",T("Did you? What does NAV even mean?")],["sikka",T("NAV is the value of one unit today. It is not a price tag that says how good the deal is.")]] },
  { k: "nav", h: T("Build a NAV"), l1: T("Net assets of the fund"), l2: T("Units issued"), l3: T("You invest"), perunit: T("per unit"), units: T("units for you"), tip: T("NAV = net assets ÷ units. Your units = money ÷ NAV.") },
  { k: "compare", h: T("Same 10% growth"), s: T("The NAVs differ. The return is the same: 10%."), cols: [{ t: T("Fund X, NAV ₹15"), c: "#FFE9A8", rows: [[T("You invest ₹10,000"),T("666.7 units")],[T("NAV rises to ₹16.50"),T("Worth ₹11,000")]] },{ t: T("Fund Y, NAV ₹300"), c: "#D8ECFF", rows: [[T("You invest ₹10,000"),T("33.3 units")],[T("NAV rises to ₹330"),T("Worth ₹11,000")]] }], tip: T("A low NAV is not cheap. A high NAV is not expensive.") },
  { k: "pick", h: T("Check yourself"), q: T("A fund's net assets are ₹60 crore and it has issued 3 crore units. What is its NAV?"), opts: [T("₹180"),T("₹0.05"),T("₹20"),T("₹63")], ans: 2, why: [T("That multiplies the two numbers. NAV divides assets by units."),T("That divides units by assets, which is upside down."),T("Right. NAV = ₹60 crore ÷ 3 crore units = ₹20."),T("That adds the two numbers together, which has no meaning here.")] },
  { k: "pick", h: T("Check yourself"), q: T("Two funds each grow 10% this year. Fund X has a NAV of ₹15 and Fund Y has a NAV of ₹300. What can you say?"), opts: [T("Fund X gave a better return because its NAV is lower"),T("Fund Y gave a better return because its NAV is higher"),T("Fund Y is more expensive, so it carries more risk"),T("Both gave the same percentage return, whatever the NAV")], ans: 3, why: [T("A lower NAV only means more units per rupee, not a higher percentage return."),T("A higher NAV only means fewer units for the same money, with the same percentage growth."),T("The NAV level says nothing about risk. Risk comes from what the fund holds."),T("Right. A 10% rise is 10% whatever the starting NAV.")] },
  { k: "pick", h: T("Check yourself"), q: T("Rohan holds 500 units. His investment is worth ₹12,500 today. What is the NAV now?"), opts: [T("₹20"),T("₹25"),T("₹12.50"),T("₹250")], ans: 1, why: [T("That was the NAV when he bought. His value has grown since then."),T("Right. ₹12,500 ÷ 500 units = ₹25."),T("That divides the value by 1,000 units, which he does not hold."),T("That treats the value as if he held 50 units, which he does not.")] },
  { k: "remember", h: T("Remember these three"), pts: [T("NAV is the value of one unit today."),T("Your units times the NAV is what your investment is worth."),T("A low NAV is not cheap, and a high NAV is not expensive.")] }
] },{ id: "mf3", en: true, color: "#D9F2E3", n: "9", tag: "MF", title: T("Who is watching your money?"), sub: T("Dadi's worry"), cards: [
  { k: "hook", art: "vault", h: T("Is my money safe?"), s: T("Dadi asks: \"What if the fund house just runs away with it?\" A fair question."), tip: T("The answer is in how a fund is built.") },
  { k: "dialog", h: T("Dadi's worry"), lines: [["dadi",T("You give money to a company you have never met. What if it runs away?")],["meena",T("A mutual fund is built so that it cannot easily happen.")],["dadi",T("How?")],["sikka",T("The jobs are split between different parties. Let me show you each one.")]] },
  { k: "tiles", h: T("Six jobs, six parties"), items: [[T("SEBI"),T("The regulator. It sets the rules that every mutual fund must follow."),"#FFC531"],[T("Sponsor"),T("Sets up the fund and puts in its own capital to start it."),"#FF9C6B"],[T("Trustees"),T("Watch over the AMC on behalf of investors."),"#8EC5FF"],[T("AMC"),T("The fund house. It runs the fund day to day, and the fund manager works here."),"#D8B4FE"],[T("Custodian"),T("A separate institution that holds the shares and bonds in safe keeping."),"#3CC47A"],[T("Registrar"),T("Keeps the record of who owns how many units."),"#FFE9A8"]], tip: T("No one party can do everything alone.") },
  { k: "myth", h: T("Myth or fact?"), q: T("If the fund house shuts down, you lose your investment."), ans: "myth", why: T("The fund's investments are held separately in trust, so they do not belong to the fund house. That protects against misuse. It does not protect against market falls.") },
  { k: "pick", h: T("Check yourself"), q: T("Who actually holds the shares and bonds a mutual fund buys?"), opts: [T("A custodian, a separate institution that holds them in trust for investors"),T("The fund manager, in a personal account"),T("SEBI, which keeps them until investors sell"),T("The AMC, in its own company accounts")], ans: 0, why: [T("Right. Keeping the securities with a separate custodian is built into the structure."),T("A manager decides what to buy but does not hold the securities personally."),T("SEBI regulates the industry. It does not hold investors' assets."),T("Fund assets are kept apart from the AMC's own money, on purpose.")] },
  { k: "pick", h: T("Check yourself"), q: T("Which job belongs to the trustees?"), opts: [T("Choosing which shares the fund will buy"),T("Keeping a record of who owns how many units"),T("Watching over the AMC on behalf of investors"),T("Setting the rules for all mutual funds in India")], ans: 2, why: [T("That is the fund manager's job, inside the AMC."),T("That is the registrar's job."),T("Right. Trustees are the investors' watchdog inside the structure."),T("That is SEBI's job, not the trustees'.")] },
  { k: "pick", h: T("Check yourself"), q: T("A fund's shares sit safely with a custodian, and the shares fall 15% in a month. What happens to the unit value?"), opts: [T("It stays the same, because safe keeping protects value"),T("It falls, because safe keeping protects against misuse and not price falls"),T("It rises, because the fund automatically buys more at lower prices"),T("It stays the same, because the trustees step in to cover the fall")], ans: 1, why: [T("Safe keeping protects the shares themselves, not their price."),T("Right. The custodian protects against misuse. It cannot stop prices moving."),T("A fall does not automatically produce a gain, and the fund does not buy more by itself."),T("Trustees watch over the fund. They do not cover market losses.")] },
  { k: "remember", h: T("Remember these three"), pts: [T("The AMC manages, the custodian holds, the trustees watch, SEBI regulates."),T("Fund assets are held separately from the AMC's own money."),T("Safe keeping protects against misuse. It does not protect against market falls.")] }
] }
];
/* ---------- state ---------- */
const S = { xp: 0, combo: 0, best: 0, right: 0, asked: 0, fx: null, line: 1, tiles: [], pick: [], nv: { pot: 100, net: 100, units: 5, amt: 10000 }, auto: false, stop: 0, ord: [], bad: 0, view: "home", li: 0, ci: 0, done: {}, sip: 3000, budget: [50, 50, 0], rate: 12, ins: false, flags: [false, false, false, false], myth: null };
try { S.done = JSON.parse(localStorage.getItem("uc.stories") || "{}") || {}; } catch (e) {}
let app = appEl, $ = s => app.querySelector(s), timer = 0, speaking = false;
const stopAll = () => { try { if (recAudio) { recAudio.pause(); recAudio = null; } } catch (e) {} try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} clearTimeout(timer); speaking = false; if (app) app.classList.remove("talk"); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
/* ---------- voice ---------- */
const VL = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };
let noVoice = false;
/* The voice follows the language of the words being read, so Gujarati mode still speaks while lessons are English: same voice, same pace. */
let SPK = "en";
const langOfText = s => /[\u0A80-\u0AFF]/.test(s || "") ? "gu" : /[\u0900-\u097F]/.test(s || "") ? "hi" : "en";
const vlang = () => SPK;
/* Sarthi is a man, so prefer a male Indian voice when the device has one. Scores each voice: right language and region first, then male names, then anything that sounds female last. */
const MALE = /ravi|hemant|prabhat|madhur|rishi|neel|niranjan|kabir|rahul|aarav|arjun|male|puru/i, FEMALE = /heera|kalpana|swara|neerja|lekha|priya|veena|aditi|female|google (हिन्दी|hindi)|zira|susan|hazel/i;
const voiceFor = () => { try {
  const want = VL[vlang()].toLowerCase(), w = want.slice(0, 2), vs = window.speechSynthesis.getVoices();
  const sc = v => { const l = (v.lang || "").replace("_", "-").toLowerCase(); let p = l === want ? 100 : l.startsWith(w) ? 60 : -1; if (p < 0) return -1;
    if (MALE.test(v.name)) p += 30; if (FEMALE.test(v.name)) p -= 30; if (/natural|online/i.test(v.name)) p += 10; if (v.localService === false && !/natural|online/i.test(v.name)) p -= 2; return p; };
  const best = vs.map(v => [sc(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]); return best.length ? best[0][1] : null;
} catch (e) { return null; } };
/* Says the text. done() runs when it ends, or straight away if this device has no voice for the language. Returns false when there is no voice. */
/* Recorded voice. one/audio/index.json maps "lang/hash" to a file extension; made by scripts/voice/make_audio.py with the Sarvam API.
   When a recording exists for the text it plays; otherwise the device's own voice is used. */
const hashOf = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16).padStart(8, "0"); };
let REC = null, recAudio = null;
try { fetch("one/audio/index.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).then(j => { REC = j; }).catch(() => {}); } catch (e) {}
function playRec(text, done) {
  const k = vlang() + "/" + hashOf(text), ext = REC && REC[k]; if (!ext) return false;
  try {
    if (recAudio) { recAudio.pause(); recAudio = null; }
    const a = new Audio(`one/audio/${k}.${ext}`); recAudio = a; a.playbackRate = 1;
    a.onplay = () => { speaking = true; app.classList.add("talk"); };
    const end = () => { speaking = false; app.classList.remove("talk"); if (recAudio === a) recAudio = null; if (done) done(); };
    a.onended = end; a.onerror = () => { if (recAudio === a) recAudio = null; if (!speakDevice(text, done)) end(); };
    const pr = a.play(); if (pr && pr.catch) pr.catch(() => { if (recAudio === a) recAudio = null; if (!speakDevice(text, done)) end(); });
    return true;
  } catch (e) { return false; }
}
function speak(text, done) { SPK = langOfText(text); if (window.__ucCollect) { window.__ucCollect(vlang(), hashOf(text), text); setTimeout(() => done && done(), 0); return true; } return playRec(text, done) || speakDevice(text, done); }
function speakDevice(text, done) {
  noVoice = false;
  try {
    const ss = window.speechSynthesis; if (!ss) throw 0;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = VL[vlang()];
    const m = voiceFor(); if (m) u.voice = m; else if (SPK !== "en") throw 0;
    u.rate = SPK === "en" ? 0.88 : 0.82; u.pitch = 0.9;
    u.onstart = () => { speaking = true; app.classList.add("talk"); };
    const end = () => { speaking = false; app.classList.remove("talk"); if (done) done(); };
    u.onend = end; u.onerror = e => { if (e && e.error === "interrupted") { speaking = false; app.classList.remove("talk"); return; } end(); };
    ss.speak(u); return true;
  } catch (e) { noVoice = true; app.classList.remove("talk"); return false; }
}
function stopSpeak() { stopAll(); }
/* ---------- screens ---------- */
function langBar() {
  return `<div class="lang" role="group" aria-label="Language">${[["en", "English"], ["hi", "हिन्दी"], ["gu", "ગુજરાતી"]].map(([k, n]) => `<button data-lang="${k}" aria-pressed="${LANG === k}">${n}</button>`).join("")}</div>`;
}
function home() {
  return `<div class="top"><div style="display:flex;align-items:center;gap:8px">${sikka(40)}<b style="font-size:18px">${esc(tx(U.stories))}</b></div>${langBar()}</div>
  <div class="scroll"><button class="lnk" data-exit>← ${esc(tx(U.exit))}</button><h1>${esc(tx(U.lessons))}</h1><p class="sub">${esc(tx(U.intro))}</p>
  ${LESSONS.map((l, i) => `<button class="tile" data-open="${i}"><span class="dot" style="background:${l.color}">${l.n}</span><span style="flex:1"><b>${esc(tx(l.title))}${l.tag ? ` <em class="tg">${l.tag}</em>` : ""}${l.en && LANG !== "en" ? ` <em class="tg">${esc(tx(U.eng))}</em>` : ""}</b><span>${esc(tx(l.sub))}</span></span>${S.done[l.id] ? `<span class="done">✓ ${esc(tx(U.done))}</span>` : ""}</button>`).join("")}
  <p class="note">${esc(tx(U.brand))}</p></div>`;
}
function cardHtml(c, L) {
  const head = c.h ? `<h2 class="h">${esc(tx(c.h))}</h2>` : "";
  const sub = c.s && c.k !== "sip" ? `<p class="s">${esc(tx(c.s))}</p>` : "";
  switch (c.k) {
    case "hook": return `<div class="art">${ART[c.art] || sceneFor(c.art || c.h)}</div>${head}${sub}`;
    case "meet": return `<div class="art">${CHAR[c.ch]}</div>${head}${sub}`;
    case "picture": return `<div class="art">${c.svg()}</div>${head}${sub}<div class="small">${esc(tx(U.illus))}</div>`;
    case "remember": return `${head}<div class="pts">${c.pts.map((p, i) => `<div class="pt"><i style="background:${["#FFC531", "#3CC47A", "#8EC5FF"][i]}">${i + 1}</i>${esc(tx(p))}</div>`).join("")}</div>`;
    case "sip": {
      const fv = S.sip * 999.15, pct = (S.sip - 500) / 95;
      return `${head}<div class="card"><div class="small" style="font-weight:800">${esc(tx(c.s))}</div><div style="font-size:46px;font-weight:800">₹${S.sip.toLocaleString("en-IN")}</div><input type="range" id="sip" min="500" max="10000" step="500" value="${S.sip}" aria-label="Monthly amount"><div class="row" style="justify-content:space-between" class="small"><span class="small">₹500</span><span class="small">₹10,000</span></div></div>
      <div class="card" style="background:#2556B8;color:#fff"><div class="small" style="color:#fff;font-weight:800">${LANG === "en" ? "IN 20 YEARS, AT AN ASSUMED 12% A YEAR" : LANG === "hi" ? "20 वर्ष में, हर साल 12% मानकर" : "20 વર્ષમાં, દર વર્ષે 12% ધારીને"}</div><div id="sipout" style="font-size:38px;font-weight:800">≈ ${money(fv)}</div></div><div class="small">${esc(tx(U.illus))}</div>`;
    }
    case "dialog": {
      return `${head}<div class="chat">${c.lines.slice(0, S.line).map(([w, t], i) => `<div class="msgrow ${w === "dadi" || w === "sikka" ? "r" : ""} pop"><span class="av">${avatar(w)}</span><div class="bub">${esc(tx(t))}</div></div>`).join("")}</div>
      ${S.line < c.lines.length ? `<button class="btn go" style="justify-content:center" data-line>${esc(tx(U.nextline))} →</button>` : ""}`;
    }
    case "try": {
      const m = TRY[c.model] || TRY.sip, key = S.li + ":" + S.ci;
      if (!S.tv || S.tv._k !== key) S.tv = { _k: key, ...Object.fromEntries(m.inputs.map(i => [i.id, (c.vals && c.vals[i.id]) ?? i.v])) };
      return `${c.h ? head : `<h2 class="h">${esc(m.h)}</h2>`}<div class="card tr"><div class="small" style="font-weight:800">${esc(tx(c.s) || m.s)}</div>${m.inputs.map(i => `<label class="tr-in"><span>${esc(i.l)}</span><b id="tv-${i.id}">${esc(i.f(S.tv[i.id]))}</b><input type="range" data-try="${i.id}" min="${i.min}" max="${i.max}" step="${i.st}" value="${S.tv[i.id]}" aria-label="${esc(i.l)}"></label>`).join("")}</div><div class="card tr-out" id="tr-out" style="background:#FFF1C2">${tryResult(m, S.tv)}</div>`;
    }
    case "anim": return `${head}${animHtml(c)}`;
    case "fact": {
      const hl = t => esc(t).replace(/(₹\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:lakh|crore|cr|L|k)\b)?|\d[\d,]*(?:\.\d+)?\s?(?:%|x\b|years?\b|months?\b|days?\b|yrs?\b|lakh|crore))/gi, '<span class="num">$1</span>');
      return `${head}<div class="fact"><div class="art">${iconFor(c.art || c.big, 240)}</div><div class="big" ${c.long ? 'style="font-size:17px;font-weight:700;text-align:left"' : ""}>${hl(tx(c.big))}</div></div>`;
    }
    case "eg": {
      return `${head}${c.intro ? `<p class="s">${esc(tx(c.intro))}</p>` : ""}<div class="pts">${c.rows.map(r => { const sum = r[0] === "="; const q = sum ? r.slice(1) : r; return `<div class="egr ${sum ? "sum" : ""}"><span>${esc(tx(q[0]))}</span><b>${esc(q.slice(1).map(tx).join(" · "))}</b></div>`; }).join("")}</div>${c.note ? `<p class="small">${esc(tx(c.note))}</p>` : ""}`;
    }
    case "link": return `${head}${sub}<div class="art">${iconFor(c.art || c.h, 190)}</div><a class="btn go" style="justify-content:center;text-decoration:none" href="${esc(c.href)}">${esc(tx(c.label))}</a>`;
    case "pool": {
      const v = S.nv.pot, each = Math.round(10000 * v / 100), up = v >= 100;
      return `${head}<div class="art">${ART.pot}</div><div class="card"><div class="small" style="font-weight:800">${esc(tx(c.lab))}</div><div style="font-size:34px;font-weight:800">₹${(v / 100).toFixed(2)} crore</div><input type="range" id="pot" min="90" max="115" step="1" value="${v}" aria-label="Pot value"></div>
      <div class="card ${up ? "good" : ""}" style="background:${up ? "#E3F6EB" : "#FFE3E3"};font-weight:800;font-size:20px">${esc(tx(c.each))} ₹${each.toLocaleString("en-IN")}</div>`;
    }
    case "nav": {
      const n = S.nv, nav = n.net / n.units, units = n.amt / nav;
      const row = (id, lab, v, mn, mx, st, fmt) => `<div class="card" style="padding:10px 14px"><div style="display:flex;justify-content:space-between;font-weight:800;font-size:14px"><span>${esc(tx(lab))}</span><span>${fmt(v)}</span></div><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${v}"></div>`;
      return `${head}${row("net", c.l1, n.net, 50, 150, 10, v => "₹" + v + " crore")}${row("units", c.l2, n.units, 2, 10, 1, v => v + " crore")}${row("amt", c.l3, n.amt, 5000, 50000, 5000, v => "₹" + v.toLocaleString("en-IN"))}
      <div class="card" style="background:#2556B8;color:#fff"><div class="small" style="color:#fff;font-weight:800">NAV = ₹${n.net} cr ÷ ${n.units} cr</div><div style="font-size:34px;font-weight:800">₹${(Math.round(nav * 100) / 100).toLocaleString("en-IN")} <span style="font-size:15px">${esc(tx(c.perunit))}</span></div></div>
      <div class="card" style="font-weight:800;font-size:18px">₹${n.amt.toLocaleString("en-IN")} ÷ ₹${(Math.round(nav * 100) / 100)} = ${(Math.round(units * 10) / 10).toLocaleString("en-IN")} ${esc(tx(c.units))}</div>`;
    }
    case "compare": {
      return `${head}<div class="row" style="align-items:stretch">${c.cols.map(k => `<div class="card" style="flex:1;background:${k.c};padding:12px"><div style="font-weight:800;font-size:16px;margin-bottom:8px">${esc(tx(k.t))}</div>${k.rows.map(r => `<div style="border-top:2px solid #2B21181f;padding:6px 0"><div class="small">${esc(tx(r[0]))}</div><div style="font-weight:800;font-size:17px">${esc(tx(r[1]))}</div></div>`).join("")}</div>`).join("")}</div>${sub}`;
    }
    case "tiles": {
      const n = S.tiles.length;
      return `${head}<p class="small" style="margin:0">${esc(tx(U.tapEach))} · ${n} / ${c.items.length}</p><div class="trk">${c.items.map((x, i) => `<button class="tile2 ${S.tiles.includes(i) ? "open" : ""}" style="--c:${x[2]}" data-tile="${i}"><span class="pin">${i + 1}</span><span class="stx"><b>${esc(tx(x[0]))}</b>${S.tiles.includes(i) ? `<span>${esc(tx(x[1]))}</span>` : ""}</span></button>`).join("")}</div>`;
    }
    case "pick": {
      const done = S.pick.includes(c.ans), L4 = ["A", "B", "C", "D"];
      return `${head}${c.q ? `<div class="card" style="font-size:18px;font-weight:700;line-height:1.35">${esc(tx(c.q))}</div>` : ""}<div class="pts">${c.opts.map((o, i) => { const tried = S.pick.includes(i) || done, ok = i === c.ans;
        return `<button class="opt ${tried ? (ok ? "ok" : "no") : ""}" data-pick="${i}" ${done ? "disabled" : ""}><span class="ol">${L4[i]}</span><span class="ot">${esc(tx(o))}${tried && (ok || (c.why && c.why[i])) ? `<span class="why2">${ok ? "✓ " : ""}${esc(tx((c.why && c.why[i]) || ""))}</span>` : ""}</span></button>`; }).join("")}</div>`;
    }
    case "journey": {
      const st = c.st, at = S.stop, last = at >= st.length - 1;
      return `${head}<div class="trk">${st.map((x, i) => `<div class="stn ${i < at ? "past" : ""} ${i === at ? "now" : ""}" style="--c:${x[2]}"><span class="pin">${i === at ? sikka(30) : i + 1}</span><div class="stx"><b>${esc(tx(x[0]))}</b>${i <= at ? `<span>${esc(tx(x[1]))}</span>` : ""}</div></div>`).join("")}</div>
      ${last ? `<div class="card pop good" style="font-weight:700">${esc(tx(U.arrived))}</div>` : `<button class="btn go" style="justify-content:center" data-stop>${esc(tx(U.nextstop))} →</button>`}`;
    }
    case "order": {
      const names = LESSONS[S.li].cards[1].st, got = S.ord, chips = [4, 2, 3].filter(p => !got.includes(p));
      const place = i => `<div class="pt pop" style="background:${names[i][2]}"><i style="background:#fff">${i + 1}</i>${esc(tx(names[i][0]))}</div>`;
      return `${head}<p class="small" style="margin:0">${esc(tx(U.tapOrder))}</p>
      <div class="pts">${place(0)}${place(1)}${got.map(place).join("")}</div>
      ${chips.length ? `<div class="chips">${chips.map(p => `<button class="chip" style="background:${names[p][2]}" data-ord="${p}">${esc(tx(names[p][0]))}</button>`).join("")}</div>` : `<div class="card pop good" style="font-weight:800">${esc(tx(U.ordered))} ${esc(tx(U.arrived))}</div>`}
      ${S.bad && chips.length ? `<div class="why">${esc(tx(U.notyet))}</div>` : ""}<div class="small">${esc(tx(U.learnaid))}</div>`;
    }
    case "scam": {
      const msgs = [[T("Hello! Welcome to the group.", "नमस्ते! समूह में आपका स्वागत है।", "નમસ્તે! ગ્રુપમાં તમારું સ્વાગત છે."), false, null],
        [T("Congratulations! Join our group for guaranteed 40% monthly returns.", "बधाई हो! हमारे समूह से जुड़िए और हर महीने पक्का 40% प्रतिफल पाइए।", "અભિનંદન! અમારા ગ્રુપમાં જોડાઓ અને દર મહિને પાક્કું 40% વળતર મેળવો."), true, T("Nobody can guarantee returns.", "कोई प्रतिफल की गारंटी नहीं दे सकता।", "કોઈ વળતરની ગેરંટી આપી શકતું નથી.")],
        [T("Pay ₹5,000 today to unlock your seat. Only 3 left!", "आज ₹5,000 भरकर अपनी जगह पक्की कीजिए। केवल 3 बची हैं!", "આજે ₹5,000 ભરીને તમારી જગ્યા પાક્કી કરો. ફક્ત 3 બાકી છે!"), true, T("Paying to join and fake urgency are classic tricks.", "जुड़ने के लिए भुगतान और नकली जल्दबाज़ी पुरानी चालें हैं।", "જોડાવા ચૂકવણી અને નકલી ઉતાવળ જૂની ચાલ છે.")],
        [T("Share your OTP so we can verify you. Tell no one.", "सत्यापन के लिए अपना OTP बताइए। किसी को मत बताइए।", "ચકાસણી માટે તમારો OTP જણાવો. કોઈને કહેશો નહીં."), true, T("An OTP is a key to your money. Never share it.", "OTP आपके पैसे की चाबी है। इसे कभी साझा न करें।", "OTP તમારા પૈસાની ચાવી છે. તેને ક્યારેય શેર ન કરો.")]];
      const n = [1, 2, 3].filter(i => S.flags[i]).length;
      return `${head}<p class="small" style="margin:0">${esc(tx(U.tapflags))}</p>
      <div style="background:#E7F4E9;border:3px solid #2B2118;border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:8px">${msgs.map((m, i) => `<div><button class="msg ${!m[1] && S.flags[i] ? "ok" : ""}" data-flag="${i}" aria-pressed="${S.flags[i] && m[1]}">${esc(tx(m[0]))}</button>${S.flags[i] ? `<div class="why ${m[1] ? "" : "good"}">${esc(tx(m[1] ? m[2] : U.normal))}</div>` : ""}</div>`).join("")}</div>
      <div class="s" style="font-weight:800">${esc(fill(tx(U.found), n))}</div>`;
    }
    case "myth": {
      const r = S.myth;
      return `${head}<div class="card" style="text-align:center;padding:24px 18px"><div style="font-size:22px;font-weight:800;line-height:1.25">${esc(tx(c.q))}</div></div>
      <div class="row"><button class="btn" style="flex:1;justify-content:center;color:#C0392B" data-myth="myth" ${r ? "disabled" : ""}>✕ ${esc(tx(U.myth))}</button><button class="btn" style="flex:1;justify-content:center;color:#1E8E56" data-myth="fact" ${r ? "disabled" : ""}>✓ ${esc(tx(U.fact))}</button></div>
      ${r ? `<div class="card pop" style="background:${r === c.ans ? "#E3F6EB" : "#FFE3E3"}"><b>${esc(tx(r === c.ans ? U.right : U.wrong))}</b> ${esc(tx(c.why))}</div>` : ""}`;
    }
    case "budget": {
      const rem = 100 - S.budget.reduce((a, b) => a + b, 0), names = [T("Needs", "ज़रूरतें", "જરૂરિયાતો"), T("Wants", "इच्छाएँ", "ઇચ્છાઓ"), T("Save", "बचत", "બચત")], cols = ["#8EC5FF", "#FF9C6B", "#3CC47A"];
      const verdict = S.budget[2] >= 20 ? T("Strong start. Saving 20 or more builds a habit.", "मज़बूत शुरुआत। 20 या अधिक की बचत आदत बनाती है।", "મજબૂત શરૂઆત. 20 કે વધુની બચત આદત બનાવે છે.") : T("Try to move more into Save. Even 10 is a start.", "बचत में और डालने की कोशिश कीजिए। 10 भी शुरुआत है।", "બચતમાં વધુ મૂકવા પ્રયત્ન કરો. 10 પણ શરૂઆત છે.");
      return `${head}<div style="display:flex;height:34px;border:3px solid var(--ink);border-radius:12px;overflow:hidden;background:#fff">${S.budget.map((v, i) => `<div style="width:${v}%;background:${cols[i]};transition:width .2s"></div>`).join("")}</div>
      ${S.budget.map((v, i) => `<div class="stepper"><span style="width:12px;height:12px;border-radius:50%;background:${cols[i]};border:2px solid var(--ink)"></span><b style="flex:1">${esc(tx(names[i]))}</b><button class="sb" data-bm="${i}" aria-label="minus" ${v < 10 ? "disabled" : ""}>−</button><b style="min-width:58px;text-align:center">₹${v}</b><button class="sb" data-bp="${i}" aria-label="plus" ${rem < 10 ? "disabled" : ""}>+</button></div>`).join("")}
      <div class="card ${S.budget[2] >= 20 ? "good" : ""}" style="font-weight:700">${esc(tx(verdict))}</div>`;
    }
    case "r72": {
      const y = 72 / S.rate, bs = [1, 2, 4, 8].map((m, i) => [m * 20, i === 0 ? "₹1L" : "₹" + m + "L", i === 3 ? "#1E8E56" : "#FFC531", i === 0 ? "0" : (Math.round(y * i * 10) / 10) + " " + tx(U.yr)]);
      let sv = ""; let x = 14; bs.forEach(([h, l, c, yy]) => { sv += `<rect x="${x}" y="${190 - h}" width="52" height="${h}" rx="6" fill="${c}" ${O}/><text x="${x + 26}" y="${184 - h}" text-anchor="middle" font-size="12" font-weight="800">${l}</text><text x="${x + 26}" y="212" text-anchor="middle" font-size="11" font-weight="800" fill="#6B5A44">${yy}</text>`; x += 66; });
      return `${head}<div class="card"><div class="small" style="font-weight:800">${LANG === "en" ? "Assumed return a year" : LANG === "hi" ? "मानकर चला गया वार्षिक प्रतिफल" : "ધારેલું વાર્ષિક વળતર"}</div><div style="font-size:46px;font-weight:800">${S.rate}%</div><input type="range" id="rate" min="4" max="15" step="1" value="${S.rate}" aria-label="Return"></div>
      <div class="card" style="background:#1E8E56;color:#fff"><div class="small" style="color:#fff;font-weight:800">72 ÷ ${S.rate} =</div><div style="font-size:36px;font-weight:800">${Math.round(y * 10) / 10} ${esc(tx(U.yrs))}</div></div>
      <div class="art"><svg viewBox="0 0 280 220" width="280" height="200" role="img" aria-label="Bars doubling"><rect x="4" y="192" width="272" height="4" rx="2" fill="#2B2118"/>${sv}</svg></div><div class="small">${esc(tx(U.illus))}</div>`;
    }
    case "health": {
      const left = S.ins ? 8 : 3;
      return `${head}<div class="seg2"><button data-ins="0" aria-pressed="${!S.ins}">${LANG === "en" ? "No cover" : LANG === "hi" ? "बीमा नहीं" : "વીમો નથી"}</button><button data-ins="1" aria-pressed="${S.ins}">${LANG === "en" ? "With cover" : LANG === "hi" ? "बीमा है" : "વીમો છે"}</button></div>
      <div class="card"><div class="small" style="font-weight:800">${LANG === "en" ? "House savings left after the ₹5 lakh bill" : LANG === "hi" ? "₹5 लाख के बिल के बाद घर के लिए बची बचत" : "₹5 લાખના બિલ પછી ઘર માટે બચેલી બચત"}</div>
        <div style="height:40px;border:3px solid var(--ink);border-radius:12px;background:#EFE6D2;overflow:hidden;margin:10px 0"><div style="height:100%;width:${left / 8 * 100}%;background:${S.ins ? "#1E8E56" : "#E8573D"};transition:width .35s"></div></div>
        <div style="font-size:34px;font-weight:800">₹${left} ${esc(tx(U.lakh))} <span class="small">/ ₹8 ${esc(tx(U.lakh))}</span></div></div>
      <div class="card pop" style="background:${S.ins ? "#E3F6EB" : "#FFE3E3"};font-weight:700;font-size:15px;line-height:1.4">${S.ins ? (LANG === "en" ? "The covered bill is paid by the insurer, so the house fund stays whole. Check limits, waiting periods and exclusions." : LANG === "hi" ? "कवर किया गया बिल बीमा कंपनी चुकाती है, इसलिए घर की निधि सुरक्षित रहती है। सीमाएँ, प्रतीक्षा अवधि और अपवाद जाँचिए।" : "આવરી લીધેલું બિલ વીમા કંપની ચૂકવે છે, તેથી ઘરનું ભંડોળ સલામત રહે છે. મર્યાદાઓ, રાહ જોવાનો સમયગાળો અને અપવાદો તપાસો.") : (LANG === "en" ? "The family pays from the house fund. Almost 4 in 10 rupees of it are gone." : LANG === "hi" ? "परिवार घर की निधि से भुगतान करता है। उसका लगभग 40% हिस्सा चला जाता है।" : "પરિવાર ઘરના ભંડોળમાંથી ચૂકવે છે. તેનો લગભગ 40% ભાગ જતો રહે છે.")}</div><div class="small">${esc(tx(U.illus))}</div>`;
    }
  }
  return "";
}
const mood = c => c.k === "pick" ? (S.pick.includes(c.ans) ? "joy" : S.pick.length ? "think" : "happy") : c.k === "myth" ? (S.myth ? (S.myth === c.ans ? "joy" : "warn") : "think") : c.k === "hook" ? "wow" : c.k === "remember" ? "joy" : c.k === "order" ? (S.bad ? "warn" : "think") : "happy";
/* "Try it": a live calculator card. The learner drags sliders and watches the result move. */
const inr = n => n >= 1e7 ? "₹" + (n / 1e7).toFixed(2) + " crore" : n >= 1e5 ? "₹" + (n / 1e5).toFixed(2) + " lakh" : "₹" + Math.round(n).toLocaleString("en-IN");
const TRY = {
  sip: { h: "Try it: grow a SIP", s: "Drag the sliders. See what a small monthly amount can become.", inputs: [{ id: "amt", l: "Every month", min: 500, max: 50000, st: 500, v: 5000, f: v => "₹" + v.toLocaleString("en-IN") }, { id: "yrs", l: "For how long", min: 1, max: 30, st: 1, v: 10, f: v => v + " years" }, { id: "rate", l: "Assumed yearly return", min: 4, max: 18, st: 1, v: 12, f: v => v + "%" }],
    calc: v => { const n = v.yrs * 12, r = v.rate / 1200, fv = v.amt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r), inv = v.amt * n; return { big: inr(fv), lead: "You could have", a: inv, b: fv - inv, la: "You put in " + inr(inv), lb: "Growth " + inr(fv - inv), note: "An assumed rate, not a promise. Real returns go up and down." }; } },
  lump: { h: "Try it: one amount, left to grow", s: "Change the amount, the years and the rate.", inputs: [{ id: "amt", l: "Amount invested once", min: 10000, max: 1000000, st: 10000, v: 100000, f: v => inr(v) }, { id: "yrs", l: "For how long", min: 1, max: 30, st: 1, v: 10, f: v => v + " years" }, { id: "rate", l: "Assumed yearly return", min: 2, max: 18, st: 1, v: 10, f: v => v + "%" }],
    calc: v => { const fv = v.amt * Math.pow(1 + v.rate / 100, v.yrs); return { big: inr(fv), lead: "It could become", a: v.amt, b: fv - v.amt, la: "You put in " + inr(v.amt), lb: "Growth " + inr(fv - v.amt), note: "Time does most of the work. Watch what the last ten years add." }; } },
  inflation: { h: "Try it: what prices do over time", s: "Pick a bill today and see its price later.", inputs: [{ id: "amt", l: "A bill today", min: 1000, max: 100000, st: 1000, v: 10000, f: v => "₹" + v.toLocaleString("en-IN") }, { id: "yrs", l: "After", min: 1, max: 30, st: 1, v: 10, f: v => v + " years" }, { id: "rate", l: "Prices rise by", min: 2, max: 10, st: 1, v: 6, f: v => v + "% a year" }],
    calc: v => { const fv = v.amt * Math.pow(1 + v.rate / 100, v.yrs); return { big: inr(fv), lead: "The same bill could cost", a: v.amt, b: fv - v.amt, la: "Today " + inr(v.amt), lb: "Extra " + inr(fv - v.amt), note: "Money that sits still buys less every year." }; } },
  emi: { h: "Try it: what a loan really costs", s: "Move the sliders and watch the interest part.", inputs: [{ id: "amt", l: "Loan amount", min: 100000, max: 5000000, st: 50000, v: 500000, f: v => inr(v) }, { id: "rate", l: "Interest per year", min: 6, max: 24, st: 1, v: 10, f: v => v + "%" }, { id: "yrs", l: "Repay over", min: 1, max: 20, st: 1, v: 5, f: v => v + " years" }],
    calc: v => { const n = v.yrs * 12, r = v.rate / 1200, e = v.amt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1), tot = e * n; return { big: "₹" + Math.round(e).toLocaleString("en-IN") + " a month", lead: "Your EMI", a: v.amt, b: tot - v.amt, la: "Loan " + inr(v.amt), lb: "Interest " + inr(tot - v.amt), note: "A longer loan lowers the EMI but raises the interest you pay." }; } }
};
const tryResult = (m, v) => { const o = m.calc(v), t = o.a + o.b, pa = Math.max(4, Math.round(o.a / t * 100));
  return `<div class="tr-lead">${esc(o.lead)}</div><div class="tr-big">${esc(o.big)}</div><div class="tr-bar"><i style="width:${pa}%"></i><b style="width:${100 - pa}%"></b></div><div class="tr-leg"><span>${esc(o.la)}</span><span>${esc(o.lb)}</span></div><div class="small">${esc(o.note)}</div>`; };
const PASSIVE = ["hook", "meet", "picture", "remember", "dialog", "tiles", "compare", "fact", "eg", "anim"];
const spokenOf = c => [c.k === "anim" && speakOf(c, tx), c.lines && c.lines.map(([w, t]) => tx(t)).join(" "), c.items && c.items.map(x => tx(x[0]) + ". " + tx(x[1])).join(" "), c.q && c.k === "pick" && "", c.h && tx(c.h), c.big && tx(c.big), c.rows && c.rows.map(r => r.filter(x => x !== "=").map(tx).join(", ")).join(". "), c.s && c.k !== "sip" && tx(c.s), c.q && tx(c.q), c.pts && c.pts.map(tx).join(". ")].filter(Boolean).join(". ");
const ICO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B2118" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
function player() {
  const L = LESSONS[S.li], c = L.cards[S.ci], tot = L.cards.length;
  const bars = L.cards.map((_, i) => `<i class="${i <= S.ci ? "on" : ""}${i === S.ci ? " cur" : ""}"></i>`).join("");
  return `<div class="player" style="background:${L.color}"><div class="bgc" aria-hidden="true"><i>₹</i><i>%</i><i>₹</i><i>%</i></div><div class="bars">${bars}</div>
  <div class="bar2"><span>${esc(tx(L.title))} · ${esc(fill(tx(U.cardOf), S.ci + 1, tot))}</span><span class="hud"><b class="xp">⚡ ${S.xp}</b>${S.combo > 1 ? `<b class="cb">🔥 x${S.combo}</b>` : ""}</span><button class="x" data-home aria-label="Close">✕</button></div>
  ${S.fx ? `<div class="fx ${S.fx.t}" aria-live="polite">${esc(S.fx.txt)}</div>` : ""}<div class="body pop" id="body">${cardHtml(c, L)}</div>
  ${noVoice ? `<div class="small">${esc(tx(U.novoice))}</div>` : ""}
  <div class="guide">${sikka(68, mood(c))}<div class="tipb">${esc(tx(c.tip || U.sikkaSays))}</div></div>
  <div class="foot"><button class="btn" data-listen>${ICO}<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>${esc(custom ? "Read aloud" : tx(U.listen))}</button><button class="btn ${S.auto ? "go" : ""}" data-auto>${ICO}${S.auto ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M7 4l13 8-13 8z"/>'}</svg>${esc(custom ? (S.auto ? "Pause" : "Auto-play") : tx(S.auto ? U.pause : U.play))}</button></div>
  <div class="row"><button class="btn" data-prev ${S.ci === 0 ? "disabled" : ""} style="flex:1;justify-content:center">${esc(tx(U.back))}</button><button class="btn go" data-next style="flex:1;justify-content:center">${esc(tx(U.next))}</button></div></div>`;
}
function finish() {
  const L = LESSONS[S.li], nx = LESSONS[S.li + 1];
  const cf = Array.from({ length: 30 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 10) * 0.12}s;--c:${["#FFC531", "#3CC47A", "#8EC5FF", "#FF9C6B", "#D8B4FE"][i % 5]}"></i>`).join("");
  return `<div class="player" style="background:#D9F2E3"><div class="cf" aria-hidden="true">${cf}</div><div class="body" style="align-items:center;justify-content:center;text-align:center;gap:14px">
  <svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label="Badge"><circle cx="60" cy="54" r="40" fill="#FFC531" ${O}/><circle cx="60" cy="54" r="30" fill="none" stroke="#C99A12" stroke-width="3"/><path d="M42 54l12 12 24-24" fill="none" stroke="#1E8E56" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 90l-8 24 28-12 28 12-8-24" fill="#E8573D" ${O} stroke-linejoin="round"/></svg>
  <h2 class="h">${esc(tx(U.complete))}</h2><p class="s">${esc(tx(L.title))}</p><div class="stats"><span><b>⚡ ${S.xp}</b>XP</span><span><b>${S.asked ? S.right + "/" + S.asked : "–"}</b>right</span><span><b>🔥 ${S.best}</b>best streak</span></div>${custom && custom.rateOn ? `<div class="rate" data-rate><div class="rq">How was this lesson?</div><div class="rfaces">${FACES.map((f, i) => `<button data-star="${i + 1}" aria-label="${i + 1} of 5">${f}</button>`).join("")}</div><div class="rout"></div></div>` : ""}<div class="guide" style="justify-content:center">${mascot({ view: "full", pose: "cheer", mood: "joy", px: 150 })}</div>
  ${custom ? "" : `<button class="btn" data-copy>${esc(tx(U.copy))}</button><div class="small" id="cp"></div>`}</div>
  <div class="foot">${custom ? (custom.next || []).map(a => `<a class="btn ${a.go ? "go" : ""}" style="justify-content:center;text-decoration:none" href="${esc(a.href)}">${esc(a.label)}</a>`).join("") : `<button class="btn" data-home>${esc(tx(U.all))}</button>`}${!custom && nx ? `<button class="btn go" data-open="${S.li + 1}">${esc(tx(U.nextStory))}</button>` : ""}</div></div>`;
}
function render() {
  stopAnim();
  app.innerHTML = S.view === "home" ? home() : S.view === "done" ? finish() : player();
  bind(); S.fx = null;
  const an = S.view === "play" && LESSONS[S.li].cards[S.ci].k === "anim" ? app.querySelector("[data-anim]") : null; if (an && !S.noAnim) startAnim(app, LESSONS[S.li].cards[S.ci], tx); S.noAnim = false;
}
/* Moves between cards. In Play mode Sarthi reads each card and moves on by herself; cards that need a tap wait for you. */
function enter() {
  clearTimeout(timer); if (!S.auto || S.view !== "play") return;
  const c = LESSONS[S.li].cards[S.ci], text = spokenOf(c), idx = S.ci, li = S.li;
  const after = () => { if (S.auto && S.view === "play" && S.ci === idx && S.li === li && PASSIVE.includes(c.k)) timer = setTimeout(() => { if (S.auto && S.ci === idx) go(1); }, 700); };
  if (!speak(text, after)) { render(); timer = setTimeout(after, Math.max(3500, text.length * 70)); }
}
function go(d) {
  stopAll(); noVoice = false; S.myth = null; S.stop = 0; S.ord = []; S.bad = 0; S.line = 1; S.tiles = []; S.pick = []; S.flags = [false, false, false, false];
  const L = LESSONS[S.li], n = S.ci + d; if (n < 0) return;
  if (n >= L.cards.length) { if (custom) { try { custom.finish && custom.finish(); } catch (e) {} } else { S.done[L.id] = 1; try { localStorage.setItem("uc.stories", JSON.stringify(S.done)); } catch (e) {} } S.view = "done"; render(); if (S.auto) speak(tx(U.complete) + ". " + tx(L.title)); return; }
  if (d > 0 && !custom_seen(S.li, S.ci)) { S.xp += 3; S.fx = { t: "ok", txt: "+3 ⚡" }; }
  S.ci = n; render(); enter();
}
const SEEN = new Set(); const custom_seen = (li, ci) => { const k = LESSONS[li].id + ":" + ci; if (SEEN.has(k)) return true; SEEN.add(k); return false; };
function bind() {
  app.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { stopAll(); I18n.setLanguage(b.dataset.lang); });
  app.querySelectorAll("[data-exit]").forEach(b => b.onclick = () => { stopAll(); location.hash = "#/"; });
  app.querySelectorAll("[data-star]").forEach(b => b.onclick = () => { const n = +b.dataset.star; rateSave(n); app.querySelectorAll("[data-star]").forEach(x => { x.disabled = true; x.classList.toggle("on", x === b); });
    const out = app.querySelector(".rate .rout"); if (!out) return;
    out.innerHTML = n >= 4 ? `<div>Glad you liked it. Tell a friend?</div><div class="row2"><a class="btn go" target="_blank" rel="noopener" href="${esc(waHref())}" style="text-decoration:none">Share on WhatsApp</a><button class="btn" data-copysite>Copy link</button><a class="btn" href="#/challenge" style="text-decoration:none">Duel a friend</a></div>` : `<div>Sorry about that. What was it?</div><div class="chips2">${FIX.map(f => `<button data-fix>${esc(f)}</button>`).join("")}</div>`;
    const cp = out.querySelector("[data-copysite]"); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(siteUrl()); cp.textContent = "Copied"; } catch (e) { cp.textContent = "Use WhatsApp"; } };
    out.querySelectorAll("[data-fix]").forEach(x => x.onclick = () => { x.style.background = "#FFC531"; x.textContent += " ✓"; });
  });
  app.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { stopAll(); S.view = "play"; S.li = +b.dataset.open; S.ci = 0; S.xp = 0; S.combo = 0; S.best = 0; S.right = 0; S.asked = 0; S.fx = null; S.flags = [false, false, false, false]; S.myth = null; S.stop = 0; S.ord = []; S.bad = 0; S.line = 1; S.tiles = []; S.pick = []; render(); enter(); });
  app.querySelectorAll("[data-home]").forEach(b => b.onclick = () => { stopAll(); if (custom) { location.hash = custom.exit; return; } S.auto = false; S.view = "home"; render(); });
  const nx = app.querySelector("[data-next]"), pv = app.querySelector("[data-prev]"), L = LESSONS[S.li];
  if (nx) nx.onclick = () => go(1); if (pv) pv.onclick = () => go(-1);
  const body = $("#body"); if (body) body.onclick = e => { if (e.target.closest("button,input,.card,.msg,.stepper,.trk")) return; const r = body.getBoundingClientRect(); go(e.clientX > r.left + r.width * 0.35 ? 1 : -1); };
  const ls = app.querySelector("[data-listen]"); if (ls) ls.onclick = () => { if (!speak(spokenOf(L.cards[S.ci]))) render(); };
  app.querySelectorAll("[data-try]").forEach(inp => inp.oninput = () => { const cc = L.cards[S.ci], m = TRY[cc.model] || TRY.sip; S.tv[inp.dataset.try] = +inp.value; const lab = $("#tv-" + inp.dataset.try), spec = m.inputs.find(i => i.id === inp.dataset.try); if (lab) lab.textContent = spec.f(+inp.value); const o = $("#tr-out"); if (o) o.innerHTML = tryResult(m, S.tv); });
  const rp = app.querySelector("[data-replay]"); if (rp) rp.onclick = () => startAnim(app, L.cards[S.ci], tx);
  const au = app.querySelector("[data-auto]"); if (au) au.onclick = () => { S.auto = !S.auto; if (S.auto) { render(); enter(); } else { stopAll(); render(); } };
  const sip = $("#sip"); if (sip) sip.oninput = () => { S.sip = +sip.value; const c = sip.closest(".card"); c.querySelector("div:nth-child(2)").textContent = "₹" + S.sip.toLocaleString("en-IN"); $("#sipout").textContent = "≈ " + money(S.sip * 999.15); };
  const rate = $("#rate"); if (rate) rate.oninput = () => { S.rate = +rate.value; render(); const r2 = $("#rate"); if (r2) r2.focus(); };
  app.querySelectorAll("[data-flag]").forEach(b => b.onclick = () => { S.flags[+b.dataset.flag] = true; render(); });
  app.querySelectorAll("[data-myth]").forEach(b => b.onclick = () => { S.myth = b.dataset.myth; render(); });
  app.querySelectorAll("[data-bm]").forEach(b => b.onclick = () => { S.budget[+b.dataset.bm] -= 10; render(); });
  app.querySelectorAll("[data-bp]").forEach(b => b.onclick = () => { S.budget[+b.dataset.bp] += 10; render(); });
  app.querySelectorAll("[data-ins]").forEach(b => b.onclick = () => { S.ins = b.dataset.ins === "1"; render(); });
  app.querySelectorAll("[data-line]").forEach(b => b.onclick = () => { S.line++; render(); });
  app.querySelectorAll("[data-tile]").forEach(b => b.onclick = () => { const i = +b.dataset.tile; if (!S.tiles.includes(i)) S.tiles.push(i); render(); const it = L.cards[S.ci].items[i]; if (S.auto) speak(tx(it[0]) + ". " + tx(it[1])); });
  app.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => { const i = +b.dataset.pick; const cc = L.cards[S.ci]; if (custom && custom.answer && cc.id && !S.pick.length) custom.answer(cc.id, i === cc.ans); if (!S.pick.length) { const ok = i === cc.ans; S.asked++; if (ok) { S.right++; S.combo++; S.best = Math.max(S.best, S.combo); const g = 10 + Math.min(S.combo - 1, 4) * 5; S.xp += g; S.fx = { t: "ok", txt: "+" + g + " XP" + (S.combo > 1 ? " · " + S.combo + " in a row!" : "") }; try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} } else { S.combo = 0; S.fx = { t: "no", txt: "Not yet. Read why." }; } } if (!S.pick.includes(i)) S.pick.push(i); render(); });
  for (const [id, key] of [["pot", "pot"], ["net", "net"], ["units", "units"], ["amt", "amt"]]) { const el = $("#" + id); if (el) el.oninput = () => { S.nv[key] = +el.value; render(); const e2 = $("#" + id); if (e2) e2.focus(); }; }
  app.querySelectorAll("[data-stop]").forEach(b => b.onclick = () => { S.stop++; render(); const st = L.cards[S.ci].st[S.stop]; if (S.auto && st) speak(tx(st[0]) + ". " + tx(st[1])); });
  app.querySelectorAll("[data-ord]").forEach(b => b.onclick = () => { const p = +b.dataset.ord; if (p === 2 + S.ord.length) { S.ord.push(p); S.bad = 0; } else S.bad = 1; render(); });
  const cp = app.querySelector("[data-copy]"); if (cp) cp.onclick = () => { const t = tx(L.title) + " — " + tx(L.sub) + "\n" + tx(U.brand) + "\nhttps://ucwacademy.in/#/story/" + L.id; try { navigator.clipboard.writeText(t).then(() => { $("#cp").textContent = tx(U.copied); }, () => { $("#cp").textContent = t; }); } catch (e) { $("#cp").textContent = t; } };
}
if (custom) LESSONS.push(custom.lesson);
if (window.__ucCollect && custom) { try { custom.lesson.cards.forEach(c => { const x = spokenOf(c); if (x) window.__ucCollect(langOfText(x), hashOf(x), x); }); window.__ucCollect(langOfText(tx(U.complete)), hashOf(tx(U.complete) + ". " + tx(custom.lesson.title)), tx(U.complete) + ". " + tx(custom.lesson.title)); } catch (e) {} }
const first = custom ? LESSONS.length - 1 : startId && LESSONS.findIndex(l => l.id === startId);
if (first >= 0) { S.view = "play"; S.li = first; S.ci = 0; S.xp = 0; S.combo = 0; S.best = 0; S.right = 0; S.asked = 0; }
try { window.speechSynthesis && window.speechSynthesis.getVoices(); } catch (e) {}
addEventListener("hashchange", stopAll, { once: true });
render();

}
