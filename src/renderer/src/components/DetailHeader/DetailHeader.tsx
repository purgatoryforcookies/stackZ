import { useEffect, useRef, useState } from 'react'
import { ClientEvents, Status, UtilityEvents } from '@t'
import EnvList from '../Common/EnvList'
import { NewEnvList } from '../Dialogs/NewEnvList'
import { IUseStack } from '@renderer/hooks/useStack'

type DetailHeaderProps = {
    stack: IUseStack
}

function DetailHeader({ stack }: DetailHeaderProps) {
    const [status, setStatus] = useState<Status | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
        if (!terminal) return
        terminal.socket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            setStatus(d)
        })
        terminal.socket.emit(UtilityEvents.STATE)

        if (status && status.stackId !== stack.selectedStack) setStatus(null)
    }, [stack])


    const scroll = () => {
        setTimeout(() => {
            bodyRef.current!.scroll({ left: bodyRef.current!.scrollWidth, behavior: 'smooth' })
        }, 290)
    }

    const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
    if (!terminal) return <p>Error</p>

    return (
        <div className="flex gap-8 pb-16 pr-10 h-full" ref={bodyRef}>
            {status?.cmd.command.env
                ? status.cmd.command.env.map((record) => (
                    <EnvList
                        data={record}
                        key={record.title}
                        terminal={terminal}
                    />
                ))
                : null}
            <div className="p-11">
                <NewEnvList scroll={scroll} terminal={terminal} />
            </div>
        </div>
    )
}

export default DetailHeader
