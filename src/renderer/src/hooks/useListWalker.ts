import { useEffect, useState } from "react"




/**
 * Hook for walking index from 0...n with arrowkeys.
 * Enter fires all the functions provided.
 * 
 * @param actions Array of void functions
 * @returns current index
 */
function useListWalker(...actions: ((...params: any[]) => void)[]) {

    const [index, setIndex] = useState(0)

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') setIndex(index > 0 ? index - 1 : 0)
        else if (e.key === 'ArrowDown') setIndex(index + 1)
        else if (e.key === 'Enter') {
            actions?.forEach(act => act())
            setIndex(0)
        } else {
            setIndex(0)
        }

    }

    useEffect(() => {

        document.addEventListener('keyup', handleKeyPress, true)

        return () => document.removeEventListener('keyup', handleKeyPress)


    }, [index])


    return { index }
}

export default useListWalker