import { useEffect, useRef, useState } from 'react'
import { Status } from '@t'
import EnvList from '../Common/EnvList'
import { NewEnvList } from '../Dialogs/NewEnvList'
import { IUseStack } from '@renderer/hooks/useStack'
import { Separator } from '@renderer/@/ui/separator'

type DetailHeaderProps = {
    stack: IUseStack
}

function DetailHeader({ stack }: DetailHeaderProps) {
    const [status, setStatus] = useState<Status | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
        if (!terminal) return
        terminal.socket.on('terminalState', (d) => {
            setStatus(d)
        })
        terminal.socket.emit('state')

        if (status && status.stackId !== stack.selectedStack) setStatus(null)
    }, [stack])

    const scroll = () => {
        setTimeout(() => {
            bodyRef.current!.scroll({ left: bodyRef.current!.scrollWidth, behavior: 'smooth' })
        }, 290)
    }

    const terminal = stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)
    if (!terminal) return <p className="text-secondary-foreground">No terminal selected</p>

    return (
        <div className="flex gap-8 overflow-x-auto overflow-y-hidden h-full" ref={bodyRef}>
            {status?.stackEnv
                ? status.stackEnv
                      .sort((a, b) => a.order - b.order)
                      .map((record) => (
                          <EnvList
                              id={stack.selectedStack}
                              data={record}
                              key={record.title}
                              socket={terminal.socket}
                          />
                      ))
                : null}

            {status?.stackEnv ? (
                <div className="flex">
                    <p className="text-secondary-foreground/30 pr-2 text-[0.8rem] tracking-wide">
                        Stack
                    </p>
                    <Separator orientation="vertical" />
                    <p className="text-secondary-foreground/30 pl-2 text-[0.8rem] tracking-wide">
                        Terminal
                    </p>
                </div>
            ) : null}

            {status?.cmd.command.env
                ? status.cmd.command.env
                      .sort((a, b) => a.order - b.order)
                      .map((record) => (
                          <EnvList
                              id={stack.selectedTerminal}
                              data={record}
                              key={record.title}
                              socket={terminal.socket}
                          />
                      ))
                : null}

            <div className="p-11">
                <NewEnvList scroll={scroll} terminal={terminal} stack={stack} />
            </div>
        </div>
    )
}

export default DetailHeader
