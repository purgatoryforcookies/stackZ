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
    env: {
        host: Record<string, string>
        fromJson: Record<string, string>,
        variables: Record<string, string>
    },
    cmd: string
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
            <div className={styles.container}>



                <div className={styles.level}>
                    <div className={styles.title}>{titles[0]}</div>
                    <div className={styles.body}>
                        {status ? Object.keys(status.env.host).map((e: any) => (
                            <div className={styles.listItem}>
                                <div className={styles.env}>{e}</div>
                                <div className={styles.value}>{status.env.host[e]}</div>
                            </div>

                        )) : 'No env found'}
                    </div>
                </div>
                <div className={styles.level}>
                    <div className={styles.title}>{titles[1]}</div>
                    <div className={styles.body}>
                        {status?.env.fromJson ? Object.keys(status.env.fromJson).map((e: any) => (
                            <div className={styles.listItem}>
                                <div className={styles.env}>{e}</div>
                                <div className={styles.value}>{status.env.fromJson[e]}</div>
                            </div>

                        )) : 'No env found'}
                    </div>
                </div>
                <div className={styles.level}>
                    <div className={styles.title}>{titles[2]}</div>
                    <div className={styles.body}>
                        {status?.env.variables ? Object.keys(status.env.variables).map((e: any) => (
                            <div className={styles.listItem}>
                                <div className={styles.env}>{e}</div>
                                <div className={styles.value}>{status.env.variables[e]}</div>
                            </div>

                        )) : 'No env found'}
                    </div>
                </div>
                {/* <div className={styles.level}>
                <div className={styles.title}>{titles[3]}</div>
            </div> */}

            </div>
            <div className={styles.footer}>
                {status?.cmd}
            </div>

        </div>
    )
}

export default DetailHeader