import { useEffect, useRef, useState } from 'react'
import { ClientEvents, Status, UtilityEvents } from '@t'
import EnvList from '../Common/EnvList'
import { NewEnvList } from '../Dialogs/NewEnvList'
import { Badge } from '@renderer/@/ui/badge'
import { IUseStack } from '@renderer/hooks/useStack'

type DetailHeaderProps = {
    stack: IUseStack
}

function DetailHeader({ stack }: DetailHeaderProps) {
    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
        if (!terminal) return
        terminal.socket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            setStatus(d)
        })
        terminal.socket.emit(UtilityEvents.STATE)

        if (status && status.stackId !== terminal.stackId) setStatus(null)

        return () => {
            terminal.socket.off(ClientEvents.TERMINALSTATE)
        }
    }, [stack])

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

    const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
    if (!terminal) return null

    return (
        <div className="h-full px-5">
            <div className="">
                {highlightedEnv ? (
                    <Badge className="text-md">{`${highlightedEnv[0]}=${highlightedEnv[1]}`}</Badge>
                ) : null}
            </div>
            <div className="flex gap-8 pb-16 h-full overflow-auto pr-32" ref={bodyRef}>
                {status?.cmd.command.env
                    ? status.cmd.command.env.map((record) => (
                          <EnvList
                              data={record}
                              key={record.title}
                              onSelection={handleHighligt}
                              terminal={terminal}
                              highlight={highlightedEnv}
                          />
                      ))
                    : null}
                <div className="p-11">
                    <NewEnvList scroll={scroll} terminal={terminal} />
                </div>
            </div>
        </div>
    )
}

export default DetailHeader
