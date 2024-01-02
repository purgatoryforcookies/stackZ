import { useEffect, useRef, useState } from 'react'
import styles from './detailheader.module.css'
import { baseSocket } from '@renderer/service/socket'
import { ExtendedCmd } from 'src/types'
import EnvList from '../Common/EnvList/EnvList'
import NewEnvList from '../Common/NewEnvList/NewEnvList'

type DetailHeaderProps = {
    selected: number
    engines: ExtendedCmd | null
}

export type Status = {
    id: number
    isRunning: boolean
    env: [
        {
            title: string,
            pairs: Record<string, string>,
            order: number,
            disabled: string[]
        }
    ],
    cmd: string,
    cwd: string
}



function DetailHeader({ selected, engines }: DetailHeaderProps) {

    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== engines?.get(selected)?.id) return
            setStatus(d)
        })
        baseSocket.emit('state', selected)

    }, [selected])

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
        <div className={styles.main} >
            <div className={styles.container} ref={bodyRef}>

                {status?.env ? status.env.map((record) => (

                    <EnvList
                        data={record}
                        key={record.title}
                        onSelection={handleHighligt}
                        terminalId={selected}
                    />

                )) : null}
                <NewEnvList scroll={scroll} />

            </div>

            <div className={styles.footer}>
                <div className={`${styles.highlightedEnv} ${!highlightedEnv ? styles.hidden : ''}`}>
                    {highlightedEnv ? <>{highlightedEnv[0]}={highlightedEnv[1]} </> : null}
                </div>
                <div className={`${styles.command} ${status ? '' : styles.hidden}`} >
                    <p>
                        {status?.cmd}

                    </p>

                    <p>
                        @
                        {status?.cwd}
                    </p>
                </div>
            </div>

        </div>
    )
}

export default DetailHeader