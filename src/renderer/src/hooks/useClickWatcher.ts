import { useEffect } from 'react'

/**
 * Fires all the functions when user clicks outside
 * of the element ref pointed element.
 * @returns function for manual trigger
 */
export const useClickWatcher = (
    ref: React.RefObject<HTMLDivElement>,
    ...states: ((...params: unknown[]) => void)[]
) => {
    const dispatcher = () => {
        states.forEach((func) => {
            func()
        })
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as HTMLDivElement)) {
                if (document.activeElement !== ref.current) {
                    states.forEach((func) => {
                        func()
                    })
                }
            }
        }

        document.addEventListener('click', handleClickOutside, true)
        return () => {
            document.removeEventListener('click', handleClickOutside, true)
        }
    }, [ref])

    return { dispatcher } as const
}
