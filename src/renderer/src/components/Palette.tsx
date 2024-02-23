import { ClientEvents, Cmd, PaletteStack, SelectionEvents, StackStatus, UtilityEvents } from '@t'
import { useEffect, useState } from 'react'
import { Badge } from '@renderer/@/ui/badge'
import NewCommand from './Dialogs/NewCommand'
import Command from './Command/Command'
import { Button } from '@renderer/@/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { baseSocket } from '@renderer/service/socket'
import { NewStack } from './Dialogs/NewStack'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type PaletteProps = {
    data: Map<string, PaletteStack>
    onClick: (
        stackId: string,
        terminalId: string,
        method?: SelectionEvents,
        cb?: () => void
    ) => void
    onNewTerminal: (cmd: Cmd) => void
    onNewStack: (st: PaletteStack) => void
    terminalId: string
    stackId: string
    engines: Map<string, TerminalUIEngine> | undefined
}

function Palette({
    data,
    onClick,
    onNewTerminal,
    onNewStack,
    terminalId,
    stackId,
    engines
}: PaletteProps) {
    const [running, setRunning] = useState<boolean>(false)

    useEffect(() => {
        setRunning(false)
        baseSocket.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
            if (d.stack === stackId) {
                setRunning(d.isRunning)
            }
        })
        baseSocket.emit(UtilityEvents.BIGSTATE, { stack: stackId })
        return () => {
            baseSocket.off(ClientEvents.STACKSTATE)
        }
    }, [stackId])

    const toggleStack = () => {
        if (running) {
            window.api.stopStack(stackId)
        } else {
            window.api.startStack(stackId)
        }
    }

    const stack = data.get(stackId)

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-3 justify-center py-2">
                {data &&
                    Array.from(data.values()).map((stack) => {
                        return (
                            <Badge
                                key={stack.id}
                                onClick={() => {
                                    let firstTerminalId = ''
                                    const firstOneOnStack = data.get(stack.id)?.palette
                                    if (!firstOneOnStack) firstTerminalId = 'gibberish'
                                    else firstTerminalId = firstOneOnStack[0].id
                                    onClick(stack.id, firstTerminalId, SelectionEvents.CONN)
                                }}
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
                              const engine = engines?.get(cmd.id)
                              if (!engine) return null
                              return (
                                  <Command
                                      key={cmd.id}
                                      data={cmd}
                                      handleClick={onClick}
                                      engine={engine}
                                      selected={cmd.id === terminalId}
                                  />
                              )
                          })
                    : null}
                <div className="w-full flex justify-center ">
                    <NewCommand afterAdd={onNewTerminal} stackId={stackId} />
                </div>
            </div>
        </div>
    )
}

export default Palette
