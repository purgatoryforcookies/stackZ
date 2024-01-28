import { Cmd, PaletteStack, SelectionEvents } from 'src/types'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Common/NewCommand/NewCommand'
import Command from './Command/Command'

type PaletteProps = {
    data: PaletteStack[]
    onClick: (terminalId: number, stackId: number, method?: SelectionEvents, cb?: (...args: any) => void,) => void
    onModify: (cmd: Cmd) => void,
    stackId: number,
    terminalId: number
}

function Palette({ data, onClick, onModify, stackId, terminalId }: PaletteProps) {

    const [selected, setSelected] = useState<number>(1)
    const [palette, setPalette] = useState<Cmd[]>()

    useEffect(() => {

        const filtered = data.filter(k => k.id === selected)[0].palette
        setPalette(filtered)

    }, [selected])

    return (
        <div className=''>

            <div className='flex gap-3 justify-center py-2'>
                {data ? data.map((stack) => (
                    <Badge
                        key={stack.id}
                        onClick={() => setSelected(stack.id)}
                        variant={selected === stack.id ? 'default' : 'outline'}
                        className={`hover:bg-foreground hover:text-background hover:cursor-pointer`}>
                        {stack.stackName}
                    </Badge>
                )) : null}
            </div>

            {palette ? palette.map((cmd) => {
                if (!cmd?.id) return null
                return <Command key={cmd.id} data={cmd} hostStack={stackId} handleClick={onClick} selected={terminalId} onRemove={onModify} />
            }) : null}
            <NewCommand afterAdd={onModify} />
        </div >
    )
}

export default Palette