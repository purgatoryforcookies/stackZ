import { baseSocket } from '@renderer/service/socket';
import { Status } from '../../DetailHeader/DetailHeader';
import styles from './envlist.module.css'
import ListItem from '../ListItem/ListItem';
import { useState } from 'react';
import { BsDot } from 'react-icons/bs';
import { AiOutlineDelete } from "react-icons/ai";


type EnvListProps = {
    data: Status['env'][0]
    className?: 'highlighted' | ''
    onSelection: (e: string[]) => void
    selectedKey?: string,
    terminalId: number
}



function EnvList({ data, onSelection, selectedKey, terminalId, className = '' }: EnvListProps) {

    const [minimized, setMinimized] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)

    const handleClik = (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return
        onSelection([key, data.pairs[key]])
    }

    const handleMute = () => {
        baseSocket.emit('environmentMute', { id: terminalId, orderId: data.order })
    }

    const handleMinimize = () => {
        if (!minimized) {
            setMinimized(true)
        }
        if (minimized && !hidden) {
            setHidden(true)
        }
        if (minimized && hidden) {
            setHidden(false)
            setMinimized(false)
        }
    }

    const handleDelete = () => {
        baseSocket.emit('environmentDelete', { id: terminalId, orderId: data.order })
    }


    return (

        <div className={`${styles.wrapper} 
        ${className ? styles[className] : ''} 
        ${minimized ? styles.minimized : ''}
        ${hidden ? styles.hidden : ''}`}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <span>{data.title !== '' ? data.title : "Unnamed"}</span>
                </div>

                <div className={styles.listActions}>
                    <ul>
                        <li
                            onClick={handleMinimize}
                            className={`${minimized
                                ? styles.muteButtonActive : ''}`}>
                            Minimize
                        </li>
                        <li
                            onClick={handleMute}
                            className={`${(Object.keys(data.pairs).length === data.disabled.length)
                                ? styles.muteButtonActive : ''}`}>
                            Disable
                        </li>
                        {!minimized && !hidden ?
                            <>
                                <li
                                    onClick={() => setEditMode(!editMode)}
                                    className={editMode ? styles.muteButtonActive : ''}>
                                    Edit
                                </li>
                                {editMode ? <li
                                    onClick={handleDelete}
                                    className={`${styles.excludedButton} ${styles.removeBtn}`}
                                >
                                    <AiOutlineDelete size={18} />
                                </li> : null}
                            </> : null}
                    </ul>
                </div>
            </div>
            <div className={`${styles.variablecount} ${!hidden ? styles.hidden : ''}`}>
                <span>

                    {(Object.keys(data.pairs).length)} variables
                </span>
                <span>
                    {data.disabled.length > 0 ? <BsDot size={20} color='var(--primary-accent)' className={styles.dot} /> : null}
                    {data.disabled.length} disabled
                </span>
            </div>
            <div className={`${styles.body} ${hidden ? styles.hidden : ''} `}>
                {data.pairs ? Object.keys(data.pairs).map((key: string) => (
                    <ListItem
                        terminalId={terminalId}
                        onHighlight={handleClik}
                        selection={selectedKey || ''}
                        envkey={key}
                        envvalue={data.pairs[key]}
                        editable={editMode}
                        orderId={data.order}
                        disabled={data.disabled.includes(key)}
                        key={key}
                        minimized={minimized}
                    />

                )) : null}
                {editMode ?
                    <ListItem
                        terminalId={terminalId}
                        onHighlight={handleClik}
                        selection={selectedKey || ''}
                        orderId={data.order}
                    /> : null}


            </div>
        </div>

    )
}

export default EnvList