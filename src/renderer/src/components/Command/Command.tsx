import { EnginedCmd, TerminalInvokes } from '../../../../types'
import styles from './command.module.css'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { CiAlignCenterH } from "react-icons/ci";

type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: TerminalInvokes) => void
    selected: number | null
}


function Command({ data, handleClick, selected }: CommandProps) {

    const [status, setStatus] = useState<boolean>(false)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== data.id) return
            setStatus(d.isRunning)
        })

    }, [])

    const handleState = async () => {
        if (status) {
            console.log(await window.api.stopTerminal(data.id))
            return
        }
        console.log(await window.api.startTerminal(data.id))
    }

    return (
        <div className={`${styles.commandItem} ${selected === data.id ? styles.selected : ''}`} >
            <div className={styles.status}>
                {status ? <span className={styles.loader}></span> : <CiAlignCenterH size={25} />}
            </div>
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