import { useEffect, useRef, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { Status } from 'src/types'
import EnvList from '../Common/EnvList'
import { NewEnvList } from '../Dialogs/NewEnvList'

type DetailHeaderProps = {
    stackId: string
    terminalId: number
}

function DetailHeader({ stackId, terminalId }: DetailHeaderProps) {
    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        baseSocket.on('terminalState', (d: Exclude<Status, undefined>) => {
            if (stackId !== d.stackId || terminalId !== d.cmd.id) return
            setStatus(d)
        })
        baseSocket.emit('state', { stack: stackId, terminal: terminalId })

        if (status && status.stackId !== stackId) setStatus(null)
    }, [stackId, terminalId])

    const handleHighligt = (e: string[]) => {
        if (e[0] === highlightedEnv?.[0]) {
            setHighlightedEnv(null)
            return
        }
        setHighlightedEnv(e)
    }

    const scroll = () => {
        setTimeout(() => {
            bodyRef.current!.scroll({ left: bodyRef.current!.scrollWidth, behavior: 'smooth' })
        }, 290)
    }

    return (
        <div className="h-full px-5">
            <div className="flex gap-8 pb-20 h-full overflow-auto pr-32" ref={bodyRef}>
                {status?.cmd.command.env
                    ? status.cmd.command.env.map((record) => (
                        <EnvList
                            data={record}
                            key={record.title}
                            onSelection={handleHighligt}
                            terminalId={terminalId}
                            stackId={stackId}
                        />
                    ))
                    : null}
                <div className="p-11">
                    <NewEnvList scroll={scroll} terminalId={terminalId} stackId={stackId} />
                </div>
            </div>
        </div>
    )
}

export default DetailHeader
