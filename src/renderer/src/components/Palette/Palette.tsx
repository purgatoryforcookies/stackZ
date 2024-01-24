import { Cmd, ExtendedCmd, SelectionEvents } from 'src/types'
import Command from '../Command/Command'
import NewCommand from '../Common/NewCommand/NewCommand'

type PaletteProps = {
    data: ExtendedCmd
    onClick: (id: number, method?: SelectionEvents, cb?: (...args: any) => void,) => void
    selected: number | null
    onModify: (cmd: Cmd) => void
}

function Palette({ data, onClick, selected, onModify }: PaletteProps) {


    return (
        <div className=''>
            {Array.from(data.values()).map((cmd) => {
                return <Command key={cmd.id} data={cmd} handleClick={onClick} selected={selected} onRemove={onModify} />
            })}
            <NewCommand afterAdd={onModify} />
        </div>
    )
}

export default Palette