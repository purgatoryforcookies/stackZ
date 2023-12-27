import { EnginedCmd, TerminalInvokes } from '../../../../types'
import styles from './command.module.css'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { Status } from '../DetailHeader/DetailHeader';

type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: TerminalInvokes) => void
    selected: number | null
}


function Command({ data, handleClick, selected }: CommandProps) {

    const [expanded, setExpanded] = useState<boolean>(true)
    const [ping, setPing] = useState<Status>()

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== data.id) return
            setPing(d)
        })

    }, [])

    const handleState = async () => {
        if (ping?.isRunning) {
            window.api.stopTerminal(data.id)
            return
        }
        window.api.startTerminal(data.id)
    }

    const ListIcon = (props: any) => {
        if (expanded) {
            return <BsChevronDown {...props} />
        }
        return <BsChevronRight {...props} />
    }

    return (
        <div className={`
        ${styles.commandItem} 
        ${selected === data.id ? styles.selected : ''}
        ${expanded ? styles.expanded : ''}
        `} >
            <div className={styles.status}>
                {ping?.isRunning ? <span className={styles.loader}></span> : <ListIcon size={15} onClick={() => setExpanded(!expanded)} className={styles.dropDown} />}
            </div>
            <div className={styles.code}
                onClick={() => handleClick(data.id, TerminalInvokes.CONN)}>
                {data.command.cmd}
            </div>
            <div className={styles.invoke} onClick={handleState}>
                {ping?.isRunning ? "Stop" : "Start"}
            </div>
            {expanded ? <div className={styles.expandedMenu}>
                <div className={styles.expandedMenuRow}>
                    <p>CWD:</p>
                    <p>{ping?.cwd}</p>
                </div>
            </div> : null}
        </div>
    )
}

export default Command