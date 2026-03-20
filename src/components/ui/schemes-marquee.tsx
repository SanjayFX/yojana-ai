'use client'

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

import { useLang } from '@/lib/context/LanguageContext'

export function SchemesMarchingSection() {
  const { t } = useLang();
  return (
    <section className="relative py-14 bg-orange-50 overflow-hidden">
      <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none" />

      <div className="text-center mb-8 px-4">
        <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-1">
          {t.schemes_section_label}
        </p>
        <h2 className="text-2xl font-bold text-gray-800">
          {t.schemes_section_heading}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow items={t.marquee_row1 as any} duration="60s" />
        <MarqueeRow items={t.marquee_row2 as any} reverse duration="75s" />
        <MarqueeRow items={t.marquee_row3 as any} duration="65s" />
      </div>
    </section>
  )
}
