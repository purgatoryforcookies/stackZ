import styles from './envlist.module.css'
import ListItem from './ListItem/ListItem';


type EnvListProps = {
    title: string
    pairs: Record<string, string>
    className?: 'highlighted' | ''
    onSelection: (e: string[]) => void
    selectedKey?: string,
    editable?: boolean
    terminalId: number
    orderId: number
}



function EnvList({ title, pairs, onSelection, selectedKey, terminalId, orderId, editable = false, className = '' }: EnvListProps) {


    const handleClik = (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return
        onSelection([key, pairs[key]])
    }


    return (

        <div className={`${styles.wrapper} ${styles[className]}`}>
            <div className={styles.header}>
                <span>{title}</span>
                <div className={styles.listActions}>
                    <ul>
                        <li>Minimize</li>
                        <li>Disable</li>
                    </ul>
                </div>
            </div>
            <div className={styles.body}>
                {pairs ? Object.keys(pairs).map((key: string) => (
                    <ListItem
                        terminalId={terminalId}
                        onHighlight={handleClik}
                        selection={selectedKey || ''}
                        envkey={key}
                        envvalue={pairs[key]}
                        editable={editable}
                        orderId={orderId}
                        key={key} />

                )) : null}
                {editable ?
                    <ListItem
                        terminalId={terminalId}
                        onHighlight={handleClik}
                        selection={selectedKey || ''}
                        orderId={orderId}
                    /> : null}


            </div>
        </div>

    )
}

export default EnvList