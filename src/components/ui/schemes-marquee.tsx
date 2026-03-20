'use client'

const row1 = [
  "🌾 PM किसान सम्मान", "🏥 आयुष्मान भारत", "🏠 PM आवास योजना",
  "👧 बेटी बचाओ बेटी पढ़ाओ", "🔥 उज्ज्वला योजना", "💰 मुद्रा लोन",
  "📚 छात्रवृत्ति योजना", "💊 सुकन्या समृद्धि", "🌱 फसल बीमा योजना",
  "🏗️ ग्राम आवास योजना"
]

const row2 = [
  "🌾 விவசாயி திட்டம்", "🏥 ஆயுஷ்மான் பாரத்", "📚 தொழில் கல்வி",
  "👧 பெண் கல்வி திட்டம்", "🌾 రైతు నిధి పథకం", "🏠 గృహ నిర్మాణ పథకం",
  "💊 ఆరోగ్య భీమా", "👧 బాలికా సంరక్షణ", "💰 వ్యాపార రుణం",
  "📚 విద్యార్థి స్కాలర్షిప్"
]

const row3 = [
  "🌾 কৃষক সম্মান নিধি", "🏥 আয়ুষ্মান ভারত", "🏠 আবাস যোজনা",
  "📚 শিক্ষা বৃত্তি", "🌾 शेतकरी सन्मान निधी", "🏥 आरोग्य भारत",
  "💰 मुद्रा कर्ज", "👩 महिला बचत योजना", "📚 शिष्यवृत्ती योजना",
  "🔥 उज्ज्वला योजना"
]

function MarqueeRow({ items, reverse = false, duration = "40s" }: {
  items: string[]
  reverse?: boolean
  duration?: string
}) {
  return (
    <div className="overflow-hidden" style={{ "--gap": "0.75rem" } as React.CSSProperties}>
      <div
        className={`flex w-max gap-3 hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--duration": duration } as React.CSSProperties}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-800 shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SchemesMarchingSection() {
  return (
    <section className="relative py-8 bg-orange-50 overflow-hidden mt-2">
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none" />

      <div className="text-center mb-6 px-4">
        <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-1">
          780+ योजनाओं का डेटाबेस
        </p>
        <h2 className="text-2xl font-bold text-gray-800">
          हर भाषा में, हर राज्य के लिए
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow items={row1} duration="60s" />
        <MarqueeRow items={row2} reverse duration="75s" />
        <MarqueeRow items={row3} duration="65s" />
      </div>
    </section>
  )
}
