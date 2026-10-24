// Server-side localized strings (English / Sinhala / Tamil).
// NOTE for the team: have a native speaker proofread si/ta before you present.

export const LANGS = ['en', 'si', 'ta'];

export const FLAGS = {
  upfront_fee: {
    en: 'Asks you to pay money first (registration, visa, training or "processing" fee).',
    si: 'මුලින්ම මුදල් ගෙවන්න ඉල්ලයි (ලියාපදිංචි, වීසා, පුහුණු හෝ සැකසුම් ගාස්තු).',
    ta: 'முதலில் பணம் செலுத்தக் கேட்கிறது (பதிவு, விசா, பயிற்சி அல்லது செயலாக்கக் கட்டணம்).',
  },
  personal_docs: {
    en: 'Asks for passport, NIC, bank details or OTP up front.',
    si: 'මුලින්ම ගමන් බලපත්‍රය, ජාතික හැඳුනුම්පත, බැංකු විස්තර හෝ OTP ඉල්ලයි.',
    ta: 'முதலிலேயே கடவுச்சீட்டு, தேசிய அடையாள அட்டை, வங்கி விவரங்கள் அல்லது OTP கேட்கிறது.',
  },
  task_scam: {
    en: 'Looks like an online "task", like/review-for-pay or crypto work-from-home scam.',
    si: 'ඔන්ලයින් "කාර්ය", ලයික්/රිවීව් කර මුදල් ලැබීම හෝ ක්‍රිප්ටෝ ගෙදර සිට වැඩ වංචාවක් වැනිය.',
    ta: 'ஆன்லைன் "பணி", லைக்/விமர்சனம் செய்து பணம் அல்லது கிரிப்டோ வீட்டிலிருந்து வேலை மோசடி போலத் தெரிகிறது.',
  },
  unrealistic_salary: {
    en: 'Unusually high pay for little or no experience.',
    si: 'පළපුරුද්ද අඩුවට හෝ නැතිවට අසාමාන්‍ය ලෙස ඉහළ වැටුපක්.',
    ta: 'அனுபவம் குறைவாக அல்லது இல்லாமல் இருந்தும் வழக்கத்துக்கு மாறாக அதிக சம்பளம்.',
  },
  guaranteed_job: {
    en: 'Promises a guaranteed job, or says no qualifications or interview are needed.',
    si: 'රැකියාව සහතිකයි යැයි පොරොන්දු වෙයි, නැතහොත් සුදුසුකම් හෝ සම්මුඛ පරීක්ෂණයක් අවශ්‍ය නැතැයි කියයි.',
    ta: 'வேலை உறுதி என வாக்களிக்கிறது அல்லது தகுதி/நேர்காணல் தேவையில்லை என்கிறது.',
  },
  urgency: {
    en: 'Pressures you to act immediately (limited slots, apply today).',
    si: 'වහාම ක්‍රියා කරන්න පීඩනයක් (ඉඩ සීමිතයි, අදම අයදුම් කරන්න).',
    ta: 'உடனே செயல்பட அழுத்தம் (இடங்கள் குறைவு, இன்றே விண்ணப்பிக்கவும்).',
  },
  whatsapp_only: {
    en: 'Contact is only via WhatsApp/Telegram/Viber, with no company email or website.',
    si: 'සම්බන්ධ වීමට WhatsApp/Telegram/Viber පමණයි; සමාගම් ඊමේල් හෝ වෙබ් අඩවියක් නැහැ.',
    ta: 'WhatsApp/Telegram/Viber மூலம் மட்டுமே தொடர்பு; நிறுவன மின்னஞ்சல் அல்லது இணையதளம் இல்லை.',
  },
  free_email: {
    en: 'Uses a free personal email (Gmail/Yahoo, etc.) instead of a company address.',
    si: 'සමාගම් ලිපිනයක් වෙනුවට නොමිලේ පුද්ගලික ඊමේල් (Gmail/Yahoo ආදිය) භාවිතා කරයි.',
    ta: 'நிறுவன முகவரிக்குப் பதிலாக இலவசத் தனிப்பட்ட மின்னஞ்சல் (Gmail/Yahoo போன்றவை) பயன்படுத்துகிறது.',
  },
  foreign_job_promise: {
    en: 'Overseas job offer with easy visa/ticket promises. Check for a valid SLBFE licence first.',
    si: 'පහසු වීසා/ටිකට් පොරොන්දු සහිත විදේශ රැකියා දැන්වීමක්. මුලින්ම වලංගු SLBFE බලපත්‍රයක් ඇත්දැයි බලන්න.',
    ta: 'எளிதான விசா/டிக்கெட் வாக்குறுதிகளுடன் வெளிநாட்டு வேலை. முதலில் செல்லுபடியாகும் SLBFE உரிமம் உள்ளதா எனப் பாருங்கள்.',
  },
  suspicious_link: {
    en: 'Contains a shortened or unusual link.',
    si: 'කෙටි කළ හෝ අසාමාන්‍ය සබැඳියක් අඩංගුයි.',
    ta: 'சுருக்கப்பட்ட அல்லது வழக்கத்துக்கு மாறான இணைப்பு உள்ளது.',
  },
  vague_company: {
    en: 'No company name, address or website given.',
    si: 'සමාගමේ නම, ලිපිනය හෝ වෙබ් අඩවිය සඳහන් නැහැ.',
    ta: 'நிறுவனப் பெயர், முகவரி அல்லது இணையதளம் குறிப்பிடப்படவில்லை.',
  },
  reported_publisher: {
    en: 'A contact detail in this ad was reported by other users.',
    si: 'මෙම දැන්වීමේ ඇති සම්බන්ධතා විස්තරයක් වෙනත් පරිශීලකයින් විසින් වාර්තා කර ඇත.',
    ta: 'இந்த விளம்பரத்தில் உள்ள ஒரு தொடர்பு விவரம் பிற பயனர்களால் புகாரளிக்கப்பட்டுள்ளது.',
  },
};

export const GREENS = {
  no_fee_statement: {
    en: 'States that no fees are charged.',
    si: 'කිසිදු ගාස්තුවක් අය නොකරන බව සඳහන් කරයි.',
    ta: 'எந்தக் கட்டணமும் வசூலிக்கப்படாது என்று குறிப்பிடுகிறது.',
  },
  company_email: {
    en: 'Uses a company-style email domain.',
    si: 'සමාගම් ආකාරයේ ඊමේල් ඩොමේන් එකක් භාවිතා කරයි.',
    ta: 'நிறுவன வகை மின்னஞ்சல் டொமைனைப் பயன்படுத்துகிறது.',
  },
  interview_process: {
    en: 'Mentions an interview or selection process.',
    si: 'සම්මුඛ පරීක්ෂණ හෝ තේරීම් ක්‍රියාවලියක් සඳහන් කරයි.',
    ta: 'நேர்காணல் அல்லது தேர்வு செயல்முறையைக் குறிப்பிடுகிறது.',
  },
  named_company_address: {
    en: 'Includes a company name and a location.',
    si: 'සමාගමේ නම සහ ස්ථානයක් ඇතුළත්.',
    ta: 'நிறுவனப் பெயரும் இடமும் உள்ளன.',
  },
};

export const LEVELS = {
  low: { en: 'Low risk indicators', si: 'අඩු අවදානම් ලකුණු', ta: 'குறைந்த ஆபத்து அறிகுறிகள்' },
  medium: { en: 'Some warning signs', si: 'අවවාද ලකුණු කිහිපයක්', ta: 'சில எச்சரிக்கை அறிகுறிகள்' },
  high: { en: 'High risk, likely a scam', si: 'ඉහළ අවදානම්, වංචාවක් විය හැක', ta: 'அதிக ஆபத்து, மோசடியாக இருக்கலாம்' },
};

export const DISCLAIMER = {
  en: 'This is an automated risk estimate, not proof. Always verify the employer independently.',
  si: 'මෙය ස්වයංක්‍රීය අවදානම් ඇස්තමේන්තුවක් මිස සාක්ෂියක් නොවේ. සෑම විටම සේවායෝජකයා ස්වාධීනව තහවුරු කරගන්න.',
  ta: 'இது தானியங்கி ஆபத்து மதிப்பீடு மட்டுமே; ஆதாரம் அல்ல. எப்போதும் வேலையளிப்பவரைச் சுயமாகச் சரிபார்க்கவும்.',
};

export const NEXT_STEPS = {
  high: {
    en: [
      'Do NOT send money, passport/NIC copies, OTPs or bank details.',
      'For any foreign-employment offer, check that the agency holds a valid SLBFE licence (slbfe.lk) before dealing with it.',
      'Verify the company independently: find its official website and call a number you looked up yourself, not the one in the ad.',
      'Keep screenshots of the ad and chat, and any payment slips if you already paid.',
      'Report it to the Police cybercrime unit, or to SLBFE for foreign-job scams (check current contact details on their official sites). Warn family and friends before forwarding the ad.',
    ],
    si: [
      'මුදල්, ගමන් බලපත්‍ර/ජාතික හැඳුනුම්පත් පිටපත්, OTP හෝ බැංකු විස්තර කිසිවිටෙක එවන්න එපා.',
      'විදේශ රැකියා ඉල්ලීමක් සඳහා, ගනුදෙනු කිරීමට පෙර ආයතනයට වලංගු SLBFE බලපත්‍රයක් (slbfe.lk) ඇත්දැයි පරීක්ෂා කරන්න.',
      'සමාගම ස්වාධීනව තහවුරු කරගන්න: එහි නිල වෙබ් අඩවිය සොයා, දැන්වීමේ ඇති අංකයට නොව ඔබම සොයාගත් අංකයකට අමතන්න.',
      'දැන්වීමේ සහ සංවාදයේ තිර රූ තබාගන්න; දැනටමත් මුදල් ගෙවා ඇත්නම් ගෙවීම් රිසිට්පත් ද තබාගන්න.',
      'පොලිසියේ සයිබර් අපරාධ අංශයට, නැතහොත් විදේශ රැකියා වංචා සඳහා SLBFE වෙත පැමිණිලි කරන්න (නිල වෙබ් අඩවිවල වත්මන් සම්බන්ධතා විස්තර බලන්න). දැන්වීම ෆෝවර්ඩ් කිරීමට පෙර පවුලේ අයට සහ මිතුරන්ට අනතුරු අඟවන්න.',
    ],
    ta: [
      'பணம், கடவுச்சீட்டு/தேசிய அடையாள அட்டை நகல்கள், OTP அல்லது வங்கி விவரங்களை ஒருபோதும் அனுப்பாதீர்கள்.',
      'வெளிநாட்டு வேலை வாய்ப்புக்கு, பரிவர்த்தனைக்கு முன் அந்த நிறுவனத்திடம் செல்லுபடியாகும் SLBFE உரிமம் (slbfe.lk) உள்ளதா எனச் சரிபார்க்கவும்.',
      'நிறுவனத்தைச் சுயமாகச் சரிபார்க்கவும்: அதன் அதிகாரப்பூர்வ இணையதளத்தைக் கண்டறிந்து, விளம்பரத்தில் உள்ள எண்ணுக்கு அல்லாமல் நீங்களே கண்டறிந்த எண்ணை அழைக்கவும்.',
      'விளம்பரம் மற்றும் உரையாடலின் ஸ்கிரீன்ஷாட்களையும், ஏற்கனவே பணம் செலுத்தியிருந்தால் ரசீதுகளையும் பாதுகாக்கவும்.',
      'காவல்துறையின் சைபர் குற்றப் பிரிவுக்கு அல்லது வெளிநாட்டு வேலை மோசடிகளுக்கு SLBFE-க்குப் புகாரளிக்கவும் (அதிகாரப்பூர்வ இணையதளங்களில் தற்போதைய தொடர்பு விவரங்களைப் பார்க்கவும்). விளம்பரத்தை ஃபார்வர்டு செய்யும் முன் குடும்பத்தினரையும் நண்பர்களையும் எச்சரிக்கவும்.',
    ],
  },
  medium: {
    en: [
      'Do not pay anything or send documents until you have verified the employer.',
      'Ask for the company name, address, job description and a written offer, then compare them with the official website.',
      'Call the company on a number you found yourself. If they insist on WhatsApp only or ask for money, stop.',
    ],
    si: [
      'සේවායෝජකයා තහවුරු කරගන්නා තුරු කිසිවක් ගෙවීම හෝ ලේඛන යැවීම නොකරන්න.',
      'සමාගමේ නම, ලිපිනය, රැකියා විස්තරය සහ ලිඛිත පත්වීම් ලිපියක් ඉල්ලා, නිල වෙබ් අඩවිය සමඟ සසඳන්න.',
      'ඔබම සොයාගත් අංකයකින් සමාගමට අමතන්න. WhatsApp පමණක් යැයි කියා හෝ මුදල් ඉල්ලුවොත් නවතින්න.',
    ],
    ta: [
      'வேலையளிப்பவரைச் சரிபார்க்கும் வரை எதையும் செலுத்தவோ ஆவணங்களை அனுப்பவோ வேண்டாம்.',
      'நிறுவனப் பெயர், முகவரி, வேலை விவரம் மற்றும் எழுத்துப்பூர்வ வாய்ப்புக் கடிதத்தைக் கேட்டு, அதிகாரப்பூர்வ இணையதளத்துடன் ஒப்பிடுங்கள்.',
      'நீங்களே கண்டறிந்த எண்ணில் நிறுவனத்தை அழைக்கவும். WhatsApp மட்டுமே என வற்புறுத்தினால் அல்லது பணம் கேட்டால் நிறுத்துங்கள்.',
    ],
  },
  low: {
    en: [
      'A low score is not a guarantee. Still verify the employer before sharing documents.',
      'A real employer never asks you to pay to get a job.',
    ],
    si: [
      'අඩු ලකුණක් සහතිකයක් නොවේ. ලේඛන බෙදාගැනීමට පෙර සේවායෝජකයා තහවුරු කරගන්න.',
      'සැබෑ සේවායෝජකයෙක් රැකියාවක් ලබාදීමට මුදල් ඉල්ලන්නේ නැහැ.',
    ],
    ta: [
      'குறைந்த மதிப்பெண் உத்தரவாதம் அல்ல. ஆவணங்களைப் பகிரும் முன் வேலையளிப்பவரைச் சரிபார்க்கவும்.',
      'உண்மையான வேலையளிப்பவர் வேலை தருவதற்குப் பணம் கேட்க மாட்டார்.',
    ],
  },
};

export const pick = (obj, lang) => (obj ? obj[lang] || obj.en : '');
