import { ClientEvents, Cmd, SelectionEvents, Status, UtilityEvents } from '@t'
import { useEffect, useState } from 'react'
import { Button } from '@renderer/@/ui/button'
import {
    ChevronDownIcon,
    ChevronUpIcon,
    Cross2Icon,
    EyeNoneIcon,
    HeartIcon,
    ReloadIcon,
    SymbolIcon,
    TimerIcon
} from '@radix-ui/react-icons'
import CommandSettings from '../Common/CommandSettings'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type CommandProps = {
    data: Exclude<Cmd, undefined>
    handleClick: (stackId: string, terminalId: string, method?: SelectionEvents) => void
    selected: boolean
    engine: TerminalUIEngine
}

function Command({ data, handleClick, engine, selected }: CommandProps) {
    const [ping, setPing] = useState<Status>({
        stackId: engine.stackId,
        reserved: false,
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })
    const [expanded, setExpanded] = useState<boolean>(false)
    const [hcHeartBeat, setHcHeartBeat] = useState<number>()

    useEffect(() => {
        engine.socket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            setPing(d)
        })

        engine.socket.on(ClientEvents.HEARTBEAT, (d: number) => {
            setHcHeartBeat(d)
        })
        engine.socket.emit(UtilityEvents.STATE)

        return () => {
            engine.socket.off(ClientEvents.TERMINALSTATE)
            engine.socket.off(ClientEvents.HEARTBEAT)
        }
    }, [data, engine, selected])

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
                onClick={() => handleClick(engine.stackId, engine.terminalId, SelectionEvents.CONN)}
            >
                <div className="pl-4 bg-black/80 flex justify-between pr-5 gap-3">
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
                                <Button
                                    variant={'ghost'}
                                    onClick={() => handleState()}
                                    disabled={ping.reserved}
                                >
                                    {ping.isRunning ? (
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
                            <CommandSettings expanded={expanded} data={ping} engine={engine} />
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
                    <span className="absolute right-10 bottom-1 text-[0.7rem] text-white/30 flex gap-2">
                        {ping.cmd.metaSettings?.rerun ? <SymbolIcon className="h-4 w-4" /> : null}
                        {ping.cmd.metaSettings?.loose ? <EyeNoneIcon className="h-4 w-4" /> : null}
                        {ping.cmd.health?.delay ? (
                            <span className="flex relative">
                                <TimerIcon className="h-4 w-4" />
                                {ping.cmd.health.delay ? (
                                    <span className="absolute left-[14.5px] bottom-2">
                                        {ping.cmd.health.delay / 1000}
                                    </span>
                                ) : null}
                            </span>
                        ) : null}
                        {ping.cmd.health?.healthCheck ? (
                            <span className="flex relative">
                                <HeartIcon className="h-4 w-4" />
                                {hcHeartBeat ? (
                                    <span className="absolute left-[14.5px] bottom-2">
                                        {hcHeartBeat}
                                    </span>
                                ) : null}
                            </span>
                        ) : null}
                    </span>
                    <span className="absolute right-1 bottom-0 text-[0.7rem] text-white/30">
                        {ping.cmd.executionOrder ?? 'ei'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Command
