import { useRef, useState } from 'react';
import NewEnvInput from '../NewEnvInput/NewEnvInput'
import styles from './listitem.module.css'

import { GoPlusCircle } from "react-icons/go";
import { useClickWatcher } from '@renderer/hooks/useClickWatcher';
import { baseSocket } from '@renderer/service/socket';
import { BsDot } from "react-icons/bs";

type ListItemProps = {
    editable?: boolean
    envkey?: string
    envvalue?: string
    disabled?: boolean
    orderId: number
    terminalId: number
    selection: string
    onHighlight: (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    minimized?: boolean
}



function ListItem({ terminalId, onHighlight, editable = false, envkey, envvalue, minimized = false, orderId, selection, disabled = false }: ListItemProps) {

    const [newEnvOpen, setNewEnvOpen] = useState(false)
    const clickAwayRef = useRef<HTMLDivElement>(null)

    const { } = useClickWatcher(clickAwayRef, setNewEnvOpen)


    if (!envkey) return (
        <div className={`${styles.listItem} ${styles.newListPlaceholder}`}
            onClick={() => setNewEnvOpen(true)}
            ref={clickAwayRef}
        >
            {newEnvOpen ?
                <NewEnvInput terminalId={terminalId} style='key' orderId={orderId} onClose={() => setNewEnvOpen(false)} />
                :

                <GoPlusCircle color='var(--primary)' size={16} />}
        </div>
    )

    const handleClick = () => {
        baseSocket.emit('environmentMute', { id: terminalId, key: envkey, orderId })
    }

    return (
        <div
            className={`${styles.listItem}`}
            onClick={(e) => onHighlight(envkey, e)}
            onContextMenu={handleClick}
        >
            <div className={`${styles.env} ${minimized ? styles.minimized : ''}`}>
                <p>{envkey}</p>

                {minimized && disabled ?
                    <BsDot size={25} color='var(--primary-accent)'
                        className={styles.dot}
                    /> : null}
            </div>
            <div

                className={`${styles.value} 
                        ${selection === envkey ? styles.open : ''} 
                        ${editable ? styles.noHover : ''}
                        ${disabled ? styles.disabled : ''}
                        ${minimized ? styles.minimized : ''}
                        `}>
                {editable ?
                    <NewEnvInput
                        envKey={envkey}
                        envvalue={envvalue}
                        terminalId={terminalId}
                        orderId={orderId} />
                    : envvalue}
            </div>

        </div>
    )
}

export default ListItem