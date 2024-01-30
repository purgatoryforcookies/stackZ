import { Cmd, PaletteStack, SelectionEvents, StackStatus } from '../../../types'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Common/NewCommand'
import Command from './Command/Command'
import { Button } from '@renderer/@/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { baseSocket } from '@renderer/service/socket'

type PaletteProps = {
    data: Map<number, PaletteStack>
    onClick: (terminalId: number, stackId: number, method?: SelectionEvents, cb?: (...args: any) => void,) => void
    onModify: (cmd: Cmd) => void,
    terminalId: number,
    stackId: number
}

function Palette({ data, onClick, onModify, terminalId, stackId }: PaletteProps) {

    const [palette, setPalette] = useState<Cmd[]>()
    const [stackState, setStackState] = useState<StackStatus['state']>([])


    useEffect(() => {

        baseSocket.on("stackState", (d: StackStatus) => {
            if (d.stack !== stackId) return
            setStackState(d.state)
        })
        baseSocket.emit('bigState', { stack: stackId })

    }, [stackId, terminalId])

    const toggleStack = () => {
        if (stackState.some(term => term.running)) {
            window.api.stopStack(stackId)
        } else {
            window.api.startStack(stackId)
        }
        baseSocket.emit('bigState', { stack: stackId })
    }


    useEffect(() => {

        const filtered = data.get(stackId)?.palette
        if (!filtered) setPalette(undefined)
        setPalette(filtered)

    }, [stackId, data])

    return (
        <div className=''>

            <div className='flex gap-3 justify-center py-2'>
                {data && Array.from(data.values()).map((stack) => {
                    return <Badge
                        key={stack.id}
                        onClick={() => onClick(stack.id, 1, SelectionEvents.CONN)}
                        variant={stackId === stack.id ? 'default' : 'outline'}
                        className={`hover:bg-primary hover:text-background 
                        hover:cursor-pointer`}>
                        {stack.stackName}
                    </Badge>
                })}

            </div>
            <div className='flex w-full justify-end pr-12'>
                <Button variant={'link'} size={'sm'} onClick={toggleStack}>
                    {stackState?.some(term => term.running === true) ? <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                    </> : 'Start stack'
                    }
                </Button>
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