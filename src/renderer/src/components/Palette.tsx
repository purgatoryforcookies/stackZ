import { Cmd, PaletteStack, SelectionEvents } from '../../../types'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Common/NewCommand/NewCommand'
import Command from './Command/Command'

type PaletteProps = {
    data: Map<number, PaletteStack>
    onClick: (terminalId: number, stackId: number, method?: SelectionEvents, cb?: (...args: any) => void,) => void
    onModify: (cmd: Cmd) => void,
    terminalId: number,
    stackId: number
}

function Palette({ data, onClick, onModify, terminalId, stackId }: PaletteProps) {

    const [palette, setPalette] = useState<Cmd[]>()


    useEffect(() => {

        const filtered = data.get(stackId)?.palette
        if (!filtered) setPalette(undefined)
        setPalette(filtered)

    }, [stackId])

    return (
        <div className=''>

            <div className='flex gap-3 justify-center py-2'>
                {data && Array.from(data.values()).map((stack) => {
                    return <Badge
                        key={stack.id}
                        onClick={() => onClick(stack.id, 1, SelectionEvents.CONN)}
                        variant={stackId === stack.id ? 'default' : 'outline'}
                        className={`hover:bg-foreground hover:text-background hover:cursor-pointer`}>
                        {stack.stackName}
                    </Badge>
                })}
            </div>

            {palette ? palette.map((cmd) => {
                if (!cmd?.id) return null
                return <Command key={cmd.id} data={cmd} hostStack={stackId} handleClick={onClick} selected={terminalId} onRemove={onModify} />
            }) : null}
            <NewCommand afterAdd={onModify} stackId={stackId} />
        </div >
    )
}

export default Palette