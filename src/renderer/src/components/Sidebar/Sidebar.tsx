import { ExtendedCmd, TerminalInvokes } from 'src/types'
import Command from '../Command/Command'
import styles from './sidebar.module.css'

type SidebarProps = {
    data: ExtendedCmd
    onClick: (id: number, method?: TerminalInvokes) => void
}

function Sidebar({ data, onClick }: SidebarProps) {


    return (
        <div className={styles.main}>
            <div className={styles.header}>
                <h2>Palette</h2>
            </div>
            <div className={styles.body}>
                {Array.from(data.values()).map((cmd) => {
                    return <Command key={cmd.id} data={cmd} handleClick={onClick} />
                })}
            </div>
        </div>
    )
}

export default Sidebar