import { ClientEvents, Cmd, StackStatus, UtilityEvents } from '@t'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Dialogs/NewCommand'
import Command from './Command/Command'
import { Button } from '@renderer/@/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { NewStack } from './Dialogs/NewStack'
import { DraggableData } from 'react-draggable'
import { IUseStack } from '@renderer/hooks/useStack'
import { useTaalasmaa } from '@renderer/hooks/useTaalasmaa'
import CommandSM from './Command/CommandSM'

type PaletteProps = {
    data: IUseStack
}

const W_LIMIT_FOR_SM = 320

function Palette({ data }: PaletteProps) {
    const [running, setRunning] = useState<boolean>(false)
    const paletteRef = useRef<HTMLDivElement>(null)

    const { w } = useTaalasmaa(paletteRef)

    useEffect(() => {
        const socket = data.stackSocket?.get(data.selectedStack)
        if (!socket) return

        socket.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
            setRunning(d.isRunning || d.isReserved)
        })

        socket.emit(UtilityEvents.STACKSTATE)
        return () => {
            socket.off(ClientEvents.STACKSTATE)
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
    const isCompact = w && w < W_LIMIT_FOR_SM

    return (
        <div className="h-full flex flex-col" ref={paletteRef}>
            <div className="flex gap-3 justify-center py-5 flex-wrap px-4">
                {data.stack &&
                    Array.from(data.stack.values()).map((stack) => {
                        return (
                            <Badge
                                key={stack.id}
                                onClick={() => {
                                    let firstTerminalId = ''
                                    const firstOneOnStack = data.stack?.get(stack.id)?.palette
                                    if (!firstOneOnStack) firstTerminalId = 'gibberish'
                                    else firstTerminalId = firstOneOnStack[0]?.id
                                    data.selectStack(stack.id)
                                    data.selectTerminal(firstTerminalId)
                                }}
                                variant={data.selectedStack === stack.id ? 'default' : 'outline'}
                                className={`hover:bg-primary hover:text-background text-nowrap
                                hover:cursor-pointer`}
                            >
                                {stack.stackName}
                            </Badge>
                        )
                    })}
                <NewStack set={data.addStack} />
            </div>
            <div
                className={`flex w-full mb-2 ${isCompact ? 'justify-center p-2 bg-card' : 'justify-end pr-12'}`}
            >
                <Button
                    variant={'link'}
                    size={'sm'}
                    onClick={toggleStack}
                    className="text-foreground tracking-wide"
                >
                    {running ? (
                        <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Stop
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
                            return isCompact ? (
                                <CommandSM
                                    key={cmd.id}
                                    data={cmd}
                                    engine={engine}
                                    selected={cmd.id === data.selectedTerminal}
                                    handleDrag={handleDrag}
                                    stack={data}
                                />
                            ) : (
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
