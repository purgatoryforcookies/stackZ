import { useRef, useState } from 'react';
import NewEnvInput from '../NewEnvInput/NewEnvInput'
import styles from './listitem.module.css'

import { GoPlusCircle } from "react-icons/go";
import { useClickWatcher } from '@renderer/hooks/useClickWatcher';

type ListItemProps = {
    editable?: boolean
    envkey?: string
    envvalue?: string
    orderId: number
    terminalId: number
    selection: string
    onHighlight: (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}



function ListItem({ terminalId, onHighlight, editable = false, envkey, envvalue, orderId, selection }: ListItemProps) {

    const [newEnvOpen, setNewEnvOpen] = useState(false)
    const clickAwayRef = useRef<HTMLDivElement>(null)

    const { } = useClickWatcher(clickAwayRef, setNewEnvOpen)


    if (!envkey) return (
        <div className={`${styles.listItem} ${styles.newListPlaceholder}`}
            onClick={() => setNewEnvOpen(true)}
            ref={clickAwayRef}
        >
            {newEnvOpen ?
                <NewEnvInput terminalId={terminalId} style='key' orderId={orderId} />
                :

                <GoPlusCircle color='var(--primary)' size={16} />}
        </div>
    )




    return (
        <div className={styles.listItem} onClick={(e) => onHighlight(envkey, e)}>
            <div className={styles.env}>{envkey}</div>
            <div
                className={`${styles.value} 
                        ${selection === envkey ? styles.open : ''} 
                        ${editable ? styles.noHover : ''}`}>
                {editable ?
                    <NewEnvInput envKey={envkey} envvalue={envvalue} terminalId={terminalId} orderId={orderId} />
                    : envvalue}
            </div>

        </div>
    )
}

export default ListItem