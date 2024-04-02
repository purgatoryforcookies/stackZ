import { useEffect, useRef, useState } from 'react'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { Input } from '@renderer/@/ui/input'
import { useTaalasmaa } from '@renderer/hooks/useTaalasmaa'
import { CaretLeftIcon } from '@radix-ui/react-icons'

type TerminalUIProps = {
    engine: TerminalUIEngine | undefined
}

function TerminalUI({ engine }: TerminalUIProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const [search, setSearch] = useState<string>('')
    const [searchOpen, setSearchOpen] = useState<boolean>(false)

    const { w, h } = useTaalasmaa(terminalRef)

    useEffect(() => {
        if (terminalRef.current) {
            if (!engine) return
            engine.attachTo(terminalRef.current)
        }
        return () => engine?.detach()
    }, [engine])

    useEffect(() => {
        if (engine) engine.resize()
    }, [w, h])

    const findNext = () => {
        if (engine) engine.search(search)
    }

    return (
        <>
            <form
                action="submit"
                onSubmit={(e) => {
                    e.preventDefault(), findNext()
                }}
                className='absolute top-1 right-1 z-10'
            >
                <CaretLeftIcon className="absolute top-2 right-1 size-5 z-10 text-white hover:cursor-pointer"
                    onClick={() => setSearchOpen(!searchOpen)} />
                <Input
                    type="text"
                    className={`text-white truncate transition-width duration-500 ease-in-out backdrop-blur-lg ${searchOpen ? 'w-[1rem]' : 'w-[20rem]'}`}
                    placeholder="Highlight..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => {
                        if (engine && search.length === 0) engine.blurSearch()
                    }}
                />
                <button hidden formAction="submit"></button>
            </form>
            <div ref={terminalRef} className="h-full overflow-hidden" />
        </>
    )
}

export default TerminalUI
