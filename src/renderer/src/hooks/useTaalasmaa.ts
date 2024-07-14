import { RefObject, useEffect, useState } from 'react'

/**
 * Observes given element dimensions without doing anything to them.
 * @returns w,h in pixels
 */
export const useTaalasmaa = <T extends HTMLDivElement>(ref: RefObject<T>) => {
    const [w, setW] = useState<number>(0)
    const [h, setH] = useState<number>(0)

    useEffect(() => {
        if (!ref.current) return

        const resizeObserver = new ResizeObserver(() => {
            if (!ref.current) return
            if (ref.current.offsetWidth !== w) {
                setW(ref.current.offsetWidth)
            }
            if (ref.current.offsetHeight !== h) {
                setH(ref.current.offsetHeight)
            }
        })

        resizeObserver.observe(ref.current)

        return function cleanup() {
            resizeObserver.disconnect()
        }
    }, [])

    return { w, h }
}
