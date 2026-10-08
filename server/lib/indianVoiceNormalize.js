const INDIC_SCRIPT_RE = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/
const SUPPORTED_INDIC_LOCALE_RE = /^(hi|mr|bn|ta|te|gu|kn|ml|pa)-/i

const WORDS = {
  greeting: ['हॅलो', 'हेलो', 'नमस्कार', 'नमस्ते', 'हाय', 'হ্যালো', 'নমস্কার', 'வணக்கம்', 'హలో', 'નમસ્તે', 'ಹಲೋ', 'ನಮಸ್ಕಾರ', 'ഹലോ', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'],
  how: ['कसा', 'कशी', 'कसे', 'कैसे', 'कैसी', 'आहेस', 'आहात', 'हो', 'আছ', 'কেমন', 'எப்படி', 'ఉన్నావు', 'કેમ છો', 'ಹೇಗಿದ್ದೀಯ', 'സുഖമാണോ', 'ਕਿਵੇਂ ਹੋ'],
  thanks: ['धन्यवाद', 'थँक्स', 'आभार', 'शुक्रिया', 'ধন্যবাদ', 'நன்றி', 'ధన్యవాదాలు', 'આભાર', 'ಧನ್ಯವಾದ', 'നന്ദി', 'ਧੰਨਵਾਦ'],
  time: ['वेळ', 'वाजले', 'समय', 'टाइम', 'সময়', 'நேரம்', 'సమయం', 'સમય', 'ಸಮಯ', 'സമയം', 'ਸਮਾਂ'],
  date: ['तारीख', 'दिनांक', 'आजचा दिवस', 'आज काय', 'তারিখ', 'தேதி', 'తేదీ', 'તારીખ', 'ದಿನಾಂಕ', 'തീയതി', 'ਤਾਰੀਖ'],
  battery: ['बॅटरी', 'बैटरी', 'battery', 'ব্যাটারি', 'பேட்டரி', 'బ్యాటరీ', 'બેટરી', 'ಬ್ಯಾಟರಿ', 'ബാറ്ററി', 'ਬੈਟਰੀ'],
  help: ['मदत', 'हेल्प', 'सहायता', 'help', 'সাহায্য', 'உதவி', 'సహాయం', 'મદદ', 'ಸಹಾಯ', 'സഹായം', 'ਮਦਦ'],
  sos: ['एसओएस', 'sos', 'आपत्कालीन', 'इमर्जन्सी', 'জরুরি', 'அவசரம்', 'అత్యవసరం', 'કટોકટી', 'ತುರ್ತು', 'അടിയന്തര', 'ਐਮਰਜੈਂਸੀ'],
  dark: ['डार्क', 'काळा', 'काला', 'गडद', 'ডার্ক', 'இருள்', 'డార్క్', 'ડાર્ક', 'ಕಪ್ಪು', 'ഡാർക്ക്', 'ਡਾਰਕ'],
  light: ['लाईट', 'लाइट', 'पांढरा', 'सफेद', 'हलका', 'লাইট', 'வெளிச்சம்', 'లైట్', 'લાઇટ', 'ಬೆಳಕು', 'ലൈറ്റ്', 'ਲਾਈਟ'],
  mode: ['मोड', 'थीम', 'theme', 'mode', 'মোড', 'தீம்', 'మోడ్', 'થીમ', 'મોડ', 'ಮೋಡ್', 'മോഡ്', 'ਮੋਡ'],
  open: ['उघड', 'उघडा', 'खोल', 'खोलो', 'ओपन', 'चालू', 'सुरू', 'सुरु', 'दाखव', 'दिखाओ', 'খুল', 'খোলো', 'திற', 'திறக்க', 'தொடங்கு', 'తెరువు', 'చూపించు', 'ખોલ', 'ચાલુ', 'ತೇರಿ', 'ತೆರೆ', 'ತೆರೆಯ', 'കാണിക്ക', 'തുറ', 'ਖੋਲ੍ਹ', 'ਦਿਖਾ'],
  close: ['बंद', 'क्लोज', 'close', 'বন্ধ', 'மூடு', 'మూసివేయి', 'બંધ', 'ಮುಚ್ಚು', 'അടയ്ക്ക', 'ਬੰਦ'],
  ip: ['ip', 'आयपी', 'आईपी', 'नेटवर्क', 'পাইপি', 'আইপি', 'நெட்வொர்க்', 'ఐపీ', 'નેટવર્ક', 'ಐಪಿ', 'നെറ്റ്‌വർക്ക്', 'ਆਈਪੀ'],
  showFind: ['दाखव', 'दिखाओ', 'शोध', 'काय', 'पत्ता', 'address', 'show', 'find', 'খুঁজ', 'দেখাও', 'காட்டு', 'தேடு', 'చూపించు', 'వెతుకు', 'બતાવ', 'શોધ', 'ತೋರಿಸು', 'ಹುಡುಕು', 'കാണിക്ക', 'തിരയ', 'ਦਿਖਾ', 'ਲੱਭ'],
  write: ['लिहा', 'लिखो', 'टाइप', 'टाका', 'जोडा', 'add', 'append', 'write', 'type', 'লিখ', 'টাইপ', 'எழுது', 'டைப்', 'రాయి', 'టైప్', 'લખ', 'ટાઇપ', 'ಬರೆ', 'ಟೈಪ್', 'എഴുത്', 'ടൈപ്പ്', 'ਲਿਖ', 'ਟਾਈਪ'],
  search: ['शोध', 'सर्च', 'गूगल', 'google', 'search', 'খুঁজ', 'সার্চ', 'தேடு', 'సెర్చ్', 'શોધ', 'ಹುಡುಕು', 'തിരയ', 'ਲੱਭ']
}

const APP_ALIASES = [
  { app: 'notes', words: ['notes', 'note', 'notepad', 'नोट्स', 'नोट', 'नोटपॅड', 'नोटपैड', 'নোট', 'நோட்ஸ்', 'குறிப்பு', 'నోట్స్', 'નોટ્સ', 'નોટ', 'ನೋಟ್ಸ್', 'ಟಿಪ್ಪಣಿ', 'നോട്ട്', 'കുറിപ്പ്', 'ਨੋਟ', 'ਨੋਟਸ'] },
  { app: 'terminal', words: ['terminal', 'cmd', 'command', 'टर्मिनल', 'कमांड', 'सीएमडी', 'টার্মিনাল', 'கட்டளை', 'டெர்மினல்', 'టెర్మినల్', 'કમાન્ડ', 'ટર્મિનલ', 'ಕಮಾಂಡ್', 'ಟರ್ಮಿನಲ್', 'കമാൻഡ്', 'ടെർമിനൽ', 'ਕਮਾਂਡ', 'ਟਰਮੀਨਲ'] },
  { app: 'calculator', words: ['calculator', 'calc', 'कॅल्क्युलेटर', 'कैलकुलेटर', 'गणक', 'হিসাব', 'கணிப்பான்', 'క్యాల్క్యులేటర్', 'કેલ્ક્યુલેટર', 'ಕ್ಯಾಲ್ಕುಲೇಟರ್', 'കാൽക്കുലേറ്റർ', 'ਕੈਲਕੁਲੇਟਰ'] },
  { app: 'browser', words: ['browser', 'internet', 'web', 'ब्राउझर', 'इंटरनेट', 'ব্রাউজার', 'இணையம்', 'బ్రౌజర్', 'બ્રાઉઝર', 'ಬ್ರೌಸರ್', 'ബ്രൗസർ', 'ਬਰਾਊਜ਼ਰ'] },
  { app: 'settings', words: ['settings', 'setting', 'सेटिंग्स', 'सेटिंग', 'সেটিংস', 'அமைப்புகள்', 'సెట్టింగ్స్', 'સેટિંગ્સ', 'ಸೆಟ್ಟಿಂಗ್ಸ್', 'ക്രമീകരണം', 'ਸੈਟਿੰਗ'] },
  { app: 'translator', words: ['translator', 'translate', 'ट्रान्सलेटर', 'भाषांतर', 'अनुवाद', 'অনুবাদ', 'மொழிபெயர்ப்பு', 'అనువాదం', 'અનુવાદ', 'ಅನುವಾದ', 'വിവർത്തനം', 'ਅਨੁਵਾਦ'] },
  { app: 'reminders', words: ['reminder', 'reminders', 'alarm', 'रिमाइंडर', 'आठवण', 'अलार्म', 'রিমাইন্ডার', 'நினைவூட்டல்', 'రిమైండర్', 'રીમાઇન્ડર', 'ಜ್ಞಾಪನೆ', 'ഓർമ്മപ്പെടുത്തൽ', 'ਰੀਮਾਈਂਡਰ'] },
  { app: 'file explorer', words: ['file explorer', 'files', 'folder', 'फाइल', 'फाईल', 'फोल्डर', 'ফাইল', 'கோப்பு', 'ఫైల్', 'ફાઇલ', 'ಫೈಲ್', 'ഫയൽ', 'ਫਾਈਲ'] },
  { app: 'vault', words: ['vault', 'password', 'वॉल्ट', 'पासवर्ड', 'ভল্ট', 'கடவுச்சொல்', 'వాల్ట్', 'વૉલ્ટ', 'ವಾಲ್ಟ್', 'വോൾട്ട്', 'ਵਾਲਟ'] },
  { app: 'emergency', words: ['emergency', 'sos', 'एसओएस', 'आपत्कालीन', 'জরুরি', 'அவசரம்', 'అత్యవసరం', 'કટોકટી', 'ತುರ್ತು', 'അടിയന്തര', 'ਐਮਰਜੈਂਸੀ'] }
]

const hasAny = (text, words) => words.some(word => text.includes(word.toLowerCase()))
const commandWords = [
  ...WORDS.time, ...WORDS.date, ...WORDS.battery, ...WORDS.help, ...WORDS.sos,
  ...WORDS.dark, ...WORDS.light, ...WORDS.mode, ...WORDS.open, ...WORDS.close,
  ...WORDS.ip, ...WORDS.showFind, ...WORDS.write, ...WORDS.search
]

const INDIC_DIGITS = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9'
}

const REMINDER_WORDS = [
  'reminder', 'reminders', 'alarm', 'रिमाइंडर', 'रीमाइंडर', 'याद', 'याद दिला', 'अलार्म',
  'आठवण', 'आठवण करून', 'रिमाइंड', 'રીમાઇન્ડર', 'યાદ', 'રિમાઇન્ડર',
  'রিমাইন্ডার', 'মনে কর', 'நினைவூட்டல்', 'நினைவூட்டு', 'రిమైండర్', 'గుర్తు',
  'ಜ್ಞಾಪನೆ', 'ನೆನಪಿಸು', 'ഓർമ്മപ്പെടുത്തൽ', 'ഓർമ്മിപ്പിക്ക', 'ਰੀਮਾਈਂਡਰ', 'ਯਾਦ'
]

const REMINDER_VERBS = [
  'set', 'add', 'create', 'make', 'सेट', 'करके दो', 'कर दो', 'बनाओ', 'लगाओ', 'लगा दो',
  'ठेवा', 'लाव', 'करून दे', 'મૂકો', 'સેટ', 'કરો', 'দিন', 'সেট', 'வை', 'सेट करा',
  'పెట్టు', 'सेट कर', 'ಹಾಕು', 'ಸೇಟ್', 'വെക്കൂ', 'ਲਗਾਓ'
]

const DAILY_WORDS = [
  'daily', 'every day', 'everyday', 'रोज', 'रोज़', 'हर दिन', 'दररोज', 'दर रोज',
  'દરરોજ', 'રોજ', 'প্রতিদিন', 'தினமும்', 'రోజూ', 'ಪ್ರತಿದಿನ', 'ദിവസവും', 'ਹਰ ਰੋਜ਼'
]

const TITLE_FILLERS = [
  'मेरे लिए', 'मुझे', 'एक', 'के लिए', 'करने के लिए', 'लेने के लिए', 'मला', 'माझ्यासाठी',
  'का', 'की', 'के', 'को', 'मेरा', 'मेरी', 'मेरे', 'મારા માટે', 'મને', 'আমার জন্য',
  'எனக்கு', 'నా కోసం', 'ನನಗೆ', 'എനിക്ക്', 'ਮੇਰੇ ਲਈ'
]

function resolveApp(text) {
  const match = APP_ALIASES.find(item => hasAny(text, item.words))
  return match && match.app
}

function extractAfterAny(raw, words) {
  const lowerRaw = raw.toLowerCase()
  for (const word of words) {
    const index = lowerRaw.indexOf(word.toLowerCase())
    if (index >= 0) return raw.slice(index + word.length).trim()
  }
  return ''
}

function normalizeIndicDigits(text = '') {
  return String(text).replace(/[०-९০-৯૦-૯੦-੯౦-౯೦-೯]/g, (ch) => INDIC_DIGITS[ch] || ch)
}

function hasReminderIntent(text) {
  return hasAny(text, REMINDER_WORDS) || hasAny(text, REMINDER_VERBS)
}

function extractClock(raw) {
  const normalized = normalizeIndicDigits(raw)
  const match = normalized.match(/(?:^|\D)([01]?\d|2[0-3])\s*(?::|\.|ः)\s*([0-5]\d)(?:\s*(a\.?m\.?|p\.?m\.?|am|pm))?/i)
             || normalized.match(/(?:^|\D)([1-9]|1[0-2])\s*(a\.?m\.?|p\.?m\.?|am|pm)\b/i)
  if (!match) return null
  const whole = match[0]
  const leading = whole.match(/^\D/) ? 1 : 0
  const hour = match[1]
  const minute = match[2] && /^\d{2}$/.test(match[2]) ? match[2] : '00'
  const suffix = (match[3] || (/a\.?m\.?|p\.?m\.?/i.test(match[2] || '') ? match[2] : '') || '')
    .toLowerCase()
    .replace(/\./g, '')
  return {
    start: match.index + leading,
    end: match.index + whole.length,
    text: `${hour}:${minute}${suffix ? ` ${suffix}` : ''}`
  }
}

function cleanReminderTitle(text = '') {
  let out = String(text || '').trim()
  for (const word of [...REMINDER_WORDS, ...REMINDER_VERBS, ...DAILY_WORDS, ...TITLE_FILLERS]) {
    out = out.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ')
  }
  out = out
    .replace(/\b(?:please|for me|to|for|at|on|by|set|add|create|make|a|an|the)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+लेने$/u, ' लेना')
    .replace(/लेने$/u, 'लेना')
  return out
}

function normalizeReminderCommand(raw, text) {
  if (!hasReminderIntent(text)) return null
  const clock = extractClock(raw)
  if (!clock) return null

  const daily = hasAny(text, DAILY_WORDS)
  const afterTime = raw.slice(clock.end).trim()
  const beforeTime = raw.slice(0, clock.start).trim()
  const title = cleanReminderTitle(afterTime) || cleanReminderTitle(beforeTime) || 'reminder'
  return `set a reminder to ${title}${daily ? ' every day' : ''} at ${clock.text}`
}

function normalizeIndianVoiceCommand(input = '', locale = '') {
  const raw = String(input || '').trim()
  if (!raw) return raw
  const text = raw.toLowerCase()
  const shouldNormalize = INDIC_SCRIPT_RE.test(raw) || SUPPORTED_INDIC_LOCALE_RE.test(locale || '')
  if (!shouldNormalize) return raw

  const reminderCommand = normalizeReminderCommand(raw, text)
  if (reminderCommand) return reminderCommand

  if (hasAny(text, WORDS.greeting) && hasAny(text, WORDS.how)) return 'hello how are you'
  if (hasAny(text, WORDS.how) && !resolveApp(text) && !hasAny(text, commandWords)) return 'hello how are you'
  if (hasAny(text, WORDS.greeting)) return 'hello'
  if (hasAny(text, WORDS.thanks)) return 'thank you'
  if (hasAny(text, WORDS.time)) return 'what time is it'
  if (hasAny(text, WORDS.date)) return 'what date is it'
  if (hasAny(text, WORDS.battery)) return 'battery status'
  if (hasAny(text, WORDS.sos)) return 'call for help'
  if (hasAny(text, WORDS.help)) return 'help'
  if (hasAny(text, WORDS.dark) && hasAny(text, WORDS.mode)) return 'switch to dark mode'
  if (hasAny(text, WORDS.light) && hasAny(text, WORDS.mode)) return 'switch to light mode'

  if (hasAny(text, WORDS.ip) && hasAny(text, WORDS.showFind)) {
    return 'open terminal and find my ip address'
  }

  const app = resolveApp(text)
  if (app === 'notes' && hasAny(text, WORDS.write)) {
    const noteText = extractAfterAny(raw, WORDS.write)
    if (noteText) return `open notes and write ${noteText}`
  }
  if (app && hasAny(text, WORDS.close)) return `close ${app}`
  if (app && hasAny(text, WORDS.open)) return `open ${app}`

  if (hasAny(text, WORDS.search)) {
    const query = extractAfterAny(raw, WORDS.search)
    if (query) return `search ${query}`
  }

  return raw
}

module.exports = { normalizeIndianVoiceCommand }
