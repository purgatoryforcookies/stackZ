import { useEffect, useRef, useState } from 'react'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { Input } from '@renderer/@/ui/input'

type TerminalUIProps = {
    engine: TerminalUIEngine | undefined
}

function TerminalUI({ engine }: TerminalUIProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const [search, setSearch] = useState<string>('')


    useEffect(() => {
        if (terminalRef.current) {
            if (!engine) return
            engine.attachTo(terminalRef.current)
        }
    }, [engine])

    const findNext = () => {
        if (engine) engine.search(search)
    }

    return <>
        <form action="submit" onSubmit={(e) => { e.preventDefault(), findNext() }}>
            <Input type='text'
                className='text-white absolute top-1 right-1 z-10 w-[30rem] w-max[20rem]:hidden'
                placeholder='Highlight...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => { if (engine && search.length === 0) engine.blurSearch() }}

            />
            <button hidden formAction='submit'></button>
        </form>
        <div ref={terminalRef} className="h-full overflow-hidden" />
    </>
}

export default TerminalUI
