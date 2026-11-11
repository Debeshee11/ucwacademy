"""Hindi and Gujarati personal finance pages. Hand-written; they link into the app, where the language can be switched."""
from common import SITE, esc, write, app_link, file_for
from layout import page, jsonld, faq_ld, faq_html, share_html

PAGES = {
 "hi": dict(
  title="पर्सनल फाइनेंस कोर्स हिंदी में: मुफ़्त | UpperCrust Academy",
  desc="बजट, इमरजेंसी फंड, बीमा, लोन, क्रेडिट स्कोर, SIP और म्यूचुअल फंड सीखें, हिंदी में, मुफ़्त। छोटे लेसन, क्विज़ और सर्टिफिकेट।",
  h1="पर्सनल फाइनेंस कोर्स हिंदी में: मुफ़्त",
  lead="पैसे की बुनियादी बातें आसान भाषा में। छोटे लेसन, सच्चे क्विज़ और ऐसा सर्टिफिकेट जिसे कोई भी ऑनलाइन जाँच सके।",
  topics_h="आप क्या सीखेंगे",
  topics=["बजट बनाना और इमरजेंसी फंड", "टर्म और हेल्थ इंश्योरेंस", "लोन, EMI और क्रेडिट स्कोर", "SIP और म्यूचुअल फंड की बुनियाद", "टैक्स और रिटायरमेंट की योजना", "NISM परीक्षा की तैयारी (मॉक टेस्ट और स्टडी गाइड)"],
  how_h="कैसे शुरू करें", how=["नीचे \"मुफ़्त शुरू करें\" दबाएँ।", "मोबाइल नंबर या Google से साइन इन करें।", "साइन-इन स्क्रीन पर \"हिन्दी\" चुनें। लेसन और क्विज़ हिंदी में खुलेंगे।"],
  cta="मुफ़्त शुरू करें", en="English page", other=("gu", "ગુજરાતીમાં"),
  faqs=[("क्या यह कोर्स मुफ़्त है?", "हाँ। सभी लेसन, क्विज़ और प्रैक्टिस मुफ़्त हैं। एक बार मोबाइल नंबर या Google से साइन इन करना होता है।"),
        ("इमरजेंसी फंड कितना होना चाहिए?", "आम नियम है कि ज़रूरी खर्चों का तीन से छह महीने का पैसा सुरक्षित और आसानी से निकल सकने वाली जगह पर रखें।"),
        ("क्या यह निवेश की सलाह है?", "नहीं। यह केवल शिक्षा के लिए है। अपने पैसे पर फ़ैसला लेने से पहले किसी योग्य सलाहकार से बात करें।")],
  note="UpperCrust Academy, UpperCrust Wealth की ओर से। केवल शिक्षा के लिए, निवेश सलाह नहीं।"),
 "gu": dict(
  title="પર્સનલ ફાઇનાન્સ કોર્સ ગુજરાતીમાં: મફત | UpperCrust Academy",
  desc="બજેટ, ઇમરજન્સી ફંડ, વીમો, લોન, ક્રેડિટ સ્કોર, SIP અને મ્યુચ્યુઅલ ફંડ ગુજરાતીમાં મફત શીખો. ટૂંકા પાઠ, ક્વિઝ અને સર્ટિફિકેટ.",
  h1="પર્સનલ ફાઇનાન્સ કોર્સ ગુજરાતીમાં: મફત",
  lead="પૈસાની પાયાની વાતો સરળ ભાષામાં. ટૂંકા પાઠ, પ્રામાણિક ક્વિઝ અને એવું સર્ટિફિકેટ જે કોઈ પણ ઓનલાઇન ચકાસી શકે.",
  topics_h="તમે શું શીખશો",
  topics=["બજેટ બનાવવું અને ઇમરજન્સી ફંડ", "ટર્મ અને હેલ્થ ઇન્સ્યોરન્સ", "લોન, EMI અને ક્રેડિટ સ્કોર", "SIP અને મ્યુચ્યુઅલ ફંડની પાયાની વાતો", "ટેક્સ અને નિવૃત્તિનું આયોજન", "NISM પરીક્ષાની તૈયારી (મોક ટેસ્ટ અને સ્ટડી ગાઇડ)"],
  how_h="કેવી રીતે શરૂ કરવું", how=["નીચે \"મફત શરૂ કરો\" દબાવો.", "મોબાઇલ નંબર અથવા Google થી સાઇન ઇન કરો.", "સાઇન-ઇન સ્ક્રીન પર \"ગુજરાતી\" પસંદ કરો. પાઠ અને ક્વિઝ ગુજરાતીમાં ખુલશે."],
  cta="મફત શરૂ કરો", en="English page", other=("hi", "हिन्दी में"),
  faqs=[("શું આ કોર્સ મફત છે?", "હા. બધા પાઠ, ક્વિઝ અને પ્રેક્ટિસ મફત છે. એક વાર મોબાઇલ નંબર અથવા Google થી સાઇન ઇન કરવું પડે છે."),
        ("ઇમરજન્સી ફંડ કેટલું હોવું જોઈએ?", "સામાન્ય નિયમ છે કે જરૂરી ખર્ચના ત્રણથી છ મહિનાના પૈસા સલામત અને સહેલાઈથી ઉપાડી શકાય તેવી જગ્યાએ રાખો."),
        ("શું આ રોકાણની સલાહ છે?", "ના. આ ફક્ત શિક્ષણ માટે છે. તમારા પૈસા અંગે નિર્ણય લેતા પહેલાં લાયક સલાહકાર સાથે વાત કરો.")],
  note="UpperCrust Academy, UpperCrust Wealth તરફથી. ફક્ત શિક્ષણ માટે, રોકાણની સલાહ નથી."),
}


def build():
    out = []
    alts = [("en", "/learn/personal-finance"), ("hi", "/learn/hi-personal-finance"), ("gu", "/learn/gu-personal-finance")]
    for lang, d in PAGES.items():
        p = f"/learn/{lang}-personal-finance"
        body = f"""<section class="hero"><p class="eyebrow">UpperCrust Academy</p><h1>{esc(d['h1'])}</h1><p class="lead">{esc(d['lead'])}</p>
<div class="cta"><a class="btn" href="{app_link('courses', 'pf-' + lang)}">{esc(d['cta'])}</a><a class="btn ghost" href="/learn/personal-finance">{esc(d['en'])}</a><a class="btn ghost" href="/learn/{d['other'][0]}-personal-finance">{esc(d['other'][1])}</a></div>{share_html(SITE + p, d['h1'])}</section>
<section><h2>{esc(d['topics_h'])}</h2><ul>{''.join(f'<li>{esc(x)}</li>' for x in d['topics'])}</ul></section>
<section><h2>{esc(d['how_h'])}</h2><ol class="steps">{''.join(f'<li>{esc(x)}</li>' for x in d['how'])}</ol></section>
{faq_html(d['faqs'])}<p class="fine">{esc(d['note'])}</p>"""
        write(file_for(p), page(path=p, title=d["title"], desc=d["desc"], body=body, lang=lang, alts=alts, og="/assets/og/personal-finance.jpg",
              ld=jsonld(faq_ld(d["faqs"])), cta=(d["cta"], app_link("courses", "pf-" + lang))))
        out.append(p)
    return out
