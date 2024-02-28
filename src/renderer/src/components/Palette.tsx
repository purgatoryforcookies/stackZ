import { ClientEvents, Cmd, StackStatus, UtilityEvents } from '@t'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Dialogs/NewCommand'
import Command from './Command/Command'
import { Button } from '@renderer/@/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { baseSocket } from '@renderer/service/socket'
import { NewStack } from './Dialogs/NewStack'
import { DraggableData } from 'react-draggable'
import { IUseStack } from '@renderer/hooks/useStack'



type PaletteProps = {
    data: IUseStack
}

function Palette({
    data,
}: PaletteProps) {

    const [running, setRunning] = useState<boolean>(false)

    const sniffState = () => {
        baseSocket.emit(UtilityEvents.BIGSTATE, { stack: data })
    }

    useEffect(() => {
        setRunning(false)
        baseSocket.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
            if (d.stack === data.selectedStack) {
                setRunning(d.isRunning || d.isReserved)
            }
        })
        sniffState()
        return () => {
            baseSocket.off(ClientEvents.STACKSTATE)
        }
    }, [data])

    const toggleStack = () => {
        if (running) {
            window.api.stopStack(data.selectedStack)
        } else {
            window.api.startStack(data.selectedStack)
            setRunning(true)
        }
    }

    const stack = data.stack?.get(data.selectedStack)

    const handleDrag = (d: DraggableData, terminal: Cmd, stackId?: string) => {
        if (!stackId || !terminal.executionOrder) return
        const howManySlots = Math.abs(Math.floor(d.y / 120))
        if (d.y > 50) {
            const oldExecutionOrder = terminal.executionOrder
            if (!stack?.palette?.length) return
            if (oldExecutionOrder === stack.palette.length + 1) return
            data.reOrder(stackId, terminal.id, oldExecutionOrder + howManySlots)
        }
        if (d.y < -50) {
            const oldExecutionOrder = terminal.executionOrder
            if (oldExecutionOrder === 1) return
            data.reOrder(stackId, terminal.id, oldExecutionOrder - (howManySlots - 1))
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-3 justify-center py-2">
                {data.stack &&
                    Array.from(data.stack.values()).map((stack) => {
                        return (
                            <Badge
                                key={stack.id}
                                onClick={() => {
                                    let firstTerminalId = ''
                                    const firstOneOnStack = data.stack?.get(stack.id)?.palette
                                    if (!firstOneOnStack) firstTerminalId = 'gibberish'
                                    else firstTerminalId = firstOneOnStack[0].id
                                    data.selectStack(stack.id)
                                    data.selectTerminal(firstTerminalId)
                                }}
                                variant={data.selectedStack === stack.id ? 'default' : 'outline'}
                                className={`hover:bg-primary hover:text-background 
                        hover:cursor-pointer`}
                            >
                                {stack.stackName}
                            </Badge>
                        )
                    })}
                <NewStack set={data.addStack} />
            </div>
            <div className="flex w-full justify-end pr-12">
                <Button variant={'link'} size={'sm'} onClick={toggleStack}>
                    {running ? (
                        <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        'Start stack'
                    )}
                </Button>
            </div>
            <div className="overflow-auto pb-20" style={{ scrollbarGutter: 'stable' }}>
                {stack?.palette
                    ? stack.palette
                        .sort((a, b) => (a.executionOrder || 0) - (b.executionOrder || 0))
                        .map((cmd) => {
                            if (!cmd?.id) return null
                            const engine = data.terminals?.get(data.selectedStack)?.get(cmd.id)
                            if (!engine) return null
                            return (
                                <Command
                                    key={cmd.id}
                                    data={cmd}
                                    engine={engine}
                                    selected={cmd.id === data.selectedTerminal}
                                    handleDrag={handleDrag}
                                    stack={data}
                                />
                            )
                        })
                    : null}
                <div className="w-full flex justify-center ">
                    <NewCommand stack={data} />
                </div>
            </div>
        </div>
    )
}

export default Palette
