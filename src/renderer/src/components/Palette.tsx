import { Cmd, PaletteStack, SelectionEvents, StackStatus, Status } from '../../../types'
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
    const [stackState, setStackState] = useState<StackStatus[]>()


    useEffect(() => {

        baseSocket.emit('stackState', { stack: stackId }, (resp: StackStatus[]) => {
            setStackState(resp)
        })
        baseSocket.on('terminalState', (resp: Status) => {
            if (resp.stackId !== stackId) return
            if (!stackState) return
            if (stackState.length === 0) return

            const newStatus = [...stackState]

            if (newStatus.some(term => term.id !== resp.cmd.id)) {
                newStatus.push({ id: resp.cmd.id, running: resp.isRunning })

            } else {
                newStatus.map((term) => {
                    if (term.id === resp.cmd.id) {
                        return { ...term, running: resp.isRunning }
                    }
                    return term
                })
            }

            setStackState(newStatus)
            console.log(newStatus)
        })


    }, [])

    const toggleStack = () => {

        if (stackState?.some(term => term.running)) {
            window.api.stopStack(stackId)
            return
        }

        window.api.startStack(stackId)

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
                    {stackState?.some(term => term.running) ? <>
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