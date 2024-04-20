import { useEffect } from 'react';

/**
 * Fires all the functions when user clicks outside
 * of the element ref pointed element. 
 * @returns function for manual trigger
 */
export const useClickWatcher = (ref: React.RefObject<HTMLDivElement>,
    ...states: ((...params: any[]) => void)[]) => {

    const dispatcher = () => {
        states.forEach(func => {
            func()
        })
    }

    useEffect(() => {
        const handleClickOutside = (event: any) => {

            if (ref.current && !ref.current.contains(event.target as HTMLDivElement)) {
                if (document.activeElement !== ref.current)
                    states.forEach(func => {
                        func()
                    })
            }
        };

        document.addEventListener('click', handleClickOutside, false);
        return () => {
            document.removeEventListener('click', handleClickOutside, false);
        };

    }, [ref, states]);

    return { dispatcher } as const
}