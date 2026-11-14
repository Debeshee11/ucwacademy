"""Hindi and Gujarati landing pages for NISM Series V-A. NISM runs the V-A exam in English and Hindi; our mocks and guide are in English."""
from common import SITE, esc, write, app_link, file_for
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, share_html
import nism_pages as N

HI_OBJ = "https://www.nism.ac.in/test-objectives-mutual-fund-distributors-certification-examination-hindi"

T = {
 "hi": dict(
  title="NISM V-A परीक्षा की तैयारी हिंदी में: पैटर्न, सिलेबस, मॉक",
  desc="NISM Series V-A (म्यूचुअल फंड डिस्ट्रीब्यूटर) परीक्षा: 100 सवाल, 120 मिनट, पास 50%, निगेटिव मार्किंग नहीं। यूनिट-वार सिलेबस और मुफ़्त मॉक टेस्ट।",
  crumb="हिंदी में", home="होम",
  h1="NISM Series V-A परीक्षा की तैयारी हिंदी में",
  lead="म्यूचुअल फंड डिस्ट्रीब्यूटर बनने के लिए यह परीक्षा ज़रूरी है। नीचे परीक्षा का पैटर्न, 12 यूनिट का सिलेबस और तैयारी की योजना है।",
  eyebrow="NISM परीक्षा की तैयारी · मुफ़्त",
  cta="मुफ़्त मॉक 1 दें", pdf="स्टडी गाइड PDF", en="English page", other=("gu", "ગુજરાતીમાં"),
  pat_h="परीक्षा का पैटर्न",
  facts=[("100", "सवाल"), ("100", "अंक"), ("120 मिनट", "समय"), ("50%", "पास होने के लिए"), ("नहीं", "निगेटिव मार्किंग"), ("12", "यूनिट")],
  lang_h="क्या यह परीक्षा हिंदी में दी जा सकती है?",
  lang_p=f"हाँ। NISM Series V-A परीक्षा अंग्रेज़ी और हिंदी दोनों में उपलब्ध है, और NISM हिंदी में परीक्षा के उद्देश्य भी प्रकाशित करता है। आधिकारिक हिंदी पन्ना यहाँ देखें: <a href='{HI_OBJ}' rel='noopener nofollow' target='_blank'>NISM हिंदी टेस्ट ऑब्जेक्टिव्स</a>। परीक्षा बुक करते समय भाषा चुनें।",
  mat_h="हमारी तैयारी सामग्री",
  mat_p="हमारे मॉक टेस्ट, यूनिट नोट्स और स्टडी गाइड अंग्रेज़ी में हैं। ऐप के बटन और मेन्यू हिंदी में बदले जा सकते हैं। हर सवाल के साथ सही जवाब और उसकी वजह दी जाती है।",
  syl_h="सिलेबस: यूनिट के अनुसार", syl_p="प्रतिशत बताता है कि हर यूनिट से आम तौर पर कितने सवाल आते हैं। ज़्यादा प्रतिशत वाली यूनिट को ज़्यादा समय दें।", unit="यूनिट",
  prep_h="तैयारी कैसे करें",
  prep=["स्टडी गाइड की पहली तीन पेज पढ़ें।", "सबसे भारी यूनिट पहले पढ़ें।", "एक बार पूरा पढ़ने के बाद मॉक 1 दें।", "मॉक में पास मार्क से 15 अंक ऊपर आने पर अगला मॉक दें।", "हर गलत जवाब दोबारा करें। हर एक के साथ उसकी यूनिट लिखी होती है।"],
  plan="4 हफ़्ते की पूरी योजना (अंग्रेज़ी)",
  faqs=[("NISM V-A में कितने सवाल आते हैं?", "100 बहुविकल्पीय सवाल, 100 अंक, 120 मिनट में।"),
        ("NISM V-A में पास होने के लिए कितने अंक चाहिए?", "कुल अंकों का 50%, यानी 100 में से 50। निगेटिव मार्किंग नहीं है, इसलिए हर सवाल हल करें।"),
        ("क्या NISM V-A हिंदी में दे सकते हैं?", "हाँ। यह परीक्षा अंग्रेज़ी और हिंदी में उपलब्ध है। परीक्षा बुक करते समय भाषा चुनें।"),
        ("क्या आपके मॉक टेस्ट मुफ़्त हैं?", "हाँ। 5 पूरे मॉक टेस्ट और स्टडी गाइड मुफ़्त हैं। एक बार मोबाइल नंबर या Google से साइन इन करना होता है। मॉक अंग्रेज़ी में हैं।")],
  note="UpperCrust Academy, UpperCrust Wealth की ओर से स्वतंत्र तैयारी सामग्री है। NISM, SEBI या AMFI से जुड़ी नहीं है। केवल शिक्षा के लिए, निवेश सलाह नहीं। नवीनतम नियम NISM की वेबसाइट पर जाँचें।"),
 "gu": dict(
  title="NISM V-A પરીક્ષાની તૈયારી ગુજરાતીમાં: પેટર્ન, સિલેબસ, મોક",
  desc="NISM Series V-A (મ્યુચ્યુઅલ ફંડ ડિસ્ટ્રિબ્યુટર) પરીક્ષા: 100 પ્રશ્નો, 120 મિનિટ, પાસ 50%, નેગેટિવ માર્કિંગ નથી. યુનિટ મુજબ સિલેબસ અને મફત મોક ટેસ્ટ.",
  crumb="ગુજરાતીમાં", home="હોમ",
  h1="NISM Series V-A પરીક્ષાની તૈયારી ગુજરાતીમાં",
  lead="મ્યુચ્યુઅલ ફંડ ડિસ્ટ્રિબ્યુટર બનવા માટે આ પરીક્ષા જરૂરી છે. નીચે પરીક્ષાની પેટર્ન, 12 યુનિટનો સિલેબસ અને તૈયારીની યોજના છે.",
  eyebrow="NISM પરીક્ષાની તૈયારી · મફત",
  cta="મફત મોક 1 આપો", pdf="સ્ટડી ગાઇડ PDF", en="English page", other=("hi", "हिन्दी में"),
  pat_h="પરીક્ષાની પેટર્ન",
  facts=[("100", "પ્રશ્નો"), ("100", "ગુણ"), ("120 મિનિટ", "સમય"), ("50%", "પાસ થવા માટે"), ("નથી", "નેગેટિવ માર્કિંગ"), ("12", "યુનિટ")],
  lang_h="પરીક્ષા કઈ ભાષામાં આપી શકાય?",
  lang_p=f"NISM Series V-A પરીક્ષા અંગ્રેજી અને હિન્દીમાં ઉપલબ્ધ છે. હાલમાં ગુજરાતીમાં ઉપલબ્ધ હોવાનું અમે ચકાસ્યું નથી, તેથી પરીક્ષા બુક કરતા પહેલાં <a href='https://www.nism.ac.in/' rel='noopener nofollow' target='_blank'>NISM ની વેબસાઇટ</a> પર ભાષાઓ તપાસો.",
  mat_h="અમારી તૈયારી સામગ્રી",
  mat_p="અમારા મોક ટેસ્ટ, યુનિટ નોટ્સ અને સ્ટડી ગાઇડ અંગ્રેજીમાં છે. એપના બટન અને મેનુ ગુજરાતીમાં બદલી શકાય છે. દરેક પ્રશ્ન સાથે સાચો જવાબ અને તેનું કારણ આપેલું છે.",
  syl_h="સિલેબસ: યુનિટ મુજબ", syl_p="ટકાવારી બતાવે છે કે દરેક યુનિટમાંથી સામાન્ય રીતે કેટલા પ્રશ્નો આવે છે. વધુ ટકાવારીવાળા યુનિટને વધુ સમય આપો.", unit="યુનિટ",
  prep_h="તૈયારી કેવી રીતે કરવી",
  prep=["સ્ટડી ગાઇડના પહેલા ત્રણ પાના વાંચો.", "સૌથી વધુ વજનવાળા યુનિટ પહેલાં વાંચો.", "એક વાર આખું વાંચ્યા પછી મોક 1 આપો.", "મોકમાં પાસ માર્કથી 15 ગુણ ઉપર આવો ત્યારે આગલો મોક આપો.", "દરેક ખોટો જવાબ ફરીથી કરો. દરેક સાથે તેનું યુનિટ લખેલું હોય છે."],
  plan="4 અઠવાડિયાની પૂરી યોજના (અંગ્રેજી)",
  faqs=[("NISM V-A માં કેટલા પ્રશ્નો આવે છે?", "100 બહુવિકલ્પી પ્રશ્નો, 100 ગુણ, 120 મિનિટમાં."),
        ("NISM V-A માં પાસ થવા કેટલા ગુણ જોઈએ?", "કુલ ગુણના 50%, એટલે કે 100 માંથી 50. નેગેટિવ માર્કિંગ નથી, તેથી દરેક પ્રશ્ન હલ કરો."),
        ("શું અમારા મોક ટેસ્ટ મફત છે?", "હા. 5 પૂરા મોક ટેસ્ટ અને સ્ટડી ગાઇડ મફત છે. એક વાર મોબાઇલ નંબર અથવા Google થી સાઇન ઇન કરવું પડે છે. મોક અંગ્રેજીમાં છે."),
        ("શું NISM V-A ગુજરાતીમાં આપી શકાય?", "NISM V-A અંગ્રેજી અને હિન્દીમાં ઉપલબ્ધ છે. ગુજરાતી માટે પરીક્ષા બુક કરતા પહેલાં NISM ની વેબસાઇટ તપાસો.")],
  note="UpperCrust Academy, UpperCrust Wealth તરફથી સ્વતંત્ર તૈયારી સામગ્રી છે. NISM, SEBI કે AMFI સાથે જોડાયેલી નથી. ફક્ત શિક્ષણ માટે, રોકાણની સલાહ નથી. નવીનતમ નિયમો NISM ની વેબસાઇટ પર તપાસો."),
}


def path(lang):
    return f"/learn/{lang}-nism-v-a-mutual-fund-distributors"


def build():
    e = next(x for x in N.EXAMS if x["id"] == "nism-v-a"); d = N.detail(e); ep = N.path_of(e); out = []
    alts = [("en", ep), ("hi", path("hi")), ("gu", path("gu"))]
    for lang, t in T.items():
        p = path(lang)
        facts = "<div class='facts'>" + "".join(f"<div><b>{esc(v)}</b><span>{esc(k)}</span></div>" for v, k in t["facts"]) + "</div>"
        rows = "".join(f"<tr><td><a href='{N.unit_path(e, u)}'>{t['unit']} {u['n']}: {esc(u['title'])}</a></td><td>{u['w']}%</td></tr>" for u in d["units"])
        crumbs = [(t["home"], "/learn/"), ("NISM", "/learn/nism"), (t["crumb"], p)]
        body = f"""<section class="hero"><p class="eyebrow">{esc(t['eyebrow'])}</p><h1>{esc(t['h1'])}</h1><p class="lead">{esc(t['lead'])}</p>
<div class="cta"><a class="btn" href="{app_link('nism/nism-v-a/mock/1', 'v-a-' + lang)}">{esc(t['cta'])}</a><a class="btn ghost" href="/assets/nism/nism-v-a-study-guide.pdf" download>{esc(t['pdf'])}</a><a class="btn ghost" href="{ep}">{esc(t['en'])}</a><a class="btn ghost" href="{path(t['other'][0])}">{esc(t['other'][1])}</a></div>{share_html(SITE + p, t['h1'])}</section>
<section><h2>{esc(t['pat_h'])}</h2>{facts}</section>
<section><h2>{esc(t['lang_h'])}</h2><p>{t['lang_p']}</p></section>
<section><h2>{esc(t['mat_h'])}</h2><p>{esc(t['mat_p'])}</p></section>
<section><h2>{esc(t['syl_h'])}</h2><p>{esc(t['syl_p'])}</p><div class="tbl"><table><tbody>{rows}</tbody></table></div></section>
<section><h2>{esc(t['prep_h'])}</h2><ol class="steps">{''.join(f'<li>{esc(x)}</li>' for x in t['prep'])}</ol><p><a href="/learn/nism-v-a-study-plan">{esc(t['plan'])}</a></p></section>
{faq_html(t['faqs'])}<p class="fine">{esc(t['note'])}</p>"""
        write(file_for(p), page(path=p, title=t["title"], desc=t["desc"], body=body, lang=lang, alts=alts, og=N.og_of(e),
              ld=jsonld(crumbs_ld(crumbs), faq_ld(t["faqs"])), cta=(t["cta"], app_link("nism/nism-v-a/mock/1", "v-a-" + lang))))
        out.append(p)
    return out
