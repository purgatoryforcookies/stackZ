import { EnginedCmd, SelectionEvents } from '../../../../types'
import styles from './command.module.css'
import { useEffect, useRef, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { Status } from '../DetailHeader/DetailHeader';

type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: SelectionEvents) => void
    selected: number | null
    onRemove: (cmd: EnginedCmd) => void
}


function Command({ data, handleClick, selected }: CommandProps) {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [ping, setPing] = useState<Status>()
    const pathRef = useRef<HTMLInputElement | null>(null)

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

    const handleCwdChange = (e) => {
        baseSocket.emit("changeCwd", { id: data.id, value: e.target.files[0].path })
    }

    const handleExpand = () => {
        setExpanded(!expanded)
        handleClick(data.id, SelectionEvents.EXPAND)
    }


    return (
        <div className={`
        ${styles.commandItem} 
        ${selected === data.id ? styles.selected : ''}
        ${expanded ? styles.expanded : ''}
        `} >
            <div className={styles.status}>
                {ping?.isRunning ? <span className={styles.loader}></span> : <ListIcon size={15} onClick={handleExpand} className={styles.dropDown} />}
            </div>
            <div className={styles.code}
                onClick={() => handleClick(data.id, SelectionEvents.CONN)}>
                {data.command.cmd}
            </div>
            <div className={styles.invoke} onClick={handleState}>
                {ping?.isRunning ? "Stop" : "Start"}
            </div>
            {expanded ? <div className={styles.expandedMenu} >
                <div className={styles.expandedMenuRow}>
                    <p>cwd:</p>
                    <p>{ping?.cwd}</p>
                    <div onClick={() => pathRef.current!.click()} className={styles.changeBtn}>Change</div>
                    {/* @ts-ignore */}
                    <input type="file" style={{ display: 'none' }} ref={pathRef} onChange={handleCwdChange} webkitdirectory="" />
                </div>
            </div> : null}
        </div>
    )
}

export default Command