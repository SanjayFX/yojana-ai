'use client'

const row1 = [
  "🌾 PM किसान सम्मान", "🏥 आयुष्मान भारत", "🏠 PM आवास योजना",
  "👧 बेटी बचाओ बेटी पढ़ाओ", "🔥 उज्ज्वला योजना", "💰 मुद्रा लोन",
  "📚 छात्रवृत्ति योजना", "👩🌾 महिला सम्मान बचत", "🧑🌾 सोयल हेल्थ कार्ड"
]

const row2 = [
  "🌾 விவசாயி திட்டம்", "🏥 ஆயுஷ்மான் பாரத்", "📚 தொழில் கல்வி",
  "🌾 రైతు నిధి పథకం", "🏠 గృహ నిర్మాణ పథకం", "💊 ఆరోగ్య భీమా",
  "👧 బాలికా సంరక్షణ", "💰 వ్యాపార రుణం", "📚 విద్యార్థి స్కాలర్షిప్"
]

const row3 = [
  "🌾 কৃষক সম্মান নিধি", "🏥 আয়ুষ্মান ভারত", "🏠 আবাস যোজনা",
  "🌾 शेतकरी सन्मान", "🏥 आरोग्य भारत", "💰 मुद्रा कर्ज",
  "👩 महिला बचत योजना", "📚 शिष्यवृत्ती योजना", "🔥 उज्ज्वला योजना"
]

function MarqueeRow({ items, reverse = false, duration = "40s" }: {
  items: string[]
  reverse?: boolean
  duration?: string
}) {
  return (
    <div className="overflow-hidden" style={{ "--gap": "0.75rem" } as React.CSSProperties}>
      <div
        className={`flex w-max gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--duration": duration } as React.CSSProperties}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap border border-orange-200 bg-white px-4 py-1.5 text-sm text-orange-800 font-medium rounded-full shadow-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SchemesMarchingSection({ label, heading }: { label?: string, heading?: string }) {
  return (
    <section className="relative py-14 bg-orange-50 overflow-hidden">
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none" />

      <div className="text-center mb-8 px-4">
        <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-1">
          {label || "780+ योजनाओं का डेटाबेस"}
        </p>
        <h2 className="text-2xl font-bold text-gray-800">
          {heading || "हर भाषा में, हर राज्य के लिए"}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow items={row1} duration="45s" />
        <MarqueeRow items={row2} reverse duration="50s" />
        <MarqueeRow items={row3} duration="42s" />
      </div>
    </section>
  )
}
