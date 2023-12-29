import { ExtendedCmd, SelectionEvents } from 'src/types'
import Command from '../Command/Command'
import styles from './palette.module.css'

type PaletteProps = {
    data: ExtendedCmd
    onClick: (id: number, method?: SelectionEvents) => void
    selected: number | null
}

function Palette({ data, onClick, selected }: PaletteProps) {


    return (
        <div className={styles.main}>
            <div className={styles.body}>
                {Array.from(data.values()).map((cmd) => {
                    return <Command key={cmd.id} data={cmd} handleClick={onClick} selected={selected} />
                })}
            </div>
        </div>
    )
}

export default Palette