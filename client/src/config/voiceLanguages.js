export const VOICE_LANGUAGES = [
  { locale: 'en-US', label: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { locale: 'en-IN', label: 'English (India)', nativeName: 'English', flag: '🇮🇳' },
  { locale: 'hi-IN', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { locale: 'mr-IN', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { locale: 'bn-IN', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { locale: 'ta-IN', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { locale: 'te-IN', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { locale: 'gu-IN', label: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { locale: 'kn-IN', label: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { locale: 'ml-IN', label: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { locale: 'pa-IN', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
]

export const VOICE_LANGUAGE_BY_LOCALE = Object.fromEntries(
  VOICE_LANGUAGES.map(language => [language.locale, language])
)
