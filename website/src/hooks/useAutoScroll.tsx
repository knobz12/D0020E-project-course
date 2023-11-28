import { useEffect } from "react"

/**
 * The maximum difference between bottom of list and scroll
 * position where it force scrolls downs
 */
const SCROLL_MARGIN = 200

export function useAutoScroll(
    parentId: string,
    elementId: string,
    active?: boolean,
) {
    useEffect(() => {
        if (!active) {
            return
        }

        // Only run in client, not while server side rendering
        if (typeof window === undefined) {
            return
        }

        const el = document.getElementById(elementId)
        const parentEl = document.getElementById(parentId)

        if (!el || !parentEl) {
            return
        }

        const resizeObserver = new ResizeObserver(function () {
            const { scrollTop, scrollHeight, clientHeight } = parentEl

            if (
                clientHeight < scrollHeight &&
                scrollTop < 0 &&
                Math.abs(scrollTop) < SCROLL_MARGIN
            ) {
                parentEl.scrollTo({
                    top: parentEl.scrollHeight,
                    behavior: "smooth",
                })
            }
        })

        if (el) {
            resizeObserver.observe(el)
        }
        return () => resizeObserver.disconnect()
    }, [active, elementId, parentId])
}
