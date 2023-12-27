import { useEffect, useState } from 'react'
import styles from './detailheader.module.css'
import { baseSocket } from '@renderer/service/socket'
import { ExtendedCmd } from 'src/types'
import EnvList from '../Common/EnvList'

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


    return (
        <div className={styles.main}>
            <div className={styles.container}>

                {status?.env ? status.env.map((record) => (

                    <EnvList
                        data={record}
                        key={record.title}
                        onSelection={handleHighligt}
                        selectedKey={highlightedEnv?.[0]}
                        editable={record.title === 'Variables'}
                        terminalId={selected}

                    />

                )) : null}

            </div>

            <div className={styles.footer}>
                <div className={`${styles.highlightedEnv} ${!highlightedEnv ? styles.hidden : ''}`}>
                    {highlightedEnv ? <>{highlightedEnv[0]}={highlightedEnv[1]} </> : null}
                </div>
                <div className={`${styles.command} ${status ? '' : styles.hidden}`} >
                    {status?.cmd}
                </div>
            </div>

        </div>
    )
}

export default DetailHeader