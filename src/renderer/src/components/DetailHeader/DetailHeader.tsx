import { useEffect, useRef, useState } from 'react'
import styles from './detailheader.module.css'
import { baseSocket } from '@renderer/service/socket'
import { EnginedCmd, Status } from 'src/types'
import EnvList from '../Common/EnvList/EnvList'
import NewEnvList from '../Common/NewEnvList/NewEnvList'

type DetailHeaderProps = {
    engine: EnginedCmd
}




function DetailHeader({ engine }: DetailHeaderProps) {

    const [status, setStatus] = useState<Status | null>(null)
    const [highlightedEnv, setHighlightedEnv] = useState<string[] | null>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== engine.id) return
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
        <div className={styles.main} >
            <div className={styles.container} ref={bodyRef}>

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

            <div className={styles.footer}>
                <div className={`${styles.highlightedEnv} ${!highlightedEnv ? styles.hidden : ''}`}>
                    {highlightedEnv ? <>{highlightedEnv[0]}={highlightedEnv[1]} </> : null}
                </div>
                <div className={`${styles.command} ${status ? '' : styles.hidden}`} >
                    <p>@{status?.cwd}</p>
                    <div className={styles.terminalLook}>
                        <p>
                            {status?.cmd?.command.cmd}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DetailHeader