import { baseSocket } from '@renderer/service/socket';
import { Status } from '../DetailHeader/DetailHeader';
import styles from './envlist.module.css'
import ListItem from './ListItem/ListItem';


type EnvListProps = {
    data: Status['env'][0]
    className?: 'highlighted' | ''
    onSelection: (e: string[]) => void
    selectedKey?: string,
    editable?: boolean
    terminalId: number
}



function EnvList({ data, onSelection, selectedKey, terminalId, editable = false, className = '' }: EnvListProps) {


    const handleClik = (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return
        onSelection([key, data.pairs[key]])
    }

    const handleMute = () => {
        baseSocket.emit('environmentMute', { id: terminalId, orderId: data.order })
    }

    console.log(data)
    return (

        <div className={`${styles.wrapper} ${styles[className]}`}>
            <div className={styles.header}>
                <span>{data.title}</span>
                <div className={styles.listActions}>
                    <ul>
                        <li>Minimize</li>
                        <li
                            onClick={handleMute}
                            className={`${(Object.keys(data.pairs).length === data.disabled.length)
                                ? styles.muteButtonActive : ''}`}
                        >Disable</li>
                    </ul>
                </div>
            </div>
            <div className={styles.body}>
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