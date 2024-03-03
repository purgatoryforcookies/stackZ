import { RefObject, useEffect, useState } from 'react'

export const useTaalasmaa = (ref: RefObject<HTMLDivElement>) => {
    const [w, setW] = useState<number>()
    const [h, setH] = useState<number>()

    useEffect(() => {
        if (!ref.current) return

        const resizeObserver = new ResizeObserver(() => {
            if (ref.current!.offsetWidth !== w) {
                setW(ref.current!.offsetWidth)
            }
            if (ref.current!.offsetHeight !== h) {
                setH(ref.current!.offsetHeight)
            }
        })

        resizeObserver.observe(ref.current)

        return function cleanup() {
            resizeObserver.disconnect()
        }
    }, [])

    return { w, h }
}
