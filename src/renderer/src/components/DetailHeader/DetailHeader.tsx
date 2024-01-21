import { useEffect, useRef, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { EnginedCmd, Status } from 'src/types'
import EnvList from '../Common/EnvList'
import NewEnvList from '../Common/NewEnvList'

type DetailHeaderProps = {
    engine: EnginedCmd
}




function DetailHeader({ engine }: DetailHeaderProps) {

    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        baseSocket.on("terminalState", (d: Status) => {
            if (d.cmd.id !== engine.id) return
            setStatus(d)
        })
        baseSocket.emit('state', engine.id)

    }, [engine])

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
        }, 290);
    }


    return (
        <div className='overflow-y-auto overflox-x-hidden' >
            <div className='flex gap-8' ref={bodyRef}>

                {status?.cmd.command.env ? status.cmd.command.env.map((record) => (

                    <EnvList
                        data={record}
                        key={record.title}
                        onSelection={handleHighligt}
                        terminalId={engine.id}
                    />

                )) : null}
                <NewEnvList scroll={scroll} />

            </div>
        </div>
    )
}

export default DetailHeader