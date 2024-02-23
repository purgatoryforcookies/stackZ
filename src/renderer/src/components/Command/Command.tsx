import { ClientEvents, Cmd, SelectionEvents, Status } from '@t'
import { useEffect, useState } from 'react'
import { Button } from '@renderer/@/ui/button'
import { ChevronDownIcon, ChevronUpIcon, Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import CommandSettings from '../Common/CommandSettings'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type CommandProps = {
    data: Exclude<Cmd, undefined>
    handleClick: (
        stackId: string,
        terminalId: string,
        method?: SelectionEvents,
        cb?: () => void
    ) => void
    selected: boolean
    engine: TerminalUIEngine
}

function Command({ data, handleClick, engine, selected }: CommandProps) {
    const [ping, setPing] = useState<Status>({
        stackId: engine.stackId,
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })
    const [expanded, setExpanded] = useState<boolean>(false)

    useEffect(() => {
        engine.socket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            setPing(d)
        })
    }, [data, engine])

    const handleState = async (delRecord = false) => {
        if (delRecord) {
            window.api.deleteCommand(engine.stackId, data.id)
            return
        }

        if (ping?.isRunning) {
            window.api.stopTerminal(engine.stackId, data.id)
        } else {
            window.api.startTerminal(engine.stackId, data.id)
        }
    }

    return (
        <div
            className={`
            p-1 m-2 rounded-md
            ${selected ? 'bg-card' : ''}`}
        >
            <div
                className="m-2 overflow-hidden rounded-md hover:cursor-pointer"
                onClick={() => handleClick(engine.stackId, data.id, SelectionEvents.CONN)}
            >
                <div className="pl-4 bg-black/80 flex justify-between pr-5 ">
                    <span className="truncate text-secondary-foreground " dir="rtl">
                        {ping.cwd}
                    </span>
                    <span className="flex items-center ">
                        <Cross2Icon
                            className="h-4 w-4 text-secondary-foreground hover:scale-125"
                            onClick={() => handleState(true)}
                        />
                    </span>
                </div>
                <div
                    className={` relative
                     bg-terminalHeader 
                    ${engine.terminalId === data.id ? '' : 'bg-background'}`}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-col pl-3 p-1 text-sm text-secondary-foreground">
                            <span>command: {ping.cmd.command.cmd}</span>
                            <span>shell: {ping.cmd.command.shell ?? data.command.shell}</span>
                            <span>palettes: x{ping.cmd.command.env?.length}</span>
                            <span>notes: {ping.cmd.title}</span>
                        </div>

                        <div className="flex items-center relative top-2 right-12">
                            <div>
                                <Button variant={'ghost'} onClick={() => handleState()}>
                                    {ping?.isRunning ? (
                                        <>
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        'Start'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${expanded ? 'h-32' : 'h-0'} 
                    transition-height duration-500 ease-in-out
                    
                    `}
                    >
                        <div className="flex gap-1 justify-center  pb-6 h-full">
                            <CommandSettings expanded={expanded} data={data} engine={engine} />
                        </div>
                    </div>
                    <div
                        className="flex justify-center w-full hover:scale-125 hover:cursor-pointer "
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 text-white/50" />
                        )}
                    </div>
                    <span className="absolute right-1 bottom-0 text-[0.7rem] text-white/30">
                        {ping.cmd.executionOrder ?? 'ei'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Command
