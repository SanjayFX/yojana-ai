'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SUPPORTED_LANGS, type LangCode } from '@/lib/i18n/translations'
import { useLang } from '@/lib/context/LanguageContext'

type Screen = 'hero' | 'form' | 'loading' | 'results'
type SchemeTypeFilter = 'all' | 'central' | 'state'

type SchemeExplanation = {
  why_you_qualify?: string
  first_step?: string
  watch_out_for?: string
  success_tip?: string
  estimated_time?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  error?: string
  fallback?: boolean
}

const SEARCH_TRANSLATIONS: Record<string, string> = {
  'கிசான்': 'kisan farmer',
  'விவசாயி': 'farmer kisan',
  'விவசாயம்': 'agriculture farmer',
  'சேரல்': 'Kerala',
  'தமிழ்': 'Tamil Nadu',
  'ஆரோக்கியம்': 'health',
  'கல்வி': 'education scholarship',
  'வீடு': 'housing home',
  'வேலை': 'employment',
  'பெண்': 'women',
  'முதியோர்': 'elderly pension',
  'ஊனமுற்றோர்': 'disability',
  'மாணவர்': 'student scholarship',
  'கடன்': 'loan finance',
  'காப்பீடு': 'insurance bima',
  'किसान': 'kisan farmer',
  'स्वास्थ्य': 'health',
  'शिक्षा': 'education',
  'আবাসন': 'housing',
  'কৃষক': 'farmer',
  'স্বাস্থ্য': 'health',
  'రైతు': 'farmer',
  'ಆರೋಗ್ಯ': 'health',
  'ರೈತ': 'farmer',
  'ખેડૂત': 'farmer',
  'આરોગ્ય': 'health',
}

const STATE_NAMES: Partial<Record<LangCode, Record<string, string>>> = {
  hi: {
    'Andhra Pradesh': 'आंध्र प्रदेश',
    'Arunachal Pradesh': 'अरुणाचल प्रदेश',
    'Assam': 'असम',
    'Bihar': 'बिहार',
    'Chhattisgarh': 'छत्तीसगढ़',
    'Delhi': 'दिल्ली',
    'Goa': 'गोवा',
    'Gujarat': 'गुजरात',
    'Haryana': 'हरियाणा',
    'Himachal Pradesh': 'हिमाचल प्रदेश',
    'Jharkhand': 'झारखंड',
    'Jammu & Kashmir': 'जम्मू और कश्मीर',
    'Karnataka': 'कर्नाटक',
    'Kerala': 'केरल',
    'Ladakh': 'लद्दाख',
    'Madhya Pradesh': 'मध्य प्रदेश',
    'Maharashtra': 'महाराष्ट्र',
    'Manipur': 'मणिपुर',
    'Meghalaya': 'मेघालय',
    'Mizoram': 'मिजोरम',
    'Nagaland': 'नागालैंड',
    'Odisha': 'ओडिशा',
    'Punjab': 'पंजाब',
    'Rajasthan': 'राजस्थान',
    'Sikkim': 'सिक्किम',
    'Tamil Nadu': 'तमिलनाडु',
    'Telangana': 'तेलंगाना',
    'Tripura': 'त्रिपुरा',
    'Uttar Pradesh': 'उत्तर प्रदेश',
    'Uttarakhand': 'उत्तराखंड',
    'West Bengal': 'पश्चिम बंगाल',
  },
  ta: {
    'Andhra Pradesh': 'ஆந்திர பிரதேசம்',
    'Arunachal Pradesh': 'அருணாச்சல பிரதேசம்',
    'Assam': 'அஸ்ஸாம்',
    'Bihar': 'பீகார்',
    'Chhattisgarh': 'சத்தீஸ்கர்',
    'Delhi': 'டெல்லி',
    'Goa': 'கோவா',
    'Gujarat': 'குஜராத்',
    'Haryana': 'ஹரியானா',
    'Himachal Pradesh': 'இமாச்சல பிரதேசம்',
    'Jharkhand': 'ஜார்கண்ட்',
    'Jammu & Kashmir': 'ஜம்மு காஷ்மீர்',
    'Karnataka': 'கர்நாடகா',
    'Kerala': 'கேரளா',
    'Madhya Pradesh': 'மத்திய பிரதேசம்',
    'Maharashtra': 'மகாராஷ்டிரா',
    'Manipur': 'மணிப்பூர்',
    'Meghalaya': 'மேகாலயா',
    'Mizoram': 'மிசோரம்',
    'Nagaland': 'நாகாலாந்து',
    'Odisha': 'ஒடிஸா',
    'Punjab': 'பஞ்சாப்',
    'Rajasthan': 'ராஜஸ்தான்',
    'Sikkim': 'சிக்கிம்',
    'Tamil Nadu': 'தமிழ் நாடு',
    'Telangana': 'தெலுங்கானா',
    'Tripura': 'திரிபுரா',
    'Uttar Pradesh': 'உத்தர பிரதேசம்',
    'Uttarakhand': 'உத்தராகண்ட்',
    'West Bengal': 'மேற்கு வங்காளம்',
  },
  bn: {
    'Andhra Pradesh': 'অন্ধ্র প্রদেশ',
    'Assam': 'আসাম',
    'Bihar': 'বিহার',
    'Chhattisgarh': 'ছত্তিশগড়',
    'Delhi': 'দিল্লি',
    'Gujarat': 'গুজরাট',
    'Haryana': 'হরিয়ানা',
    'Jharkhand': 'ঝাড়খণ্ড',
    'Jammu & Kashmir': 'জম্মু ও কাশ্মীর',
    'Karnataka': 'কর্ণাটক',
    'Kerala': 'কেরালা',
    'Madhya Pradesh': 'মধ্যপ্রদেশ',
    'Maharashtra': 'মহারাষ্ট্র',
    'Odisha': 'ওড়িশা',
    'Punjab': 'পাঞ্জাব',
    'Rajasthan': 'রাজস্থান',
    'Tamil Nadu': 'তামিলনাড়ু',
    'Telangana': 'তেলেঙ্গানা',
    'Uttar Pradesh': 'উত্তর প্রদেশ',
    'Uttarakhand': 'উত্তরাখণ্ড',
    'West Bengal': 'পশ্চিমবঙ্গ',
  },
  te: {
    'Andhra Pradesh': 'ఆంధ్రప్రదేశ్',
    'Assam': 'అస్సాం',
    'Bihar': 'బీహార్',
    'Chhattisgarh': 'ఛత్తీస్‌గఢ్',
    'Delhi': 'ఢిల్లీ',
    'Gujarat': 'గుజరాత్',
    'Haryana': 'హర్యానా',
    'Jharkhand': 'జార్ఖండ్',
    'Karnataka': 'కర్ణాటక',
    'Kerala': 'కేరళ',
    'Madhya Pradesh': 'మధ్యప్రదేశ్',
    'Maharashtra': 'మహారాష్ట్ర',
    'Odisha': 'ఒడిశా',
    'Punjab': 'పంజాబ్',
    'Rajasthan': 'రాజస్థాన్',
    'Tamil Nadu': 'తమిళనాడు',
    'Telangana': 'తెలంగాణ',
    'Uttar Pradesh': 'ఉత్తర ప్రదేశ్',
    'West Bengal': 'పశ్చిమ బెంగాల్',
  },
  kn: {
    'Andhra Pradesh': 'ಆಂಧ್ರ ಪ್ರದೇಶ',
    'Assam': 'ಅಸ್ಸಾಂ',
    'Bihar': 'ಬಿಹಾರ್',
    'Chhattisgarh': 'ಛತ್ತೀಸ್‌ಗಢ',
    'Delhi': 'ದೆಹಲಿ',
    'Gujarat': 'ಗುಜರಾತ್',
    'Haryana': 'ಹರಿಯಾಣ',
    'Jharkhand': 'ಜಾರ್ಖಂಡ್',
    'Karnataka': 'ಕರ್ನಾಟಕ',
    'Kerala': 'ಕೇರಳ',
    'Madhya Pradesh': 'ಮಧ್ಯಪ್ರದೇಶ',
    'Maharashtra': 'ಮಹಾರಾಷ್ಟ್ರ',
    'Odisha': 'ಒಡಿಶಾ',
    'Punjab': 'ಪಂಜಾಬ್',
    'Rajasthan': 'ರಾಜಸ್ಥಾನ',
    'Tamil Nadu': 'ತಮಿಳು ನಾಡು',
    'Telangana': 'ತೆಲಂಗಾಣ',
    'Uttar Pradesh': 'ಉತ್ತರ ಪ್ರದೇಶ',
    'West Bengal': 'ಪಶ್ಚಿಮ ಬಂಗಾಳ',
  },
  mr: {
    'Andhra Pradesh': 'आंध्र प्रदेश',
    'Assam': 'आसाम',
    'Bihar': 'बिहार',
    'Chhattisgarh': 'छत्तीसगड',
    'Delhi': 'दिल्ली',
    'Goa': 'गोवा',
    'Gujarat': 'गुजरात',
    'Haryana': 'हरियाणा',
    'Jharkhand': 'झारखंड',
    'Karnataka': 'कर्नाटक',
    'Kerala': 'केरळ',
    'Madhya Pradesh': 'मध्य प्रदेश',
    'Maharashtra': 'महाराष्ट्र',
    'Odisha': 'ओडिशा',
    'Punjab': 'पंजाब',
    'Rajasthan': 'राजस्थान',
    'Tamil Nadu': 'तामिळनाडू',
    'Telangana': 'तेलंगणा',
    'Uttar Pradesh': 'उत्तर प्रदेश',
    'West Bengal': 'पश्चिम बंगाल',
  },
  gu: {
    'Andhra Pradesh': 'આંધ્ર પ્રદેશ',
    'Assam': 'આસામ',
    'Bihar': 'બિહાર',
    'Chhattisgarh': 'છત્તીસગઢ',
    'Delhi': 'દિલ્હી',
    'Goa': 'ગોવા',
    'Gujarat': 'ગુજરાત',
    'Haryana': 'હરિયાણા',
    'Jharkhand': 'ઝારખંડ',
    'Karnataka': 'કર્ણાટક',
    'Kerala': 'કેરળ',
    'Madhya Pradesh': 'મધ્ય પ્રદેશ',
    'Maharashtra': 'મહારાષ્ટ્ર',
    'Odisha': 'ઓડિશા',
    'Punjab': 'પંજાબ',
    'Rajasthan': 'રાજસ્થાન',
    'Tamil Nadu': 'તમિલનાડુ',
    'Telangana': 'તેલંગાણા',
    'Uttar Pradesh': 'ઉત્તર પ્રદેશ',
    'West Bengal': 'પશ્ચિમ બંગાળ',
  },
}

const CATEGORY_LABELS: Partial<Record<LangCode, Record<string, string>>> = {
  en: {
    General: 'General',
    OBC: 'OBC',
    SC: 'SC',
    ST: 'ST',
    EWS: 'EWS',
  },
  hi: {
    General: 'General (सामान्य)',
    OBC: 'OBC (पिछड़ा वर्ग)',
    SC: 'SC (अनुसूचित जाति)',
    ST: 'ST (अनुसूचित जनजाति)',
    EWS: 'EWS (आर्थिक रूप से कमज़ोर)',
  },
  ta: {
    General: 'General (பொது)',
    OBC: 'OBC (பிற்படுத்தப்பட்டோர்)',
    SC: 'SC (தாழ்த்தப்பட்டோர்)',
    ST: 'ST (பழங்குடியினர்)',
    EWS: 'EWS (பொருளாதார பின்தங்கியோர்)',
  },
  bn: {
    General: 'General (সাধারণ)',
    OBC: 'OBC (অন্যান্য পিছিয়ে পড়া)',
    SC: 'SC (তফসিলি জাতি)',
    ST: 'ST (তফসিলি উপজাতি)',
    EWS: 'EWS (অর্থনৈতিকভাবে দুর্বল)',
  },
  te: {
    General: 'General (సాధారణ)',
    OBC: 'OBC (ఇతర వెనుకబడిన వర్గాలు)',
    SC: 'SC (షెడ్యూల్డ్ కులాలు)',
    ST: 'ST (షెడ్యూల్డ్ తెగలు)',
    EWS: 'EWS (ఆర్థికంగా బలహీన వర్గాలు)',
  },
  mr: {
    General: 'General (सामान्य)',
    OBC: 'OBC (इतर मागासवर्गीय)',
    SC: 'SC (अनुसूचित जाती)',
    ST: 'ST (अनुसूचित जमाती)',
    EWS: 'EWS (आर्थिकदृष्ट्या दुर्बल)',
  },
  gu: {
    General: 'General (સામાન્ય)',
    OBC: 'OBC (અન્ય પછાત વર્ગ)',
    SC: 'SC (અનુસૂચિત જાતિ)',
    ST: 'ST (અનુસૂચિત જનજાતિ)',
    EWS: 'EWS (આર્થિક રીતે નબળા)',
  },
  kn: {
    General: 'General (ಸಾಮಾನ್ಯ)',
    OBC: 'OBC (ಇತರ ಹಿಂದುಳಿದ ವರ್ಗಗಳು)',
    SC: 'SC (ಪರಿಶಿಷ್ಟ ಜಾತಿಗಳು)',
    ST: 'ST (ಪರಿಶಿಷ್ಟ ಪಂಗಡಗಳು)',
    EWS: 'EWS (ಆರ್ಥಿಕವಾಗಿ ದುರ್ಬಲ)',
  },
}

const GENDER_LABELS: Partial<Record<LangCode, Record<string, string>>> = {
  en: {
    Male: 'Male',
    Female: 'Female',
    Other: 'Other',
  },
  hi: {
    Male: 'Male (पुरुष)',
    Female: 'Female (महिला)',
    Other: 'Other (अन्य)',
  },
  ta: {
    Male: 'Male (ஆண்)',
    Female: 'Female (பெண்)',
    Other: 'Other (மற்றவர்)',
  },
  bn: {
    Male: 'Male (পুরুষ)',
    Female: 'Female (মহিলা)',
    Other: 'Other (অন্যান্য)',
  },
  te: {
    Male: 'Male (పురుషుడు)',
    Female: 'Female (స్త్రీ)',
    Other: 'Other (ఇతరులు)',
  },
  mr: {
    Male: 'Male (पुरुष)',
    Female: 'Female (महिला)',
    Other: 'Other (इतर)',
  },
  gu: {
    Male: 'Male (પુરૂષ)',
    Female: 'Female (મહિલા)',
    Other: 'Other (અન્ય)',
  },
  kn: {
    Male: 'Male (ಪುರುಷ)',
    Female: 'Female (ಮಹಿಳೆ)',
    Other: 'Other (ಇತರರು)',
  },
}

const translateSearchQuery = (q: string) => {
  const lower = q.toLowerCase().trim()
  for (const [regional, english] of Object.entries(SEARCH_TRANSLATIONS)) {
    if (lower.includes(regional.toLowerCase())) {
      return english
    }
  }
  return q
}

const STATE_TRANSLATIONS: Record<string, string> = {
  'தமிழ் நாடு': 'Tamil Nadu',
  'தமிழ்நாடு': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  'উত্তর প্রদেশ': 'Uttar Pradesh',
  'মহারাষ্ট্র': 'Maharashtra',
  'বিহার': 'Bihar',
  'পশ্চিমবঙ্গ': 'West Bengal',
  'కర్ణాటక': 'Karnataka',
  'ఆంధ్రప్రదేశ్': 'Andhra Pradesh',
  'తెలంగాణ': 'Telangana',
  'కేరళ': 'Kerala',
  'ಕರ್ನಾಟಕ': 'Karnataka',
  'ಮಹಾರಾಷ್ಟ್ರ': 'Maharashtra',
  'ಆಂಧ్ర ಪ್ರದೇಶ': 'Andhra Pradesh',
  'ગુજરાત': 'Gujarat',
  'મહારાષ્ટ્ર': 'Maharashtra',
  'राजस्थान': 'Rajasthan',
  'मध्य प्रदेश': 'Madhya Pradesh',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  'महाराष्ट्र': 'Maharashtra',
  'बिहार': 'Bihar',
  'गुजरात': 'Gujarat',
  'கர்நாடகா': 'Karnataka',
  'ஆந்திரா': 'Andhra Pradesh',
  'கேரளா': 'Kerala',
  'மகாராஷ்டிரா': 'Maharashtra'
}

const normalizeState = (input: string): string => {
  const trimmed = input.trim()
  const lower = trimmed.toLowerCase()
  if (STATE_TRANSLATIONS[trimmed]) {
    return STATE_TRANSLATIONS[trimmed]
  }
  if (STATE_TRANSLATIONS[lower]) {
    return STATE_TRANSLATIONS[lower]
  }

  const KNOWN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam',
    'Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura',
    'Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu & Kashmir'
  ]
  const match = KNOWN_STATES.find(s =>
    s.toLowerCase().includes(lower) ||
    lower.includes(s.toLowerCase())
  )

  return match ?? trimmed
}

const mapOccupation = (val: string): string => val

const INCOME_TO_API: Record<string, string> = {
  '0 – 1 lakh': '0-1 lakh',
  '1 – 3 lakh': '1-3 lakh',
  '3 – 6 lakh': '3-6 lakh',
  '6 lakh se zyada': '6+ lakh',
  'Above 6 lakh': '6+ lakh',
  '০ – ১ লাখ': '0-1 lakh',
  '১ – ৩ লাখ': '1-3 lakh',
  '৩ – ৬ লাখ': '3-6 lakh',
  '৬ লাখের বেশি': '6+ lakh',
  '0 – 1 లక్ష': '0-1 lakh',
  '1 – 3 లక్షలు': '1-3 lakh',
  '3 – 6 లక్షలు': '3-6 lakh',
  '6 లక్షలకు పైగా': '6+ lakh',
  '0 – 1 ಲಕ್ಷ': '0-1 lakh',
  '1 – 3 ಲಕ್ಷ': '1-3 lakh',
  '3 – 6 ಲಕ್ಷ': '3-6 lakh',
  '6 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು': '6+ lakh',
  '0 – 1 লাখ': '0-1 lakh',
  '1 – 3 লাখ': '1-3 lakh',
  '3 – 6 লাখ': '3-6 lakh',
  '6 লাখથી વધુ': '6+ lakh',
  '० – १ लाख': '0-1 lakh',
  '१ – ३ लाख': '1-3 lakh',
  '३ – ६ लाख': '3-6 lakh',
  '6 लाखांपेक्षा जास्त': '6+ lakh',
  '0 – 1 லட்சம்': '0-1 lakh',
  '1 – 3 லட்சம்': '1-3 lakh',
  '3 – 6 லட்சம்': '3-6 lakh',
  '6 லட்சத்திற்கு மேல்': '6+ lakh'
}

const mapIncome = (display: string): string =>
  INCOME_TO_API[display] ?? display

const SCHEME_TRANSLATIONS: Partial<Record<LangCode, Record<string, string>>> = {
  hi: {
    'PM Kisan Samman Nidhi': 'PM किसान सम्मान निधि',
    'Pradhan Mantri Kisan Samman Nidhi': 'PM किसान सम्मान निधि',
    'Pradhan Mantri Fasal Bima Yojana': 'प्रधानमंत्री फसल बीमा योजना',
    'Pradhan Mantri Awas Yojana': 'प्रधानमंत्री आवास योजना',
    'Ayushman Bharat': 'आयुष्मान भारत',
    'PM Jan Dhan Yojana': 'PM जन धन योजना',
    MGNREGA: 'मनरेगा',
    MGNREGS: 'मनरेगा',
    'Kisan Credit Card': 'किसान क्रेडिट कार्ड',
    'PM Ujjwala Yojana': 'PM उज्ज्वला योजना',
    'Pradhan Mantri Ujjwala Yojana': 'प्रधानमंत्री उज्ज्वला योजना',
    'Sukanya Samriddhi Yojana': 'सुकन्या समृद्धि योजना',
    'Atal Pension Yojana': 'अटल पेंशन योजना',
    'PM Mudra Yojana': 'प्रधानमंत्री मुद्रा योजना',
    'National Scholarship Portal': 'राष्ट्रीय छात्रवृत्ति पोर्टाल',
    'Stand Up India': 'स्टैंड अप इंडिया',
    'Mukhyamantri Kisan Samriddhi Yojana': 'मुख्यमंत्री किसान समृद्धि योजना',
    'Rythu Bharosa Scheme': 'रयतू भरोसा योजना',
    'PM Fasal Bima Yojana': 'PM फसल बीमा योजना',
    'Ayushman Bharat PM-JAY': 'आयुष्मान भारत PM-JAY',
    'Indira Gandhi Old Age Pension': 'इंदिरा गांधी वृद्धावस्था पेंशन',
    'PM Surya Ghar Muft Bijli Yojana': 'PM सूर्य घर मुफ्त बिजली योजना',
  },
  ta: {
    'PM Kisan Samman Nidhi': 'PM கிசான் சம்மான் நிதி',
    'Pradhan Mantri Kisan Samman Nidhi': 'PM கிசான் சம்மான் நிதி',
    'Ayushman Bharat': 'ஆயுஷ்மான் பாரத்',
    MGNREGA: 'மக்னரேகா',
    'Kisan Credit Card': 'கிசான் கிரெடிட் கார்டு',
    'PM Ujjwala Yojana': 'PM உஜ்வலா திட்டம்',
    'National Scholarship Portal': 'தேசிய உதவித்தொகை இணையதளம்',
  },
  bn: {
    'PM Kisan Samman Nidhi': 'পিএম কিষান সম্মান নিধি',
    'Pradhan Mantri Kisan Samman Nidhi': 'পিএম কিষান সম্মান নিধি',
    'Ayushman Bharat': 'আয়ুষ্মান ভারত',
    MGNREGA: 'মনরেগা',
    'National Scholarship Portal': 'জাতীয় বৃত্তি পোর্টাল',
  },
}

const QUESTIONS_DATA = [
  { id:"state", hi:"आप कहाँ रहते हैं?", en:"Which state?",
    type:"select", options:["Andhra Pradesh","Arunachal Pradesh",
    "Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
    "Himachal Pradesh","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
    "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
    "Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"] },
  { id:"scheme_type", type:"choice" },
  { id:"age", hi:"आपकी उम्र क्या है?", en:"What is your age?",
    type:"number", placeholder:"जैसे: 35" },
  { id:"income", hi:"साल भर की कमाई?", en:"Annual income?",
    type:"select", options:["0 – 1 lakh","1 – 3 lakh",
    "3 – 6 lakh","6 lakh se zyada"] },
  { id:"category", hi:"आपकी श्रेणी?", en:"Your category?",
    type:"select", options:["General","OBC","SC","ST","EWS"] },
  { id:"occupation", hi:"आप क्या काम करते हैं?",
    en:"Your occupation?", type:"select",
    options:["farmer","student",
    "govt_employee","private_job",
    "business","unemployed"] },
  { id:"gender", hi:"आपका लिंग?", en:"Your gender?",
    type:"select", options:["Male","Female","Other"] }
]

const TOTAL_STEPS = 7

const langLabels: Record<LangCode, string> = {
  hi: 'हिं',
  en: 'EN',
  bn: 'বাং',
  te: 'తె',
  mr: 'मर',
  ta: 'தமி',
  gu: 'ગુ',
  kn: 'ಕನ್'
}

const LANG_FULL_NAMES: Record<string, string> = {
  hi: 'हिन्दी',
  en: 'English',
  bn: 'বাংলা',
  te: 'తెలుగు',
  mr: 'मराठी',
  ta: 'தமிழ்',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
}

const FALLBACK_COPY = {
  hi: {
    heroBadge: 'AI-powered • Free • No login',
  },
  en: {
    heroBadge: 'AI-powered • Free • No login',
  }
} as const

function getCategoryIcon(name: string, reason: string): string {
  const txt = (name + " " + reason).toLowerCase()
  if (txt.includes('kisan') || txt.includes('farmer') || txt.includes('krishi') || txt.includes('agriculture')) return '🌾'
  if (txt.includes('svasthya') || txt.includes('health') || txt.includes('medical') || txt.includes('chiranjeevi')) return '🏥'
  if (txt.includes('shiksha') || txt.includes('student') || txt.includes('laptop') || txt.includes('education') || txt.includes('vidya')) return '📚'
  if (txt.includes('awas') || txt.includes('housing') || txt.includes('home')) return '🏠'
  if (txt.includes('pension') || txt.includes('vridh') || txt.includes('elderly')) return '👴'
  if (txt.includes('mahila') || txt.includes('women') || txt.includes('kanya') || txt.includes('lakshmi') || txt.includes('ladki') || txt.includes('matritva')) return '👩'
  if (txt.includes('rozgar') || txt.includes('employment') || txt.includes('job')) return '💼'
  if (txt.includes('viklang') || txt.includes('divyang') || txt.includes('disability')) return '♿'
  return '💰'
}

export default function YojanaAIPage() {
  const { lang, setLang, t } = useLang()
  const [screen, setScreen] = useState<Screen>('hero')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [results, setResults] = useState<any>(null)
  const [schemeCount, setSchemeCount] = useState<number>(558)
  const [explanation, setExplanation] =
    useState<Record<string, SchemeExplanation>>({})
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    benefit: string
    category: string
    apply_url: string
  }>>([])
  const [searching, setSearching] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [schemeTranslations, setSchemeTranslations] =
    useState<Record<string, {
      name: string
      benefit: string
    }>>({})

  const [activeWaitTimer, setActiveWaitTimer] = useState(0)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const [pulseAnswerId, setPulseAnswerId] = useState<string | null>(null)
  const [schemeTypeFilter, setSchemeTypeFilter] =
    useState<SchemeTypeFilter>('all')
  const [stateSearchQuery, setStateSearchQuery] = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const uiCopy = lang === 'en' ? FALLBACK_COPY.en : FALLBACK_COPY.hi
  const currentQuestion = QUESTIONS_DATA[currentStep]
  const questionCopy = useMemo(() => ([
    { heading: t.q1_text, sub: t.q1_sub },
    { heading: '', sub: '' },
    { heading: t.q2_text, sub: t.q2_sub },
    { heading: t.q3_text, sub: t.q3_sub },
    { heading: t.q4_text, sub: t.q4_sub },
    { heading: t.q5_text, sub: t.q5_sub },
    { heading: t.q6_text, sub: t.q6_sub },
  ]), [t])
  const occupationOptions = useMemo(() => ([
    { display: t.occ_farmer, value: 'farmer' },
    { display: t.occ_student, value: 'student' },
    { display: t.occ_govt, value: 'govt_employee' },
    { display: t.occ_private, value: 'private_job' },
    { display: t.occ_business, value: 'business' },
    { display: t.occ_unemployed, value: 'unemployed' },
  ]), [t])
  const incomeOptions = useMemo(() => ([
    { display: t.income_1, value: '0-1 lakh' },
    { display: t.income_2, value: '1-3 lakh' },
    { display: t.income_3, value: '3-6 lakh' },
    { display: t.income_4, value: '6+ lakh' },
  ]), [t])
  const getStateDisplayName = useCallback((englishName: string): string => {
    if (lang === 'en') return englishName
    return STATE_NAMES[lang]?.[englishName] ?? englishName
  }, [lang])

  const getSchemeDisplayName = useCallback((schemeId: string, englishName: string): string => {
    if (lang === 'en') return englishName
    if (schemeTranslations[schemeId]?.name) {
      return schemeTranslations[schemeId].name
    }
    return SCHEME_TRANSLATIONS[lang]?.[englishName] ?? englishName
  }, [lang, schemeTranslations])

  const getSchemeBenefit = useCallback((schemeId: string, englishBenefit: string): string => {
    if (lang === 'en') return englishBenefit
    return schemeTranslations[schemeId]?.benefit ?? englishBenefit
  }, [lang, schemeTranslations])

  const getReasonPlaceholder = useCallback((): string => {
    if (lang === 'ta') return 'தகுதி காரணம் ஏற்றப்படுகிறது...'
    if (lang === 'hi') return 'Eligibility reason load ho raha hai...'
    if (lang === 'bn') return 'যোগ্যতার কারণ লোড হচ্ছে...'
    if (lang === 'te') return 'అర్హత కారణం లోడ్ అవుతోంది...'
    if (lang === 'kn') return 'ಅರ್ಹತಾ ಕಾರಣ ಲೋಡ್ ಆಗುತ್ತಿದೆ...'
    if (lang === 'mr') return 'पात्रतेचे कारण लोड होत आहे...'
    if (lang === 'gu') return 'પાત્રતાનું કારણ લોડ થઈ રહ્યું છે...'
    return 'Loading eligibility reason...'
  }, [lang])

  const filteredQuestionOptions = useMemo(() => {
    if (!currentQuestion?.options) return []
    if (currentQuestion.id !== 'state' || !stateSearchQuery.trim()) {
      return currentQuestion.options
    }
    const stateSearch = stateSearchQuery.trim()
    const normalizedStateSearch = normalizeState(stateSearch)
    const lowerStateSearch = stateSearch.toLowerCase()
    const lowerNormalizedSearch = normalizedStateSearch.toLowerCase()
    return currentQuestion.options.filter(option =>
      option.toLowerCase().includes(lowerStateSearch) ||
      lowerNormalizedSearch.includes(option.toLowerCase()) ||
      option.toLowerCase().includes(lowerNormalizedSearch) ||
      getStateDisplayName(option).toLowerCase().includes(lowerStateSearch)
    )
  }, [currentQuestion, getStateDisplayName, stateSearchQuery])

  useEffect(() => {
    let interval: any;
    if (screen === 'loading') {
      setActiveWaitTimer(0)
      let passed = 0
      interval = setInterval(() => {
        passed += 1
        setActiveWaitTimer(passed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [screen])

  useEffect(() => {
    fetch('/api/schemes/stats')
      .then(r => r.json())
      .then(data => {
        if (data.total_schemes) {
          setSchemeCount(data.total_schemes)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.scheme-search-wrap')) {
        setSearchResults([])
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!langOpen) return
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.lang-toggle-wrap')) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () =>
      document.removeEventListener('mousedown', close)
  }, [langOpen])

  const formatCount = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`
    if (n >= 100) return `${Math.floor(n / 10) * 10}+`
    return `${n}+`
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (query.trim().length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const translatedQuery = translateSearchQuery(query.trim())
        const res = await fetch(
          `/api/schemes/search?q=${encodeURIComponent(translatedQuery)}`
        )
        const data = await res.json()
        setSearchResults(data.results ?? [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  const fetchSchemeTranslations = useCallback(async (
    ids: string[],
    language: string
  ) => {
    if (language === 'en') return
    try {
      const res = await fetch(
        `/api/schemes/translations?ids=${encodeURIComponent(ids.join(','))}&lang=${language}`
      )
      const data = await res.json()
      if (data.translations) {
        setSchemeTranslations(data.translations)
      }
    } catch {
      // ignore translation hydration failures
    }
  }, [])

  const handleLangSelect = useCallback((nextLang: LangCode) => {
    setLang(nextLang)
    setLangOpen(false)
  }, [setLang])

  const renderLangDropdown = useCallback(() => (
    <div className="lang-toggle-wrap"
      style={{ position: 'relative' }}>
      <button
        onClick={() => setLangOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center',
          gap: '6px', padding: '6px 12px',
          borderRadius: 'var(--r-full)',
          border: '1.5px solid var(--border-mid)',
          background: 'white', cursor: 'pointer',
          fontSize: '12px', fontWeight: 600,
          color: 'var(--ink)',
          transition: 'all 0.15s ease',
        }}
      >
        <span>{LANG_FULL_NAMES[lang]}</span>
        <svg width="10" height="10"
          viewBox="0 0 10 10"
          style={{
            transform: langOpen
              ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M2 3L5 7L8 3"
            stroke="currentColor" strokeWidth="1.5"
            fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {langOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'white',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r-xl)',
          boxShadow:
            '0 8px 32px rgba(10,15,30,0.12)',
          zIndex: 200,
          overflow: 'hidden',
          minWidth: '180px',
        }}>
          {SUPPORTED_LANGS.map((l, i) => (
            <button key={l}
              onClick={() => {
                handleLangSelect(l)
              }}
              style={{
                width: '100%',
                padding: '11px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                border: 'none',
                borderBottom: i < SUPPORTED_LANGS.length - 1
                  ? '1px solid var(--border)'
                  : 'none',
                background: lang === l
                  ? 'var(--saffron-soft)' : 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: lang === l ? 700 : 500,
                color: lang === l
                  ? 'var(--saffron-mid)'
                  : 'var(--ink)',
                textAlign: 'left',
              }}
            >
              <span>{LANG_FULL_NAMES[l]}</span>
              <span style={{
                fontSize: '11px',
                color: 'var(--subtle)',
                fontWeight: 400
              }}>{langLabels[l]}</span>
              {lang === l && (
                <span style={{
                  fontSize: '12px',
                  color: 'var(--saffron)'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  ), [handleLangSelect, lang, langOpen])

  const submitForm = useCallback(async (finalAnswers: Record<string, any>) => {
    setScreen('loading')

    const answersFromForm = { ...finalAnswers }
    const apiAnswers = {
      state: normalizeState(answersFromForm.state ?? ''),
      age: answersFromForm.age,
      income: mapIncome(answersFromForm.income ?? ''),
      category: answersFromForm.category,
      occupation: mapOccupation(answersFromForm.occupation ?? ''),
      gender: answersFromForm.gender === 'Male' ||
      answersFromForm.gender === 'Female' ||
      answersFromForm.gender === 'Other'
        ? answersFromForm.gender
        : 'Male',
      language: lang,
      scheme_type_filter: schemeTypeFilter,
    }
  
    try {
      const response = await fetch('/api/find-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: apiAnswers })
      })
      const data = await response.json()
      if (lang !== 'hi' && lang !== 'en' && data?.profile && data?.matched_schemes?.length) {
        const localizedEntries = await Promise.allSettled(
          data.matched_schemes.slice(0, 6).map(async (scheme: any) => {
            const res = await fetch('/api/explain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                scheme_id: scheme.id,
                scheme_name: scheme.name ?? scheme.id,
                benefit: scheme.estimated_benefit,
                profile: data.profile,
                ui_lang: lang,
              })
            })
            const explanationData = await res.json() as SchemeExplanation
            return { schemeId: scheme.id, explanationData }
          })
        )

        setExplanation(prev => {
          const next = { ...prev }
          for (const entry of localizedEntries) {
            if (entry.status === 'fulfilled') {
              next[entry.value.schemeId] = {
                ...(next[entry.value.schemeId] ?? {}),
                ...entry.value.explanationData,
              }
            }
          }
          return next
        })
      }
      setResults(data)
    } catch (error) {
      console.error("API Error", error)
    } finally {
      setScreen('results')
    }
  }, [lang, schemeTypeFilter])

  const getExplanation = async (scheme: any) => {
    if (!results?.profile) return
    setLoadingExplain(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_id: scheme.id,
          scheme_name: scheme.name ?? scheme.id,
          benefit: scheme.estimated_benefit,
          profile: results.profile,
          ui_lang: lang,
        })
      })
      const data = await res.json() as SchemeExplanation
      setExplanation(prev => ({ ...(prev ?? {}), [scheme.id]: data }))
    } finally {
      setLoadingExplain(false)
    }
  }

  useEffect(() => {
    if (!results?.matched_schemes?.length || lang === 'en') {
      setSchemeTranslations({})
      return
    }

    setSchemeTranslations({})
    void fetchSchemeTranslations(
      results.matched_schemes.map((scheme: any) => scheme.id),
      lang
    )
  }, [fetchSchemeTranslations, lang, results])

  useEffect(() => {
    if (screen !== 'results' || !results?.profile || !results?.matched_schemes?.length) {
      return
    }
    if (lang === 'hi' || lang === 'en') {
      return
    }

    const missingSchemeIds = results.matched_schemes
      .map((scheme: any) => scheme.id)
      .filter((schemeId: string) => !explanation[schemeId]?.why_you_qualify)

    if (missingSchemeIds.length === 0) {
      return
    }

    let cancelled = false

    const hydrateLocalizedReasons = async () => {
      const updates = await Promise.allSettled(
        results.matched_schemes
          .filter((scheme: any) => missingSchemeIds.includes(scheme.id))
          .map(async (scheme: any) => {
            const res = await fetch('/api/explain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                scheme_id: scheme.id,
                scheme_name: scheme.name ?? scheme.id,
                benefit: scheme.estimated_benefit,
                profile: results.profile,
                ui_lang: lang,
              })
            })
            const data = await res.json() as SchemeExplanation
            return { schemeId: scheme.id, data }
          })
      )

      if (cancelled) return

      setExplanation(prev => {
        const next = { ...prev }
        for (const update of updates) {
          if (update.status === 'fulfilled') {
            next[update.value.schemeId] = {
              ...(next[update.value.schemeId] ?? {}),
              ...update.value.data,
            }
          }
        }
        return next
      })
    }

    void hydrateLocalizedReasons()

    return () => {
      cancelled = true
    }
  }, [explanation, lang, results, screen])

  const handleStart = useCallback(() => {
    setResults(null)
    setAnswers({})
    setExplanation({})
    setExpandedCards({})
    setSchemeTranslations({})
    setCurrentStep(0)
    setStateSearchQuery('')
    setSchemeTypeFilter('all')
    setScreen('form')
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < QUESTIONS_DATA.length - 1) {
      setCurrentStep(currentStep + 1)
      setStateSearchQuery('')
    } else {
      submitForm(answers)
    }
  }, [answers, currentStep, submitForm])

  const toggleExpand = useCallback((idKey: string) => {
    setExpandedCards(prev => ({ ...prev, [idKey]: !prev[idKey] }))
  }, [])

  const handleToggleExpand = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const expandId = event.currentTarget.dataset.expandId
    if (expandId) {
      toggleExpand(expandId)
    }
  }, [toggleExpand])
  
  const resetToHome = useCallback(() => {
    setScreen('hero')
    setAnswers({})
    setExplanation({})
    setExpandedCards({})
    setResults(null)
    setCurrentStep(0)
    setStateSearchQuery('')
    setSchemeTypeFilter('all')
  }, [])

  const handleFormBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      return
    }
    resetToHome()
  }, [currentStep, resetToHome])

  const handleStateSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStateSearchQuery(event.target.value)
  }, [])

  const handleAnswerSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const questionId = event.currentTarget.dataset.questionId
    const value = event.currentTarget.dataset.optionValue
    if (!questionId || !value) return
    const normalizedValue = questionId === 'state'
      ? normalizeState(value)
      : value
    if (questionId === 'state') {
      setSchemeTypeFilter('all')
    }
    setPulseAnswerId(value)
    setAnswers((prev) => ({
      ...prev,
      [questionId]: normalizedValue
    }))
    // Automatically proceed to next question for select inputs to save clicks
    setTimeout(() => {
      setPulseAnswerId(null)
    }, 200)
  }, [])

  const handleAgeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setAnswers((prev) => ({ ...prev, age: value }))
  }, [])

  const handleShareClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const schemeName = event.currentTarget.dataset.schemeName || ''
    const benefit = event.currentTarget.dataset.schemeBenefit || ''
    const msg = t.share_msg.replace('{scheme}', schemeName).replace('{benefit}', benefit)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }, [t.share_msg])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const getTranslatedOption = useCallback((q: any, opt: string) => {
    if (q.id === 'state') {
      return getStateDisplayName(opt)
    }
    if (q.id === 'income') {
      if (opt.includes("0 – 1")) return t.income_opt1 || opt
      if (opt.includes("1 – 3")) return t.income_opt2 || opt
      if (opt.includes("3 – 6")) return t.income_opt3 || opt
      if (opt.includes("6 lakh")) return t.income_opt4 || opt
    }
    if (q.id === 'category') {
      return CATEGORY_LABELS[lang]?.[opt] ?? CATEGORY_LABELS.en?.[opt] ?? opt
    }
    if (q.id === 'gender') {
      return GENDER_LABELS[lang]?.[opt] ?? GENDER_LABELS.en?.[opt] ?? opt
    }
    return opt
  }, [getStateDisplayName, lang])

  const getApplyUrl = (schemeId: string): string => {
    const VERIFIED_URLS: Record<string, string> = {
      pm_kisan: 'https://pmkisan.gov.in',
      ab_pmjay: 'https://pmjay.gov.in',
      pmay_urban: 'https://pmaymis.gov.in',
      pmay_rural: 'https://pmayg.nic.in',
      mgnrega: 'https://nrega.nic.in',
      kisan_credit_card: 'https://www.nabard.org',
      pm_mudra: 'https://www.mudra.org.in',
      pm_fasal_bima: 'https://pmfby.gov.in',
      pm_ujjwala: 'https://pmuy.gov.in',
      pm_jan_dhan: 'https://pmjdy.gov.in',
      atal_pension: 'https://npscra.nsdl.co.in',
      pm_jeevan_jyoti: 'https://jansuraksha.gov.in',
      pm_suraksha_bima: 'https://jansuraksha.gov.in',
      stand_up_india: 'https://www.standupmitra.in',
      pm_vishwakarma: 'https://pmvishwakarma.gov.in',
      national_scholarship: 'https://scholarships.gov.in',
      pm_scholarship_capf: 'https://scholarships.gov.in',
      pmkvy: 'https://www.pmkvyofficial.org',
      pm_surya_ghar: 'https://pmsuryaghar.gov.in',
      sukanya_samriddhi: 'https://www.indiapost.gov.in',
      pm_svnidhi: 'https://pmsvanidhi.mohua.gov.in',
      pm_awas_urban: 'https://pmaymis.gov.in',
      pm_awas_rural: 'https://pmayg.nic.in',
      mnrega: 'https://nrega.nic.in',

      pudhumai_penn: 'https://pudumaipenn.tn.gov.in',
      'pudhumai-penn-scheme':
        'https://pudumaipenn.tn.gov.in',
      cm_breakfast: 'https://mdm.tn.gov.in',
      'cm-breakfast-scheme': 'https://mdm.tn.gov.in',
      naan_mudhalvan: 'https://naanmudhalvan.tn.gov.in',
      'naan-mudhalvan-scheme':
        'https://naanmudhalvan.tn.gov.in',
      kalaignar_magalir: 'https://www.maws.tn.gov.in',
      'kalaignar-magalir-urimai-thogai-scheme':
        'https://www.maws.tn.gov.in',
      makkalai_thedi: 'https://www.tnhealth.tn.gov.in',
      'makkalai-thedi-maruthuvam':
        'https://www.tnhealth.tn.gov.in',

      up_kanya_sumangala: 'https://mksy.up.gov.in',
      'up-kanya-sumangala-yojana': 'https://mksy.up.gov.in',
      up_jan_arogya: 'https://sects.up.gov.in',
      'up-mukhyamantri-jan-arogya-yojana':
        'https://sects.up.gov.in',

      karnataka_yuvanidhi:
        'https://sevasindhu.karnataka.gov.in',
      'karnataka-yuvanidhi-scheme':
        'https://sevasindhu.karnataka.gov.in',
      karnataka_gruha_lakshmi:
        'https://sevasindhu.karnataka.gov.in',
      karnataka_gruha_jyoti:
        'https://sevasindhu.karnataka.gov.in',
      karnataka_anna_bhagya:
        'https://ahara.kar.nic.in',

      bihar_student_credit_card:
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      'bihar-student-credit-card-scheme':
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      mukhyamantri_kanya_utthan:
        'https://medhasoft.bih.nic.in',
      'mukhyamantri-kanya-utthan-yojana':
        'https://medhasoft.bih.nic.in',

      ladki_bahin:
        'https://ladakibahin.maharashtra.gov.in',
      mjpjay: 'https://www.jeevandayee.gov.in',

      west_bengal_lakshmir_bhandar:
        'https://socialsecurity.wb.gov.in',
      kanyashree: 'https://wbkanyashree.gov.in',
    }

    if (VERIFIED_URLS[schemeId]) {
      return VERIFIED_URLS[schemeId]
    }

    const action = results?.actions?.[schemeId]
    const actionUrl = action?.portal_url
      ?? (action as { apply_url?: string })?.apply_url

    const isValidUrl = (url?: string): boolean => {
      if (!url) return false
      if (!url.startsWith('https://')) return false

      const BAD_PATTERNS = [
        'tnhb', 'housing.tn', 'tnscb',
        'cmda.tn', '/scheme/', '/view/',
        '/data_view/', 'localhost',
        '/housing/', 'tamilnaduhousing',
      ]
      if (BAD_PATTERNS.some(p =>
        url.toLowerCase().includes(p))) {
        return false
      }

      const SAFE_DOMAINS = [
        'pmkisan.gov.in',
        'pmjay.gov.in',
        'pmaymis.gov.in',
        'pmayg.nic.in',
        'nrega.nic.in',
        'nabard.org',
        'mudra.org.in',
        'pmfby.gov.in',
        'pmuy.gov.in',
        'pmjdy.gov.in',
        'npscra.nsdl.co.in',
        'jansuraksha.gov.in',
        'standupmitra.in',
        'pmvishwakarma.gov.in',
        'scholarships.gov.in',
        'pmkvyofficial.org',
        'pmsuryaghar.gov.in',
        'indiapost.gov.in',
        'pmsvanidhi.mohua.gov.in',
        'pudumaipenn.tn.gov.in',
        'naanmudhalvan.tn.gov.in',
        'mdm.tn.gov.in',
        'tnhealth.tn.gov.in',
        'maws.tn.gov.in',
        'mksy.up.gov.in',
        'sects.up.gov.in',
        'sevasindhu.karnataka.gov.in',
        '7nishchay-yuvaupmission.bihar.gov.in',
        'medhasoft.bih.nic.in',
        'ladakibahin.maharashtra.gov.in',
        'jeevandayee.gov.in',
        'wbkanyashree.gov.in',
        'socialsecurity.wb.gov.in',
        'myscheme.gov.in',
        'pmkisan.gov.in',
      ]

      return SAFE_DOMAINS.some(d =>
        url.includes(d))
    }

    if (isValidUrl(actionUrl)) {
      return actionUrl
    }

    const schemeName =
      results?.matched_schemes?.find(
        (r: { id: string; name?: string }) =>
          r.id === schemeId
      )?.name ?? schemeId
    return `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(
      schemeName
    )}`
  }

  const navBrand = (
    <>
      <span className="flag-wrap" aria-hidden="true">
        <span className="flag-saffron"/>
        <span className="flag-white">
          <svg
            width="6"
            height="6"
            viewBox="0 0 24 24"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"
              fill="none" stroke="#000080"
              strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2"
              fill="#000080"/>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180
              return (
                <line
                  key={i}
                  x1="12" y1="12"
                  x2={12 + 9 * Math.cos(angle)}
                  y2={12 + 9 * Math.sin(angle)}
                  stroke="#000080"
                  strokeWidth="0.8"
                />
              )
            })}
          </svg>
        </span>
        <span className="flag-green"/>
      </span>
      YojanaAI
    </>
  )

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main">
        {screen === 'hero' && (
          <div className="hero-wrap">
            <div className="blob blob-1"/>
            <div className="blob blob-2"/>
            <div className="blob blob-3"/>
            <div className="tricolor"/>
          
            <nav className="navbar-pill no-print">
              <span className="nav-logo"
                onClick={() => setScreen('hero')}>
                {navBrand}
              </span>
              {renderLangDropdown()}
            </nav>
          
            <div className="hero-content">
              <svg className="ornament" viewBox="0 0 72 20">
                <path d="M34 10C27 3 15 1 7 7c8 0 20 2 27 3z"
                  fill="#F97316" opacity="0.6"/>
                <path d="M34 10C27 17 15 19 7 13c8 0 20-2 27-3z"
                  fill="#F97316" opacity="0.35"/>
                <circle cx="36" cy="10" r="2.5"
                  fill="#F97316"/>
                <path d="M38 10C45 3 57 1 65 7c-8 0-20 2-27 3z"
                  fill="#F97316" opacity="0.6"/>
                <path d="M38 10C45 17 57 19 65 13c-8 0-20-2-27-3z"
                  fill="#F97316" opacity="0.35"/>
              </svg>
          
              <div className="hero-badge a-fade-up"
                style={{animationDelay:'0.05s'}}>
                ✦ {uiCopy.heroBadge}
              </div>
          
              <h1 className="hero-display a-fade-up"
                style={{animationDelay:'0.1s'}}>
                {(t as any).tagline_line1 || t.tagline}{' '}
                {((t as any).tagline_line2) && (
                  <span className="hero-display-accent">
                    {(t as any).tagline_line2}
                  </span>
                )}
              </h1>
          
              <p className="hero-body a-fade-up"
                style={{animationDelay:'0.15s'}}>
                {t.subtagline}
              </p>
          
              <button className="btn-cta a-fade-up"
                style={{animationDelay:'0.2s'}}
                onClick={() => setScreen('form')}>
                {t.start_btn}
              </button>
          
              <p className="hero-note a-fade-up"
                style={{animationDelay:'0.25s'}}>
                {t.free_note}
              </p>

              <div className="scheme-search-wrap"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  marginTop: '28px',
                  position: 'relative'
                }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    fontSize: '16px',
                    pointerEvents: 'none',
                    opacity: 0.4
                  }}>🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      placeholder={t.search_placeholder}
                    style={{
                      width: '100%',
                      height: '50px',
                      paddingLeft: '44px',
                      paddingRight: '16px',
                      border: '1.5px solid var(--border-mid)',
                      borderRadius: 'var(--r-full)',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      outline: 'none',
                      letterSpacing: '-0.005em',
                      boxShadow: '0 2px 12px rgba(10,15,30,0.06)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor =
                        'var(--saffron)'
                      e.target.style.boxShadow =
                        '0 0 0 3px var(--saffron-soft)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor =
                        'var(--border-mid)'
                      e.target.style.boxShadow =
                        '0 2px 12px rgba(10,15,30,0.06)'
                    }}
                  />
                  {searching && (
                    <span style={{
                      position: 'absolute',
                      right: '16px',
                      fontSize: '12px',
                      color: 'var(--subtle)'
                    }}>...</span>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '54px',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: 'var(--r-xl)',
                    boxShadow: '0 8px 32px rgba(10,15,30,0.12)',
                    zIndex: 200,
                    overflow: 'hidden',
                    maxHeight: '320px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((scheme, i) => {
                      const categoryIcons: Record<string, string> = {
                        agriculture: '🌾',
                        health: '🏥',
                        education: '📚',
                        housing: '🏠',
                        finance: '💰',
                        women: '👩',
                        disability: '♿',
                        elderly: '👴',
                        employment: '💼'
                      }
                      const icon = categoryIcons[scheme.category] ?? '📋'

                      return (
                        <div
                          key={scheme.id}
                          onClick={() => {
                            setSearchResults([])
                            setSearchQuery('')
                            window.open(
                              scheme.apply_url ||
                              'https://www.myscheme.gov.in/search',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }}
                          style={{
                            padding: '14px 16px',
                            borderBottom: i < searchResults.length - 1
                              ? '1px solid var(--border)'
                              : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLDivElement).style.background =
                              'var(--saffron-soft)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                          }}
                        >
                          <span style={{
                            fontSize: '20px',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}>
                            {icon}
                          </span>
                          <div>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              lineHeight: 1.3,
                              letterSpacing: '-0.01em',
                              marginBottom: '3px'
                            }}>
                              {getSchemeDisplayName(scheme.id, scheme.name)}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: 'var(--muted)',
                              letterSpacing: '-0.005em'
                            }}>
                              {scheme.benefit.length > 60
                                ? scheme.benefit.slice(0, 60)+'...'
                                : scheme.benefit}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--saffron)',
                            fontWeight: 600,
                            marginLeft: 'auto',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            Apply →
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {searchQuery.length >= 2 &&
                  !searching &&
                  searchResults.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '54px',
                      left: 0,
                      right: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 'var(--r-xl)',
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: 'var(--subtle)',
                      zIndex: 200,
                      boxShadow:
                        '0 8px 32px rgba(10,15,30,0.08)'
                    }}>
                      No schemes found for "{searchQuery}"
                    </div>
                  )}
              </div>

              <div className="stats-row a-fade-up"
                style={{animationDelay:'0.3s'}}>
                <div className="stat-card">
                  <div className="stat-num">{formatCount(schemeCount)}</div>
                  <div className="stat-label">
                    {t.stat1_label}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{t.stat2_num}</div>
                  <div className="stat-label">
                    {t.stat2_label}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{t.stat3_num}</div>
                  <div className="stat-label">
                    {t.stat3_label}
                  </div>
                </div>
              </div>
            </div>

            <div className="credits-footer">
              <span>
                {lang === 'hi' ? 'बनाया' : 'Built'} with ❤️
                {lang === 'hi' ? ' भारत के लिए' : ' for India'}
              </span>
              <span className="credits-dot">·</span>
              <a
                href="https://github.com/SanjayFX"
                target="_blank"
                rel="noopener noreferrer"
                className="credits-link-footer">
                <svg width="13" height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0
                    5.31 3.435 9.795 8.205 11.385.6.105
                    .825-.255.825-.57 0-.285-.015-1.23
                    -.015-2.235-3.015.555-3.795-.735
                    -4.035-1.41-.135-.345-.72-1.41-1.23
                    -1.695-.42-.225-1.02-.78-.015-.795
                    .945-.015 1.62.87 1.845 1.23 1.08
                    1.815 2.805 1.305 3.495.99.105-.78
                    .42-1.305.765-1.605-2.67-.3-5.46
                    -1.335-5.46-5.925 0-1.305.465-2.385
                    1.23-3.225-.12-.3-.54-1.53.12-3.18
                    0 0 1.005-.315 3.3 1.23.96-.27 1.98
                    -.405 3-.405s2.04.135 3 .405c2.295
                    -1.56 3.3-1.23 3.3-1.23.66 1.65.24
                    2.88.12 3.18.765.84 1.23 1.905 1.23
                    3.225 0 4.605-2.805 5.625-5.475
                    5.925.435.375.81 1.095.81 2.22 0
                    1.605-.015 2.895-.015 3.3 0 .315
                    .225.69.825.57A12.02 12.02 0 0024
                    12c0-6.63-5.37-12-12-12z"/>
                </svg>
                SanjayFX
              </a>
              <span className="credits-dot">·</span>
              <a
                href="https://www.linkedin.com/in/sanjay-k-523120287"
                target="_blank"
                rel="noopener noreferrer"
                className="credits-link-footer">
                <svg width="13" height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569
                    c0-1.328-.027-3.037-1.852-3.037
                    -1.853 0-2.136 1.445-2.136 2.939
                    v5.667H9.351V9h3.414v1.561h.046
                    c.477-.9 1.637-1.85 3.37-1.85
                    3.601 0 4.267 2.37 4.267 5.455
                    v6.286zM5.337 7.433a2.062 2.062 0
                    01-2.063-2.065 2.064 2.064 0
                    112.063 2.065zm1.782 13.019H3.555
                    V9h3.564v11.452zM22.225 0H1.771
                    C.792 0 0 .774 0 1.729v20.542
                    C0 23.227.792 24 1.771 24h20.451
                    C23.2 24 24 23.227 24 22.271V1.729
                    C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Sanjay K
              </a>
            </div>
          </div>
        )}

        {screen === 'form' && (() => {
          const q = currentQuestion
          const localizedQuestion = questionCopy[currentStep]
          
          const hasAnswer =
            currentStep === 1 ||
            (answers[q.id] !== undefined && answers[q.id] !== '')

          return (
            <div className="form-screen">
              <div className="tricolor"/>
              <nav className="navbar no-print">
                <div className="navbar-left">
                  <button className="nav-back-btn" onClick={handleFormBack}>
                    {t.back_btn}
                  </button>
                </div>
                <div className="navbar-center">
                  {t.step_label} {currentStep+1} {t.step_of} {TOTAL_STEPS}
                </div>
                <div className="navbar-right"
                  style={{ gap: '10px' }}>
                  {renderLangDropdown()}
                  <span className="nav-logo"
                    style={{fontSize:'13px'}}
                    onClick={() => setScreen('hero')}>
                    {navBrand}
                  </span>
                </div>
              </nav>
              <div className="progress-track">
                <div className="progress-fill"
                  style={{width:`${(currentStep/TOTAL_STEPS)*100}%`}}/>
              </div>
              <div className="form-body">
                {currentStep === 1 ? (
                  <div className="form-inner a-slide-left"
                    key={currentStep}>
                    <span className="q-eyebrow">Q2</span>
                    <h2 className="q-heading">
                      {lang === 'hi'
                        ? 'कौन सी योजनाएं देखें?'
                        : lang === 'ta'
                        ? 'எந்த திட்டங்கள் பார்க்கணும்?'
                        : lang === 'bn'
                        ? 'কোন প্রকল্প দেখতে চান?'
                        : lang === 'te'
                        ? 'ఏ పథకాలు చూడాలి?'
                        : lang === 'mr'
                        ? 'कोणत्या योजना पहायच्या?'
                        : lang === 'gu'
                        ? 'કઈ યોજનાઓ જોવી છે?'
                        : lang === 'kn'
                        ? 'ಯಾವ ಯೋಜನೆಗಳನ್ನು ನೋಡಬೇಕು?'
                        : 'Which schemes to show?'}
                    </h2>
                    <p className="q-sub">
                      {lang === 'hi'
                        ? 'केंद्र, राज्य, या दोनों'
                        : lang === 'ta'
                        ? 'மத்திய, மாநில, அல்லது இரண்டும்'
                        : 'Central, State, or Both'}
                    </p>

                    <div style={{
                      display:'flex',
                      flexDirection:'column',
                      gap:'10px',
                      marginTop:'8px'
                    }}>
                      {[
                        {
                          value: 'all',
                          emoji: '🇮🇳',
                          hi: 'सभी योजनाएं',
                          ta: 'அனைத்து திட்டங்கள்',
                          bn: 'সব প্রকল্প',
                          te: 'అన్ని పథకాలు',
                          mr: 'सर्व योजना',
                          gu: 'તમામ યોજનાઓ',
                          kn: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
                          en: 'All Schemes',
                          sub_hi: 'केंद्र + राज्य दोनों',
                          sub_en: 'Central + State both',
                          sub_ta: 'மத்திய + மாநில இரண்டும்',
                        },
                        {
                          value: 'central',
                          emoji: '🏛️',
                          hi: 'केंद्र सरकार',
                          ta: 'மத்திய அரசு',
                          bn: 'কেন্দ্রীয় সরকার',
                          te: 'కేంద్ర ప్రభుత్వం',
                          mr: 'केंद्र सरकार',
                          gu: 'કેન્દ્ર સરકાર',
                          kn: 'ಕೇಂದ್ರ ಸರ್ಕಾರ',
                          en: 'Central Government',
                          sub_hi: 'PM Kisan, Ayushman जैसी योजनाएं',
                          sub_en: 'PM Kisan, Ayushman etc',
                          sub_ta: 'PM கிசான், ஆயுஷ்மான் போன்றவை',
                        },
                        {
                          value: 'state',
                          emoji: '🏠',
                          hi: 'राज्य सरकार',
                          ta: 'மாநில அரசு',
                          bn: 'রাজ্য সরকার',
                          te: 'రాష్ట్ర ప్రభుత్వం',
                          mr: 'राज्य सरकार',
                          gu: 'રાજ્ય સરકાર',
                          kn: 'ರಾಜ್ಯ ಸರ್ಕಾರ',
                          en: 'State Government',
                          sub_hi: 'आपके राज्य की विशेष योजनाएं',
                          sub_en: 'Schemes specific to your state',
                          sub_ta: 'உங்கள் மாநில சிறப்பு திட்டங்கள்',
                        },
                      ].map(opt => {
                        const label = lang === 'hi' ? opt.hi
                          : lang === 'ta' ? opt.ta
                          : lang === 'bn' ? opt.bn
                          : lang === 'te' ? opt.te
                          : lang === 'mr' ? opt.mr
                          : lang === 'gu' ? opt.gu
                          : lang === 'kn' ? opt.kn
                          : opt.en

                        const sub = lang === 'hi' ? opt.sub_hi
                          : lang === 'ta' ? opt.sub_ta
                          : opt.sub_en

                        const isSelected =
                          schemeTypeFilter === opt.value

                        return (
                          <button
                            key={opt.value}
                            className={`opt-btn ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => {
                              setSchemeTypeFilter(
                                opt.value as SchemeTypeFilter
                              )
                              setAnswers(prev => ({
                                ...prev,
                                scheme_type: opt.value
                              }))
                            }}>
                            <div style={{
                              display:'flex',
                              alignItems:'center',
                              gap:'12px',
                              flex:1
                            }}>
                              <span style={{fontSize:'24px'}}>
                                {opt.emoji}
                              </span>
                              <div style={{textAlign:'left'}}>
                                <div style={{
                                  fontSize:'15px',
                                  fontWeight:600,
                                  color: isSelected
                                    ? 'var(--saffron-mid)'
                                    : 'var(--ink)'
                                }}>
                                  {label}
                                </div>
                                <div style={{
                                  fontSize:'12px',
                                  color:'var(--subtle)',
                                  marginTop:'2px',
                                  fontWeight:400
                                }}>
                                  {sub}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="opt-check">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="form-inner a-slide-left"
                    key={currentStep}>
                  <div className="q-header-row">
                    <div className="q-header-left">
                      <span className="q-eyebrow">
                        Q{currentStep+1}
                      </span>
                        <h2 className="q-heading">
                          {localizedQuestion?.heading ?? q.en}
                        </h2>
                        <p className="q-sub">
                          {localizedQuestion?.sub ?? ''}
                        </p>
                      </div>
                    </div>
                  
                    {q.id === 'state' && (
                      <div className="search-wrap">
                        <input
                          type="text"
                          autoFocus
                          className="search-input"
                          aria-label={localizedQuestion?.heading ?? q.en}
                          placeholder={t.state_search_placeholder}
                          value={stateSearchQuery}
                          onChange={handleStateSearchChange}
                        />
                        <span className="search-icon">🔍</span>
                      </div>
                    )}

                    {q.id === 'occupation' && occupationOptions.map((opt) => {
                      const isSelected = answers.occupation === opt.value

                      return (
                        <button
                          key={opt.value}
                          role="button"
                          className={`opt-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => setAnswers(prev => ({
                            ...prev,
                            occupation: opt.value
                          }))}
                        >
                          <span style={{ minWidth: 0 }}>{opt.display}</span>
                          {isSelected && <span className="opt-check" aria-hidden="true">✓</span>}
                        </button>
                      )
                    })}

                    {q.id === 'income' && incomeOptions.map((opt) => {
                      const isSelected = answers.income === opt.value

                      return (
                        <button
                          key={opt.value}
                          role="button"
                          className={`opt-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => setAnswers(prev => ({
                            ...prev,
                            income: opt.value
                          }))}
                        >
                          <span style={{ minWidth: 0 }}>{opt.display}</span>
                          {isSelected && <span className="opt-check" aria-hidden="true">✓</span>}
                        </button>
                      )
                    })}

                    {q.type === 'select' && q.id !== 'occupation' && q.id !== 'income' && filteredQuestionOptions.map((opt, idx) => {
                      const isSelected = answers[q.id] === opt
                      const text = getTranslatedOption(q, opt)
                      
                      return (
                        <button
                          key={idx}
                          role="button"
                          className={`opt-btn ${isSelected ? 'selected' : ''}`}
                          data-question-id={q.id}
                          data-option-value={opt}
                          aria-pressed={isSelected}
                          onClick={handleAnswerSelect}
                        >
                          <span style={{ minWidth: 0 }}>{text}</span>
                          {isSelected && <span className="opt-check" aria-hidden="true">✓</span>}
                        </button>
                      )
                    })}

                    {q.type === 'number' && (
                      <div style={{width:'100%'}}>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="num-input"
                          aria-label={localizedQuestion?.heading ?? q.en}
                          value={answers.age ?? ''}
                          onChange={e => setAnswers(prev =>
                            ({...prev, age: e.target.value}))}
                          placeholder="35"
                          min="1"
                          max="120"
                          style={{width:'100%'}}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bottom-bar no-print">
                <button className="btn-cta"
                  style={{ maxWidth: '100%', width: '100%' }}
                  disabled={!hasAnswer}
                  onClick={handleNext}>
                  {t.next_btn}
                </button>
              </div>
            </div>
          )
        })()}

        {screen === 'loading' && (() => {
          const agentRows = [
            { time: 0, doneTime: 3, label: t.agent1_label },
            { time: 3, doneTime: 8, label: t.agent2_label },
            { time: 8, doneTime: 11, label: t.agent3_label },
            { time: 11, doneTime: 999, label: t.agent4_label }
          ].map(r => ({
            ...r,
            status: activeWaitTimer >= r.doneTime ? 'done' : activeWaitTimer >= r.time ? 'active' : 'pending'
          }))

          return (
            <div className="loading-screen">
              <div className="spinner">
                <div className="spinner-core"/>
              </div>
              <h2 className="loading-title">
                {t.loading_title}
              </h2>
              <p className="loading-sub">
                {t.loading_sub}
              </p>
              <div className="status-list"
                aria-live="polite">
                {agentRows.map((row,i) => (
                  <div key={i} className="status-item">
                    <div className={
                      `status-dot ${row.status}`}>
                      {row.status==='done'?'✓':''}
                    </div>
                    <span className={
                      `status-label ${row.status}`}>
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="load-track">
                <div className="load-fill"/>
              </div>
            </div>
          )
        })()}

        {screen === 'results' && results && (
          <div className="results-screen">
            <div className="tricolor"/>
            <nav className="navbar no-print">
              <div className="navbar-left">
                <button className="nav-back-btn"
                  onClick={()=>{
                    setScreen('hero')
                    setResults(null)
                  }}>
                  {t.back_btn}
                </button>
              </div>
              <div className="navbar-right"
                style={{ gap: '10px' }}>
                {renderLangDropdown()}
                <span className="nav-logo"
                  style={{fontSize:'13px'}}
                  onClick={() => {
                    setScreen('hero')
                    setResults(null)
                  }}>
                  {navBrand}
                </span>
              </div>
            </nav>
            <div className="results-banner">
              <div className="results-banner-content">
                <p className="results-eyebrow">
                  {t.results_label}
                </p>
                <h2 className="results-heading">
                  🎉 {results.matched_schemes.length}{' '}
                  {t.schemes_found}
                </h2>
                <p className="results-benefit-text">
                  {t.total_benefit_label}{' '}
                  {results.total_annual_benefit.length>90
                    ? results.total_annual_benefit
                        .slice(0,90)+'...'
                    : results.total_annual_benefit}
                </p>
              </div>
            </div>
            <div className="cards-wrap">
              {results.matched_schemes.map((s: any, i: number) => {
                const schemeDocs = results.documents?.[s.id] || []
                const schemeAction = results.actions?.[s.id] || {}
                const schemeExpl = explanation[s.id]
                const isExpanded = expandedCards[i.toString()]
                
                const derivedName = getSchemeDisplayName(s.id, s.name || s.id)
                const schemeReason = s.reason || s.reasoning || ''
                const displayReason =
                  lang !== 'hi' && lang !== 'en'
                    ? schemeExpl?.why_you_qualify ?? getReasonPlaceholder()
                    : schemeReason
                const categoryIcon = getCategoryIcon(derivedName, schemeReason)
                const isHighConfidence = typeof s.confidence === 'number' ? s.confidence >= 0.85 : s.confidence === 'high'

                return (
                  <div key={s.id}
                    className={`scheme-card ${
                      s.confidence==='high'
                        ?'high':'medium'
                    } a-fade-up`}
                    style={{
                      animationDelay:`${i*70}ms`
                    }}>
                    
                    <div className="card-top">
                      <div className="card-name-wrap">
                        <span className="card-icon" aria-hidden="true">{categoryIcon}</span>
                        <h3 className="card-name">{derivedName}</h3>
                      </div>
                      <div className="benefit-chip">
                        {getSchemeBenefit(s.id, s.estimated_benefit)}
                      </div>
                    </div>

                    <div className={`confidence-chip ${isHighConfidence ? 'high' : 'medium'}`}>
                      {isHighConfidence ? t.confidence_high : t.confidence_medium}
                    </div>

                    <p className="reason">
                      {displayReason}
                    </p>

                    <button 
                      className="expand-trigger"
                      data-expand-id={i.toString()}
                      aria-expanded={isExpanded}
                      onClick={handleToggleExpand}
                    >
                      {isExpanded ? t.hide_details : t.show_details}
                      <span className={`expand-caret ${isExpanded ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    <div className={`expand-body ${isExpanded ? 'open' : ''}`}>
                      <div style={{ paddingTop: '10px', paddingBottom: '16px' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📄 {t.docs_needed} ({schemeDocs.length})
                        </h4>
                        <div style={{ paddingBottom: '16px' }}>
                          {schemeDocs.map((doc: string, dIdx: number) => (
                            <div key={dIdx} className="doc-row">
                              <div className="doc-dot"></div>
                              {doc}
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📋 {t.how_to_apply}
                        </h4>
                        <div>
                          {schemeAction.steps?.map((step: string, sIdx: number) => (
                            <div key={sIdx} className="step-row">
                              <div className="step-badge">{sIdx + 1}</div>
                              <div className="step-text">{step}</div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => getExplanation(s)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--saffron)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 0',
                            textDecoration: 'underline'
                          }}>
                          {loadingExplain
                            ? '...'
                            : t.why_qualify_btn}
                        </button>

                        {schemeExpl && (
                          <div style={{
                            marginTop: '10px',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '10px'
                          }}>
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--ink-soft)',
                              marginBottom: '6px',
                              fontWeight: 700
                            }}>{schemeExpl.difficulty}</div>
                            {schemeExpl.why_you_qualify && (
                              <p style={{ marginBottom: '6px', fontSize: '12px' }}>
                                {(schemeExpl.why_you_qualify as string)}
                              </p>
                            )}
                            {schemeExpl.first_step && (
                              <p style={{ marginBottom: '6px', fontSize: '12px' }}>
                                {(schemeExpl.first_step as string)}
                              </p>
                            )}
                            {schemeExpl.watch_out_for && (
                              <p style={{ marginBottom: '6px', fontSize: '12px' }}>
                                {(schemeExpl.watch_out_for as string)}
                              </p>
                            )}
                            {schemeExpl.success_tip && (
                              <p style={{ marginBottom: '4px', fontSize: '12px', color: 'var(--saffron)' }}>
                                {(schemeExpl.success_tip as string)}
                              </p>
                            )}
                          </div>
                        )}

                        {schemeAction.helpline && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            fontSize: '12px',
                            color: 'var(--muted)'
                          }}>
                            <span>📞</span>
                            <a
                              href={`tel:${String(schemeAction.helpline).replace(/[^0-9+]/g, '')}`}
                              style={{
                                color: 'var(--saffron)',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              {(schemeAction.helpline as string)}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-actions no-print">
                      <button 
                        className="btn-apply"
                        onClick={() => window.open(
                          getApplyUrl(s.id),
                          '_blank',
                          'noopener,noreferrer'
                        )}
                      >
                        {t.apply_btn}
                      </button>
                      <button 
                        className="btn-wa"
                        data-scheme-name={derivedName}
                        data-scheme-benefit={getSchemeBenefit(s.id, s.estimated_benefit)}
                        onClick={handleShareClick}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        {t.share_btn}
                      </button>
                    </div>
                  </div>
                )
              })}
              <div style={{marginTop:'8px'}}>
                <button className="btn-ghost no-print"
                  onClick={()=>{
                    setScreen('hero')
                    setResults(null)
                  }}>
                  🔄 {t.retry_btn}
                </button>
                <button className="btn-ghost no-print"
                  onClick={()=>window.print()}>
                  💾 {t.pdf_btn}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
