import { useEffect, Dispatch, SetStateAction } from 'react';


export const useClickWatcher = (ref: React.RefObject<HTMLElement>,
    ...states: Dispatch<SetStateAction<boolean>>[]) => {

    const stateCloser = () => {
        states.forEach((setState) => {
            setState(false)
        })
    }

    useEffect(() => {
        const handleClickOutside = (event: any) => {

            if (ref.current && !ref.current.contains(event.target as HTMLInputElement)) {
                states.forEach((setState) => {
                    setState(false)
                })

            }
        };

        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };


    }, [ref, states]);

    return { stateCloser } as const
}