const fs = require('fs');
const path = require('path');

const transFile = path.join(__dirname, 'src/lib/i18n/translations.ts');
let content = fs.readFileSync(transFile, 'utf8');

const tr = {
  hi: {
    hero_badge: "AI-Powered • मुफ्त • लॉगिन नहीं",
    hero_headline: "सरकारी योजनाएं",
    hero_typewriter: ["खोजें", "जानें", "पाएं"],
    hero_subtext: "सिर्फ 6 सवाल — 60 सेकंड में जानें आप किन योजनाओं के पात्र हैं",
    hero_cta: "अपनी योजनाएं खोजें",
    hero_microtrust: "मुफ्त है • कोई लॉगिन नहीं • 780+ योजनाएं",
    stats_schemes_label: "सरकारी योजनाएं",
    stats_questions_label: "सवाल सिर्फ",
    stats_result_label: "सेकंड में परिणाम",
    trust_nic: "NIC डेटा स्रोत",
    trust_nologin: "लॉगिन नहीं",
    trust_free: "मुफ्त",
    trust_languages: "8 भाषाएं",
    steps_heading: "यह कैसे काम करता है?",
    steps_1_title: "आपकी जानकारी",
    steps_1_desc: "आय, आयु, राज्य, श्रेणी",
    steps_2_title: "AI मिलान",
    steps_2_desc: "780+ योजनाओं से तुलना",
    steps_3_title: "पूरी सूची",
    steps_3_desc: "पात्र योजनाएं + आवेदन लिंक",
    schemes_section_label: "780+ योजनाओं का डेटाबेस",
    schemes_section_heading: "हर भाषा में, हर राज्य के लिए",
    marquee_row1: ["🌾 PM किसान सम्मान", "🏥 आयुष्मान भारत", "🏠 PM आवास योजना", "👧 बेटी बचाओ बेटी पढ़ाओ", "🔥 उज्ज्वला योजना", "💰 मुद्रा लोन", "📚 छात्रवृत्ति योजना", "👩🌾 महिला सम्मान बचत", "🧑🌾 सोयल हेल्थ कार्ड"],
    marquee_row2: ["🌾 कृषि सिंचाई", "🏥 आरोग्य स्वास्थ्य", "🏠 ग्राम आवास", "👧 सुकन्या समृद्धि", "🔥 गैस कनेक्शन", "💰 जीवन ज्योति बीमा", "📚 बालिका पढ़ाई", "👩🌾 महिला सशक्तिकरण", "🧑🌾 किसान क्रेडिट कार्ड"],
    marquee_row3: ["🌾 फसल बीमा योजना", "🏥 मुख्यमंत्री चिकित्सा", "🏠 शहरी आवास योजना", "👧 मातृ वंदना योजना", "🔥 सौभाग्य योजना", "💰 अटल पेंशन योजना", "📚 विदेश अध्ययन योजना", "👩🌾 महिला व्यापार लोन", "🧑🌾 कृषि यंत्र योजना"]
  },
  en: {
    hero_badge: "AI-Powered • Free • No Login",
    hero_headline: "Government Schemes",
    hero_typewriter: ["Search", "Learn", "Get"],
    hero_subtext: "Just 6 questions — in 60 seconds know what schemes you qualify for",
    hero_cta: "Find your schemes",
    hero_microtrust: "Free • No Login • 780+ Schemes",
    stats_schemes_label: "Govt Schemes",
    stats_questions_label: "Questions Only",
    stats_result_label: "Results In",
    trust_nic: "NIC Data Source",
    trust_nologin: "No Login",
    trust_free: "100% Free",
    trust_languages: "8 Languages",
    steps_heading: "How it works?",
    steps_1_title: "Your Info",
    steps_1_desc: "Income, Age, State, Category",
    steps_2_title: "AI Match",
    steps_2_desc: "Comparing 780+ schemes",
    steps_3_title: "Full List",
    steps_3_desc: "Eligible schemes + Apply link",
    schemes_section_label: "780+ Schemes Database",
    schemes_section_heading: "In every language, for every state",
    marquee_row1: ["🌾 PM Kisan Samman", "🏥 Ayushman Bharat", "🏠 PM Awas Yojana", "👧 Beti Bachao", "🔥 Ujjwala Yojana", "💰 Mudra Loan", "📚 Scholarship Scheme", "👩🌾 Mahila Samman", "🧑🌾 Soil Health Card"],
    marquee_row2: ["🌾 Krishi Sinchai", "🏥 Health Scheme", "🏠 Gram Awas", "👧 Sukanya Samriddhi", "🔥 Gas Connection", "💰 Jeevan Jyoti", "📚 Girl Child Education", "👩🌾 Women Empowerment", "🧑🌾 Kisan Credit"],
    marquee_row3: ["🌾 Crop Insurance", "🏥 CM Medical Scheme", "🏠 Urban Housing", "👧 Matru Vandana", "🔥 Saubhagya Yojana", "💰 Atal Pension", "📚 Foreign Study", "👩🌾 Women Business", "🧑🌾 Farm Equipment"]
  },
  bn: {
    hero_badge: "AI-Powered • বিনামূল্যে • লগইন নেই",
    hero_headline: "সরকারি প্রকল্প",
    hero_typewriter: ["খুঁজুন", "জানুন", "পান"],
    hero_subtext: "মাত্র ৬টি প্রশ্ন — ৬০ সেকেন্ডে জানুন আপনি কোন প্রকল্পের যোগ্য",
    hero_cta: "আপনার প্রকল্প খুঁজুন",
    hero_microtrust: "বিনামূল্যে • লগইন নেই • ৭৮০+ প্রকল্প",
    stats_schemes_label: "সরকারি প্রকল্প",
    stats_questions_label: "শুধু প্রশ্ন",
    stats_result_label: "সেকেন্ডে ফলাফল",
    trust_nic: "NIC তথ্যের উৎস",
    trust_nologin: "লগইন নেই",
    trust_free: "বিনামূল্যে",
    trust_languages: "৮টি ভাষা",
    steps_heading: "কিভাবে কাজ করে?",
    steps_1_title: "আপনার তথ্য",
    steps_1_desc: "আয়, বয়স, রাজ্য, বিভাগ",
    steps_2_title: "AI মিলান",
    steps_2_desc: "৭৮০+ প্রকল্পের সাথে তুলনা",
    steps_3_title: "সম্পূর্ণ তালিকা",
    steps_3_desc: "যোগ্য প্রকল্প + আবেদনের লিঙ্ক",
    schemes_section_label: "৭৮০+ প্রকল্পের ডাটাবেস",
    schemes_section_heading: "সব ভাষায়, সব রাজ্যের জন্য",
    marquee_row1: ["🌾 কৃষক সম্মান নিধি", "🏥 আয়ুষ্মান ভারত", "🏠 আবাস যোজনা", "👧 বেটি বাঁচাও", "🔥 উজ্জ্বলা যোজনা", "💰 মুদ্রা লোন", "📚 স্কলারশিপ স্কিম", "👩🌾 মহিলা সম্মান", "🧑🌾 সয়েল হেল্থ কার্ড"],
    marquee_row2: ["🌾 কৃষি সেচ", "🏥 স্বাস্থ্য প্রকল্প", "🏠 গ্রাম আবাস", "👧 সুকন্যা সমৃদ্ধি", "🔥 গ্যাস সংযোগ", "💰 জীবন জ্যোতি", "📚 নারী শিক্ষা", "👩🌾 নারী ক্ষমতায়ন", "🧑🌾 কিষাণ ক্রেডিট"],
    marquee_row3: ["🌾 ফসল বীমা", "🏥 সিএম মেডিকেল", "🏠 শহর আবাস", "👧 মাতৃ বন্দনা", "🔥 সৌভাগ্য যোজনা", "💰 অটল পেনশন", "📚 বিদেশ শিক্ষা", "👩🌾 মহিলা ব্যবসা", "🧑🌾 কৃষি সরঞ্জাম"]
  },
  te: {
    hero_badge: "AI-Powered • ఉచితం • లాగిన్ లేదు",
    hero_headline: "ప్రభుత్వ పథకాలు",
    hero_typewriter: ["వెతకండి", "తెలుసుకోండి", "పొందండి"],
    hero_subtext: "కేవలం 6 ప్రశ్నలు — 60 సెకన్లలో ఏ పథకాలకు అర్హులో తెలుసుకోండి",
    hero_cta: "మీ పథకాలను వెతకండి",
    hero_microtrust: "ఉచితం • లాగిన్ లేదు • 780+ పథకాలు",
    stats_schemes_label: "ప్రభుత్వ పథకాలు",
    stats_questions_label: "ప్రశ్నలు మాత్రమే",
    stats_result_label: "సెకన్లలో ఫలితాలు",
    trust_nic: "NIC డేటా మూలం",
    trust_nologin: "లాగిన్ లేదు",
    trust_free: "100% ఉచితం",
    trust_languages: "8 భాషలు",
    steps_heading: "ఇది ఎలా పనిచేస్తుంది?",
    steps_1_title: "మీ సమాచారం",
    steps_1_desc: "ఆదాయం, వయస్సు, రాష్ట్రం, వర్గం",
    steps_2_title: "AI సరిపోలిక",
    steps_2_desc: "780+ పథకాలతో పోలిక",
    steps_3_title: "పూర్తి జాబితా",
    steps_3_desc: "అర్హత ఉన్న పథకాలు + దరఖాస్తు లింక్",
    schemes_section_label: "780+ పథకాల డేటాబేస్",
    schemes_section_heading: "ప్రతి భాషలో, ప్రతి రాష్ట్రానికి",
    marquee_row1: ["🌾 రైతు నిధి పథకం", "🏥 ఆయుష్మాన్ భారత్", "🏠 గృహ నిర్మాణ పథకం", "👧 బాలికా సంరక్షణ", "🔥 ఉజ్వల యోజన", "💰 వ్యాపార రుణం", "📚 విద్యార్థి స్కాలర్షిప్", "👩🌾 మహిళా పొదుపు", "🧑🌾 భూసార కార్డు"],
    marquee_row2: ["🌾 వ్యవసాయ సాగు", "🏥 ఆరోగ్య పథకం", "🏠 గ్రామ నివాసం", "👧 సుకన్య సమృద్ధి", "🔥 గ్యాస్ కనెక్షన్", "💰 జీవన్ జ్యోతి", "📚 బాలికా విద్య", "👩🌾 మహిళా సాధికారత", "🧑🌾 కిసాన్ క్రెడిట్"],
    marquee_row3: ["🌾 పంట భీమా", "🏥 ముఖ్యమంత్రి వైద్య", "🏠 పట్టణ నివాసం", "👧 మాతృ వందన", "🔥 సౌభాగ్య యోజన", "💰 అటల్ పెన్షన్", "📚 విదేశీ విద్య", "👩🌾 మహిళా వ్యాపారం", "🧑🌾 వ్యవసాయ పరికరాలు"]
  },
  mr: {
    hero_badge: "AI-Powered • मोफत • लॉगिन नाही",
    hero_headline: "सरकारी योजना",
    hero_typewriter: ["शोधा", "जाणून घ्या", "मिळवा"],
    hero_subtext: "फक्त 6 प्रश्न — 60 सेकंदात जाणून घ्या तुम्ही कोणत्या योजनांसाठी पात्र आहात",
    hero_cta: "तुमची योजना शोधा",
    hero_microtrust: "मोफत • लॉगिन नाही • 780+ योजना",
    stats_schemes_label: "सरकारी योजना",
    stats_questions_label: "फक्त प्रश्न",
    stats_result_label: "सेकंदात निकाल",
    trust_nic: "NIC डेटा स्रोत",
    trust_nologin: "लॉगिन नाही",
    trust_free: "100% मोफत",
    trust_languages: "8 भाषा",
    steps_heading: "हे कसे काम करते?",
    steps_1_title: "तुमची माहिती",
    steps_1_desc: "उत्पन्न, वय, राज्य, श्रेणी",
    steps_2_title: "AI जुळणी",
    steps_2_desc: "780+ योजनांशी तुलना",
    steps_3_title: "संपूर्ण यादी",
    steps_3_desc: "पात्र योजना + अर्ज लिंक",
    schemes_section_label: "780+ योजनांचा डेटाबेस",
    schemes_section_heading: "प्रत्येक भाषेत, प्रत्येक राज्यासाठी",
    marquee_row1: ["🌾 शेतकरी सन्मान", "🏥 आरोग्य भारत", "🏠 आवास योजना", "👧 मुलगी वाचवा", "🔥 उज्ज्वला योजना", "💰 मुद्रा कर्ज", "📚 शिष्यवृत्ती योजना", "👩🌾 महिला बचत योजना", "🧑🌾 मृदा आरोग्य कार्ड"],
    marquee_row2: ["🌾 कृषी सिंचन", "🏥 आरोग्य योजना", "🏠 ग्राम निवारा", "👧 सुकन्या समृद्धी", "🔥 गॅस जोडणी", "💰 जीवन ज्योती", "📚 मुलींचे शिक्षण", "👩🌾 महिला सक्षमीकरण", "🧑🌾 किसान क्रेडिट"],
    marquee_row3: ["🌾 पीक विमा योजना", "🏥 मुख्यमंत्री वैद्यकीय", "🏠 शहरी निवारा", "👧 मातृ वंदना", "🔥 सौभाग्य योजना", "💰 अटल पेन्शन", "📚 परदेशी शिक्षण", "👩🌾 महिला व्यवसाय", "🧑🌾 कृषी उपकरणे"]
  },
  ta: {
    hero_badge: "AI-Powered • இலவசம் • உள்நுழைவு இல்லை",
    hero_headline: "அரசு திட்டங்கள்",
    hero_typewriter: ["தேடுங்கள்", "அறியுங்கள்", "பெறுங்கள்"],
    hero_subtext: "வெறும் 6 கேள்விகள் — 60 வினாடிகளில் எந்த திட்டங்களுக்கு தகுதியானவர் என்பதை அறியுங்கள்",
    hero_cta: "உங்கள் திட்டங்களை தேடுங்கள்",
    hero_microtrust: "இலவசம் • உள்நுழைவு இல்லை • 780+ திட்டங்கள்",
    stats_schemes_label: "அரசு திட்டங்கள்",
    stats_questions_label: "கேள்விகள் மட்டும்",
    stats_result_label: "வினாடிகளில் முடிவு",
    trust_nic: "NIC தரவு ஆதாரம்",
    trust_nologin: "உள்நுழைவு இல்லை",
    trust_free: "100% இலவசம்",
    trust_languages: "8 மொழிகள்",
    steps_heading: "எப்படி வேலை செய்கிறது?",
    steps_1_title: "உங்கள் தகவல்",
    steps_1_desc: "வருமானம், வயது, மாநிலம், வகுப்பு",
    steps_2_title: "AI ஒப்பீடு",
    steps_2_desc: "780+ திட்டங்களுடன் ஒப்பீடு",
    steps_3_title: "முழு பட்டியல்",
    steps_3_desc: "தகுதியான திட்டங்கள் + விண்ணப்ப இணைப்பு",
    schemes_section_label: "780+ திட்டங்களின் தரவுத்தளம்",
    schemes_section_heading: "ஒவ்வொரு மொழியிலும், ஒவ்வொரு மாநிலத்திற்கும்",
    marquee_row1: ["🌾 விவசாயி திட்டம்", "🏥 ஆயுஷ்மான் பாரத்", "🏠 வீடமைப்பு திட்டம்", "👧 பெண் குழந்தை பாதுகாப்பு", "🔥 உஜ்வாலா யோஜனா", "💰 வணிகக் கடன்", "📚 கல்வி உதவித்தொகை", "👩🌾 மகளிர் சேமிப்பு", "🧑🌾 மண் வள அட்டை"],
    marquee_row2: ["🌾 வேளாண் நீர்ப்பாசனம்", "🏥 சுகாதார திட்டம்", "🏠 கிராம வீடு", "👧 சுகன்யா சம்ரித்தி", "🔥 எரிவாயு இணைப்பு", "💰 ஜீவன் ஜோதி", "📚 பெண் கல்வி", "👩🌾 மகளிர் அதிகாரம்", "🧑🌾 கிசான் கிரெடிட்"],
    marquee_row3: ["🌾 பயிர் காப்பீடு", "🏥 முதலமைச்சர் மருத்துவம்", "🏠 நகர்ப்புற வீடு", "👧 மாத்ரு வந்தனா", "🔥 சௌபாக்ய யோஜனா", "💰 அடல் பென்ஷன்", "📚 வெளிநாட்டு கல்வி", "👩🌾 மகளிர் வணிகம்", "🧑🌾 வேளாண் உபகரணங்கள்"]
  },
  gu: {
    hero_badge: "AI-Powered • મફત • લૉગિન નહીં",
    hero_headline: "સરકારી યોજનાઓ",
    hero_typewriter: ["શોધો", "જાણો", "મેળવો"],
    hero_subtext: "માત્ર 6 સવાલ — 60 સેકન્ડમાં જાણો તમે કઈ યોજનાઓ માટે પાત્ર છો",
    hero_cta: "તમારી યોજનાઓ શોધો",
    hero_microtrust: "મફત • લૉગિન નહીં • 780+ યોજનાઓ",
    stats_schemes_label: "સરકારી યોજનાઓ",
    stats_questions_label: "માત્ર સવાલ",
    stats_result_label: "પરિણામો",
    trust_nic: "NIC ડેટા સ્ત્રોત",
    trust_nologin: "લૉગિન નહીં",
    trust_free: "100% મફત",
    trust_languages: "8 ભાષાઓ",
    steps_heading: "આ કેવી રીતે કામ કરે છે?",
    steps_1_title: "તમારી માહિતી",
    steps_1_desc: "આવક, ઉંમર, રાજ્ય, શ્રેણી",
    steps_2_title: "AI સરખામણી",
    steps_2_desc: "780+ યોજનાઓ સાથે સરખામણી",
    steps_3_title: "સંપૂર્ણ યાદી",
    steps_3_desc: "પાત્ર યોજનાઓ + અરજી લિંક",
    schemes_section_label: "780+ યોજનાઓનો ડેટાબેઝ",
    schemes_section_heading: "દરેક ભાષામાં, દરેક રાજ્ય માટે",
    marquee_row1: ["🌾 PM કિસાન સન્માન", "🏥 આયુષ્માન ભારત", "🏠 PM આવાસ યોજના", "👧 બેટી બચાઓ", "🔥 ઉજ્જવલા યોજના", "💰 મુદ્રા લોન", "📚 શિષ્યવૃત્તિ યોજના", "👩🌾 મહિલા સન્માન અનામત", "🧑🌾 સોઇલ હેલ્થ કાર્ડ"],
    marquee_row2: ["🌾 કૃષિ સિંચાઈ", "🏥 આરોગ્ય યોજના", "🏠 ગ્રામ આવાસ", "👧 સુકન્યા સમૃદ્ધિ", "🔥 ગેસ કનેક્શન", "💰 જીવન જ્યોતિ", "📚 બાળકી શિક્ષણ", "👩🌾 મહિલા સશક્તિકરણ", "🧑🌾 કિસાન ક્રેડિટ"],
    marquee_row3: ["🌾 પાક વીમા યોજના", "🏥 મુખ્યમંત્રી તબીબી", "🏠 શહેરી આવાસ", "👧 માતૃ વંદના", "🔥 સૌભાગ્ય યોજના", "💰 અટલ પેન્શન", "📚 વિદેશી અભ્યાસ", "👩🌾 મહિલા વ્યાપાર", "🧑🌾 કૃષિ સાધનો"]
  },
  kn: {
    hero_badge: "AI-Powered • ಉಚಿತ • ಲಾಗಿನ್ ಇಲ್ಲ",
    hero_headline: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    hero_typewriter: ["ಹುಡುಕಿ", "ತಿಳಿಯಿರಿ", "ಪಡೆಯಿರಿ"],
    hero_subtext: "ಕೇವಲ 6 ಪ್ರಶ್ನೆಗಳು — 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನೀವು ಯಾವ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರು ಎಂದು ತಿಳಿಯಿರಿ",
    hero_cta: "ನಿಮ್ಮ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
    hero_microtrust: "ಉಚಿತ • ಲಾಗಿನ್ ಇಲ್ಲ • 780+ ಯೋಜನೆಗಳು",
    stats_schemes_label: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    stats_questions_label: "ಪ್ರಶ್ನೆಗಳು ಮಾತ್ರ",
    stats_result_label: "ಫಲಿತಾಂಶಗಳು",
    trust_nic: "NIC ಡೇಟಾ ಮೂಲ",
    trust_nologin: "ಲಾಗಿನ್ ಇಲ್ಲ",
    trust_free: "100% ಉಚಿತ",
    trust_languages: "8 ಭಾಷೆಗಳು",
    steps_heading: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?",
    steps_1_title: "ನಿಮ್ಮ ಮಾಹಿತಿ",
    steps_1_desc: "ಆದಾಯ, ವಯಸ್ಸು, ರಾಜ್ಯ, ವರ್ಗ",
    steps_2_title: "AI ಹೋಲಿಕೆ",
    steps_2_desc: "780+ ಯೋಜನೆಗಳೊಂದಿಗೆ ಹೋಲಿಕೆ",
    steps_3_title: "ಪೂರ್ಣ ಪಟ್ಟಿ",
    steps_3_desc: "ಅರ್ಹ ಯೋಜನೆಗಳು + ಅರ್ಜಿ ಲಿಂಕ್",
    schemes_section_label: "780+ ಯೋಜನೆಗಳ ಡೇಟಾಬೇಸ್",
    schemes_section_heading: "ಪ್ರತಿ ಭಾಷೆಯಲ್ಲಿ, ಪ್ರತಿ ರಾಜ್ಯಕ್ಕೂ",
    marquee_row1: ["🌾 PM ಕಿಸಾನ್ ಸಮ್ಮಾನ್", "🏥 ಆಯುಷ್ಮಾನ್ ಭಾರತ್", "🏠 PM ಆವಾಸ್ ಯೋಜನೆ", "👧 ಬೇಟಿ ಬಚಾವೊ", "🔥 ಉಜ್ವಲ ಯೋಜನೆ", "💰 ಮುದ್ರಾ ಸಾಲ", "📚 ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆ", "👩🌾 ಮಹಿಳಾ ಸಮ್ಮಾನ್", "🧑🌾 ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್"],
    marquee_row2: ["🌾 ಕೃಷಿ ನೀರಾವರಿ", "🏥 ಆರೋಗ್ಯ ಯೋಜನೆ", "🏠 ಗ್ರಾಮ ವಸತಿ", "👧 ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ", "🔥 ಗ್ಯಾಸ್ ಸಂಪರ್ಕ", "💰 ಜೀವನ ಜ್ಯೋತಿ", "📚 ಹೆಣ್ಣುಮಕ್ಕಳ ಶಿಕ್ಷಣ", "👩🌾 ಮಹಿಳಾ ಸಬಲೀಕರಣ", "🧑🌾 ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್"],
    marquee_row3: ["🌾 ಬೆಳೆ ವಿಮೆ", "🏥 ಸಿಎಂ ವೈದ್ಯಕೀಯ", "🏠 ನಗರ ವಸತಿ", "👧 ಮಾತೃ ವಂದನಾ", "🔥 ಸೌಭಾಗ್ಯ ಯೋಜನೆ", "💰 ಅಟಲ್ ಪಿಂಚಣಿ", "📚 ವಿದೇಶಿ ಅಧ್ಯಯನ", "👩🌾 ಮಹಿಳಾ ವ್ಯಾಪಾರ", "🧑🌾 ಕೃಷಿ ಉಪಕರಣಗಳು"]
  }
};

// Clean up old keys using regex
content = content.replace(/"hero\.badge":[^\n]*\n/g, '');
content = content.replace(/"hero\.headline":[^\n]*\n/g, '');
content = content.replace(/"hero\.typewriter":[^\n]*\n/g, '');
content = content.replace(/"hero\.subtext":[^\n]*\n/g, '');
content = content.replace(/"hero\.cta":[^\n]*\n/g, '');
content = content.replace(/"hero\.microtrust":[^\n]*\n/g, '');
content = content.replace(/"stats\.schemes\.label":[^\n]*\n/g, '');
content = content.replace(/"stats\.questions\.label":[^\n]*\n/g, '');
content = content.replace(/"stats\.result\.label":[^\n]*\n/g, '');
content = content.replace(/"trust\.nic":[^\n]*\n/g, '');
content = content.replace(/"trust\.nologin":[^\n]*\n/g, '');
content = content.replace(/"trust\.free":[^\n]*\n/g, '');
content = content.replace(/"trust\.languages":[^\n]*\n/g, '');
content = content.replace(/"steps\.heading":[^\n]*\n/g, '');
content = content.replace(/"steps\.1\.title":[^\n]*\n/g, '');
content = content.replace(/"steps\.1\.desc":[^\n]*\n/g, '');
content = content.replace(/"steps\.2\.title":[^\n]*\n/g, '');
content = content.replace(/"steps\.2\.desc":[^\n]*\n/g, '');
content = content.replace(/"steps\.3\.title":[^\n]*\n/g, '');
content = content.replace(/"steps\.3\.desc":[^\n]*\n/g, '');
content = content.replace(/"schemes\.section\.label":[^\n]*\n/g, '');
content = content.replace(/"schemes\.section\.heading":[^\n]*\n/g, '');

for (const lang of Object.keys(tr)) {
    // using string concat for language key mapping
    const blockStart = content.indexOf('  ' + lang + ': {');
    if (blockStart !== -1) {
      const blockInner = content.indexOf('{', blockStart) + 1;
      let newEntries = '\\n';
      for (const [k, v] of Object.entries(tr[lang])) {
        newEntries += '    ' + k + ': ' + JSON.stringify(v) + ',\\n';
      }
      content = content.slice(0, blockInner) + newEntries + content.slice(blockInner);
    }
}

fs.writeFileSync(transFile, content);
console.log('Translations fixed successfully!');
