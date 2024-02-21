import { useEffect, useRef, useState } from 'react'
import { ClientEvents, Status, UtilityEvents } from '@t'
import EnvList from '../Common/EnvList'
import { NewEnvList } from '../Dialogs/NewEnvList'
import { Badge } from '@renderer/@/ui/badge'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type DetailHeaderProps = {
    stackId: string
    terminalId: string
    terminal: TerminalUIEngine | undefined
}

function DetailHeader({ terminal }: DetailHeaderProps) {
    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!terminal) return
        terminal.socket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            setStatus(d)
        })
        terminal.socket.emit(UtilityEvents.STATE, {
            stack: terminal.stackId,
            terminal: terminal.terminalId
        })

        if (status && status.stackId !== terminal.stackId) setStatus(null)
    }, [terminal])

    const handleHighligt = (e: string[]) => {
        if (e[0] === highlightedEnv?.[0]) {
            setHighlightedEnv(null)
            return
        }
        // setHighlightedEnv(e)
    }

    const scroll = () => {
        setTimeout(() => {
            bodyRef.current!.scroll({ left: bodyRef.current!.scrollWidth, behavior: 'smooth' })
        }, 290)
    }

    if (!terminal) return null

    return (
        <div className="h-full px-5">
            <div className="">
                {highlightedEnv ? (
                    <Badge className="text-md">{`${highlightedEnv[0]}=${highlightedEnv[1]}`}</Badge>
                ) : null}
            </div>
            <div className="flex gap-8 pb-24 h-full overflow-auto pr-32" ref={bodyRef}>
                {status?.cmd.command.env
                    ? status.cmd.command.env.map((record) => (
                        <EnvList
                            data={record}
                            key={record.title}
                            onSelection={handleHighligt}
                            terminalId={terminal.terminalId}
                            stackId={terminal.stackId}
                            highlight={highlightedEnv}
                        />
                    ))
                    : null}
                <div className="p-11">
                    <NewEnvList
                        scroll={scroll}
                        terminal={terminal}
                    />
                </div>
            </div>
        </div>
    )
}

export default DetailHeader
