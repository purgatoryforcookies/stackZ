import { ClientEvents, Cmd, Status, UtilityEvents } from '@t'
import { useEffect, useState } from 'react'
import { Button } from '@renderer/@/ui/button'
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CornerBottomLeftIcon,
    CornerBottomRightIcon,
    CornerTopLeftIcon,
    CornerTopRightIcon,
    Cross2Icon,
    EyeNoneIcon,
    HeartIcon,
    MoveIcon,
    ReloadIcon,
    SymbolIcon,
    TimerIcon
} from '@radix-ui/react-icons'
import CommandSettings from '../Common/CommandSettings'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import Draggable, { DraggableData } from 'react-draggable'
import { IUseStack } from '@renderer/hooks/useStack'

type CommandProps = {
    data: Exclude<Cmd, undefined>
    handleDrag: (data: DraggableData, terminal: Cmd, stack?: string) => void
    selected: boolean
    engine: TerminalUIEngine
    stack: IUseStack
}

function Command({ data, engine, stack, selected, handleDrag }: CommandProps) {
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

        if (ping.isRunning) {
            window.api.stopTerminal(engine.stackId, data.id)
        } else {
            window.api.startTerminal(engine.stackId, data.id)
        }
    }

    return (
        <Draggable
            axis="y"
            position={{ x: 0, y: 0 }}
            handle=".moveHandle"
            defaultClassNameDragging="brightness-125 relative z-50"
            onDrag={(_, d) => handleDrag(d, data)}
            onStop={(_, d) => handleDrag(d, data, engine.stackId)}
        >
            <div
                className={`
            p-1 m-2 rounded-lg
            ${selected ? 'bg-card' : ''}`}
            >
                {selected ? (
                    <div>
                        <CornerTopRightIcon className="absolute right-0 top-0 h-5 w-5 text-primary" />
                        <CornerBottomRightIcon className="absolute right-0 bottom-0 h-5 w-5 text-primary" />
                        <CornerBottomLeftIcon className="absolute left-0 bottom-0 h-5 w-5 text-primary" />
                        <CornerTopLeftIcon className="absolute left-0 top-0 h-5 w-5 text-primary" />
                    </div>
                ) : null}
                <div
                    className="m-2 overflow-hidden rounded-md"
                    onClick={() => {
                        stack.selectTerminal(engine.terminalId)
                    }}
                >
                    <div className="pl-4 bg-black/80 flex justify-between pr-5 gap-3">
                        <span className="truncate text-secondary-foreground " dir="rtl">
                            {ping.cwd}
                        </span>
                        <span className="flex items-center gap-2">
                            <MoveIcon className="h-4 w-4 text-secondary-foreground hover:scale-125 hover:cursor-pointer moveHandle" />
                            <Cross2Icon
                                className="h-4 w-4 text-secondary-foreground hover:scale-125 hover:cursor-pointer"
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
                                        ) : ping.reserved ? (
                                            'Pending...'
                                        ) : (
                                            'Start'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`transition-height duration-500 ease-in-out flex items-end `}
                        >
                            <CommandSettings expanded={expanded} data={ping} engine={engine} />
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
                            {ping.cmd.metaSettings?.rerun ? (
                                <SymbolIcon className="h-4 w-4" />
                            ) : null}
                            {ping.cmd.metaSettings?.loose ? (
                                <EyeNoneIcon className="h-4 w-4" />
                            ) : null}
                            {ping.cmd.health?.delay ? (
                                <span className="flex relative">
                                    <TimerIcon
                                        className={`h-4 w-4 
                                    ${ping.reserved ? 'text-primary brightness-110' : ''}
                                    `}
                                    />
                                    {ping.cmd.health.delay ? (
                                        <span className="absolute left-[14.5px] bottom-2">
                                            {ping.cmd.health.delay / 1000}
                                        </span>
                                    ) : null}
                                </span>
                            ) : null}
                            {ping.cmd.health?.healthCheck ? (
                                <span className="flex relative">
                                    <HeartIcon
                                        className={`h-4 w-4 
                                    ${hcHeartBeat ? 'text-primary brightness-110' : ''}
                                    `}
                                    />
                                    {hcHeartBeat ? (
                                        <span className="absolute left-[14.5px] bottom-2">
                                            {hcHeartBeat}
                                        </span>
                                    ) : null}
                                </span>
                            ) : null}
                        </span>
                        <span className="absolute right-1 bottom-0 text-[0.7rem] text-white/30">
                            {data.executionOrder ?? 'ei'}
                        </span>
                    </div>
                </div>
            </div>
        </Draggable>
    )
}

export default Command
