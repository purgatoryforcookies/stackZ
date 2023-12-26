import { baseSocket } from '@renderer/service/socket';
import { Status } from '../DetailHeader/DetailHeader';
import styles from './envlist.module.css'
import ListItem from './ListItem/ListItem';
import { useState } from 'react';


type EnvListProps = {
    data: Status['env'][0]
    className?: 'highlighted' | ''
    onSelection: (e: string[]) => void
    selectedKey?: string,
    editable?: boolean
    terminalId: number
}



function EnvList({ data, onSelection, selectedKey, terminalId, editable = false, className = '' }: EnvListProps) {

    const [minimized, setMinimized] = useState<boolean>(true)
    const [hidden, setHidden] = useState<boolean>(false)

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

    return (

        <div className={`${styles.wrapper} 
        ${styles[className]} 
        ${minimized ? styles.minimized : ''}`}>
            <div className={styles.header}>
                <span>{data.title}</span>
                <div className={styles.listActions}>
                    <ul>
                        <li
                            onClick={handleMinimize}
                            className={`${minimized
                                ? styles.muteButtonActive : ''}`}
                        >Minimize</li>
                        <li
                            onClick={handleMute}
                            className={`${(Object.keys(data.pairs).length === data.disabled.length)
                                ? styles.muteButtonActive : ''}`}
                        >Disable</li>
                    </ul>
                </div>
            </div>
            <div className={`${styles.variablecount} ${!hidden ? styles.hidden : ''}`}>{(Object.keys(data.pairs).length)} variables</div>
            <div className={`${styles.body} ${hidden ? styles.hidden : ''}`}>
                {data.pairs ? Object.keys(data.pairs).map((key: string) => (
                    <ListItem
                        terminalId={terminalId}
                        onHighlight={handleClik}
                        selection={selectedKey || ''}
                        envkey={key}
                        envvalue={data.pairs[key]}
                        editable={editable}
                        orderId={data.order}
                        disabled={data.disabled.includes(key)}
                        key={key} />

                )) : null}
                {editable ?
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