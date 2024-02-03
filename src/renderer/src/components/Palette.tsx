import { Cmd, PaletteStack, SelectionEvents, StackStatus, Status } from '../../../types'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Dialogs/NewCommand'
import Command from './Command/Command'
import { Button } from '@renderer/@/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { baseSocket } from '@renderer/service/socket'
import { NewStack } from './Dialogs/NewStack'

type PaletteProps = {
    data: Map<string, PaletteStack>
    onClick: (stackId: string, terminalId: string, method?: SelectionEvents, cb?: () => void) => void
    onNewTerminal: (cmd: Cmd) => void
    onNewStack: (st: PaletteStack) => void
    terminalId: string
    stackId: string
}

function Palette({ data, onClick, onNewTerminal, onNewStack, terminalId, stackId }: PaletteProps) {
    const [palette, setPalette] = useState<Cmd[]>()
    const [stackState, setStackState] = useState<StackStatus['state']>([])

    useEffect(() => {
        baseSocket.on('stackState', (d: StackStatus) => {
            if (d.stack !== stackId) return
            setStackState(d.state)
        })
        baseSocket.on('terminalState', (d: Status) => {
            if (d.stackId !== stackId) return
            if (stackState.length === 0) return

            const newStatus = [...stackState]
            const index = newStatus.findIndex((term) => term.id === d.cmd.id)
            if (index === -1) return
            newStatus[index].running = d.isRunning
            setStackState(newStatus)
        })

        // toast('info', {
        //     description: "Terminal stopped",

        // })

        baseSocket.emit('bigState', { stack: stackId })
    }, [stackId, terminalId])

    const toggleStack = () => {
        if (stackState.some((term) => term.running)) {
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
        <div className="h-full flex flex-col">
            <div className="flex gap-3 justify-center py-2">
                {data &&
                    Array.from(data.values()).map((stack) => {
                        return (
                            <Badge
                                key={stack.id}
                                onClick={() => onClick(stack.id, 'gibberish', SelectionEvents.CONN)}
                                variant={stackId === stack.id ? 'default' : 'outline'}
                                className={`hover:bg-primary hover:text-background 
                        hover:cursor-pointer`}
                            >
                                {stack.stackName}
                            </Badge>
                        )
                    })}
                <NewStack set={onNewStack} />
            </div>
            <div className="flex w-full justify-end pr-12">
                <Button variant={'link'} size={'sm'} onClick={toggleStack}>
                    {stackState?.some((term) => term.running === true) ? (
                        <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        'Start stack'
                    )}
                </Button>
            </div>
            <div className="overflow-auto pb-20">
                {palette
                    ? palette.map((cmd) => {
                        if (!cmd?.id) return null
                        return (
                            <Command
                                key={cmd.id}
                                data={cmd}
                                hostStack={stackId}
                                handleClick={onClick}
                                selected={terminalId}
                            />
                        )
                    })
                    : null}
                <div className="w-full flex justify-center">
                    <NewCommand afterAdd={onNewTerminal} stackId={stackId} />
                </div>
            </div>
        </div>
    )
}

export default Palette
