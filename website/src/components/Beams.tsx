import React from "react"
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function BackgroundBeams() {
    return (
        <div id="beams" className="fixed left-0 top-0 -z-10 h-full w-full">
            <div className="bg-dot-white/[0.2] relative -z-10 flex h-full w-full items-center justify-center">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>
        </div>
    )
}
