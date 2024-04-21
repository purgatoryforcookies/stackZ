import { useState } from 'react'

/**
 * Hook for walking a list infinitely with arrow, pgup/pdgown, tab keys.
 * Enter fires all the functions provided.
 *
 * @param list Array of elements
 * @param offset Offsets the current element selected
 * @param actions Array of void functions
 * @returns Infinity index normalized to the list
 * @returns function for input element
 * @returns Infinity list getter
 * @returns Normalized offset which takes into account short lists
 */
function useListWalker<T>(
    list: T[],
    offset: number,
    ...actions: ((...params: unknown[]) => void)[]
) {
    const [index, setIndex] = useState(0)

    const LIST_OFFSET = list.length > offset ? offset : 0

    const limit = list.length

    const infiniteIndex =
        index + LIST_OFFSET > limit - 1 ? index + LIST_OFFSET - limit : index + LIST_OFFSET

    const infinityList = () => {
        return [...list.slice(index), ...list.slice(0, index)]
    }

    const update = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault()
                setIndex(index > 0 ? index - 1 : limit - 1)
                break
            case 'ArrowDown':
                setIndex(index >= limit - 1 ? 0 : index + 1)
                break
            case 'Tab':
                if (list.length > 0) e.preventDefault()
                setIndex(index >= limit - 1 ? 0 : index + 1)
                break
            case 'PageUp':
                setIndex(index > 3 ? index - 3 : limit - 1)
                break
            case 'PageDown':
                setIndex(index >= limit - 1 ? 0 : index + 3)
                break
            case 'Enter':
                actions?.forEach((act) => act())
                break
            default:
                setIndex(0)
        }
    }

    return { infiniteIndex, update, infinityList, OFFSET: LIST_OFFSET }
}

export default useListWalker
