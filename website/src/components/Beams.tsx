import React from "react"
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function BackgroundBeams() {
    return (
        <div id="beams" className="fixed top-0 left-0 w-full h-full -z-10">
            <div className="h-full w-full dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center -z-10">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black/70 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>
        </div>
    )
}
