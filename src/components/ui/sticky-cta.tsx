"use client"
import { useState, useEffect } from "react"
import { ArrowRightIcon } from "lucide-react"

export function StickyCTA({ label, onClick }: {
  label: string
  onClick: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll, 
      { passive: true })
    return () => window.removeEventListener("scroll", 
      handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] md:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto w-full flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white font-bold text-base py-4 shadow-lg shadow-orange-200 active:scale-95 transition-all duration-200"
      >
        {label}
        <ArrowRightIcon className="size-5" />
      </button>
    </div>
  )
}
