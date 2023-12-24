import { useEffect, useState } from 'react'
import styles from './detailheader.module.css'
import { baseSocket } from '@renderer/service/socket'
import { ExtendedCmd } from 'src/types'

type DetailHeaderProps = {
    selected: number
    engines: ExtendedCmd | null
}

type Status = {
    id: number
    isRunning: boolean
    env: any
}



function DetailHeader({ selected, engines }: DetailHeaderProps) {

    const [status, setStatus] = useState<Status | null>(null)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== engines?.get(selected)?.id) return
            setStatus(d)
            console.log(d)
        })
        baseSocket.emit('hello')

    }, [selected])


    const titles = [
        "OS Level",
        "Parameter Level",
        "Command Level",
        "Dynamic"
    ]

    return (
        <div className={styles.main}>

            <div className={styles.level}>
                <div className={styles.title}>{titles[0]}</div>
                <div className={styles.body}>
                    {status ? Object.keys(status.env).map((e: any) => (
                        <>
                            <div className={styles.listItem}>
                                <div className={styles.env}>{e}</div>
                                <div className={styles.env}></div>
                                <div className={styles.env}>{status.env[e].slice(0, 20)}</div>
                            </div>

                        </>
                    )) : 'No env found'}
                </div>
            </div>
            <div className={styles.level}>
                <div className={styles.title}>{titles[1]}</div>
            </div>
            <div className={styles.level}>
                <div className={styles.title}>{titles[2]}</div>
            </div>
            {/* <div className={styles.level}>
                <div className={styles.title}>{titles[3]}</div>
            </div> */}

        </div>
    )
}

export default DetailHeader