import { useEffect, useRef } from 'react'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type TerminalUIProps = {
    engine: TerminalUIEngine | undefined
}

function TerminalUI({ engine }: TerminalUIProps) {
    const terminalRef = useRef(null)

    useEffect(() => {
        if (terminalRef.current) {
            if (!engine) return
            engine.attachTo(terminalRef.current)
        }
    }, [engine])

    return <div ref={terminalRef} className="h-full overflow-hidden" />
}

export default TerminalUI
