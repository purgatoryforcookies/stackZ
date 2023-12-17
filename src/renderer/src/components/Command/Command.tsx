import { EnginedCmd, TerminalInvokes } from '../../../../types'
import styles from './command.module.css'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'



type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: TerminalInvokes) => void
}


function Command({ data, handleClick }: CommandProps) {

    const [status, setStatus] = useState<boolean>(false)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== data.id) return
            setStatus(d.isRunning)
        })

        return () => {
            baseSocket.off("terminalState")
        }
    }, [])

    const handleState = async () => {
        if (status) {
            console.log(await window.api.stopTerminal(data.id))
            return
        }
        console.log(await window.api.startTerminal(data.id))
    }

    return (
        <div className={styles.commandItem} >
            <div className={styles.status}></div>
            <div className={styles.code}
                onClick={() => handleClick(data.id, TerminalInvokes.CONN)}>
                {data.command.cmd}
            </div>
            <div className={styles.invoke} onClick={() => handleState()}>
                {status ? "Stop" : "Start"}
            </div>
        </div>
    )
}

export default Command