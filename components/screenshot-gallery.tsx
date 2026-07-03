"use client"

import { useState } from "react"
import type { Screenshot } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ScreenshotGallery({ screenshots, title }: { screenshots: Screenshot[]; title: string }) {
  const [active, setActive] = useState(0)

  if (screenshots.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[active]?.image_url || "/placeholder.svg"}
          alt={`${title} screenshot ${active + 1}`}
          className="aspect-video w-full object-cover"
        />
      </div>
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {screenshots.map((shot, i) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View screenshot ${i + 1}`}
              className={cn(
                "shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.image_url || "/placeholder.svg"} alt="" className="h-16 w-28 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
