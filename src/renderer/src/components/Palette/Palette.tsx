import { Cmd, ExtendedCmd, SelectionEvents } from 'src/types'
import Command from '../Command/Command'
import styles from './palette.module.css'
import NewCommand from '../Common/NewCommand/NewCommand'

type PaletteProps = {
    data: ExtendedCmd
    onClick: (id: number, method?: SelectionEvents) => void
    selected: number | null
    onModify: (cmd: Cmd) => void
}

function Palette({ data, onClick, selected, onModify }: PaletteProps) {


    return (
        <div className={styles.main}>
            <div className={styles.body}>
                {Array.from(data.values()).map((cmd) => {
                    return <Command key={cmd.id} data={cmd} handleClick={onClick} selected={selected} onRemove={onModify} />
                })}
                <NewCommand afterAdd={onModify} />
            </div>
        </div>
    )
}

export default Palette