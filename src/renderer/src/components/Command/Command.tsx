import { Cmd, Status } from '@t'
import { useEffect, useState } from 'react'
import { Button } from '@renderer/@/ui/button'
import {
    CornerBottomLeftIcon,
    CornerBottomRightIcon,
    CornerTopLeftIcon,
    CornerTopRightIcon,
    Cross2Icon,
    EyeNoneIcon,
    HeartIcon,
    MixIcon,
    MoveIcon,
    PlayIcon,
    ReloadIcon,
    SymbolIcon,
    TimerIcon
} from '@radix-ui/react-icons'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import Draggable, { DraggableData } from 'react-draggable'
import { IUseStack } from '@renderer/hooks/useStack'
import CommandSettings from '../Common/CommandSettings2'

type CommandProps = {
    data: Exclude<Cmd, undefined>
    handleDrag: (data: DraggableData, terminal: Cmd, stack?: string) => void
    selected: boolean
    engine: TerminalUIEngine
    stack: IUseStack
    stackRunning: boolean
}

function Command({ data, engine, stack, selected, handleDrag, stackRunning }: CommandProps) {
    const [ping, setPing] = useState<Status>({
        stackId: engine.stackId,
        stackEnv: [],
        reserved: false,
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })
    const [hcHeartBeat, setHcHeartBeat] = useState<number>()
    const [ishalting, setIsHalting] = useState<boolean>(false)

    useEffect(() => {
        engine.socket.on('terminalState', (d) => {
            setPing(d)
        })

        engine.socket.on('heartBeat', (d) => {
            setHcHeartBeat(d)
        })
        engine.socket.on('haltBeat', (d) => {
            setIsHalting(d)
        })
        engine.socket.emit('state')

        return () => {
            engine.socket.off('terminalState')
            engine.socket.off('heartBeat')
        }
    }, [data, engine, selected])

    const handleState = async (delRecord = false) => {
        if (delRecord) {
            if (stackRunning) return
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
            disabled={stackRunning}
        >
            <div className="p-1 m-2 rounded-lg">
                {selected ? (
                    <div>
                        <CornerTopRightIcon className="absolute right-0 top-0 size-6 text-primary" />
                        <CornerBottomRightIcon className="absolute right-0 bottom-0 size-6 text-primary" />
                        <CornerBottomLeftIcon className="absolute left-0 bottom-0 size-6 text-primary" />
                        <CornerTopLeftIcon className="absolute left-0 top-0 size-6 text-primary" />
                    </div>
                ) : null}
                <div
                    className="m-1 overflow-hidden rounded-md"
                    onClick={() => {
                        stack.selectTerminal(engine.terminalId)
                    }}
                >
                    <div className="pl-4 bg-black/80 flex justify-between pr-5 gap-3">
                        <span className="truncate text-secondary-foreground " dir="rtl">
                            {ping.cwd}
                        </span>
                        <span className="flex items-center gap-2">
                            <CommandSettings engine={engine} />
                            <MoveIcon
                                className={`h-4 w-4 moveHandle
                            ${stackRunning ? 'text-muted' : 'text-secondary-foreground hover:scale-125 hover:cursor-pointer'}`}
                            />
                            <Cross2Icon
                                className={`h-4 w-4 
                                ${stackRunning ? 'text-muted' : 'text-secondary-foreground hover:scale-125 hover:cursor-pointer'}`}
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
                            <div className="flex flex-col pl-3 p-1 pr-12 text-sm text-secondary-foreground">
                                <p className="text-white leading-5">{ping.cmd.command.cmd}</p>
                                <div className="py-1 pt-2 pl-2 flex gap-5">
                                    <span>
                                        {'>'}
                                        {ping.cmd.command.shell ?? data.command.shell}
                                    </span>
                                </div>
                                <span>environments: x{ping.cmd.command.env?.length}</span>
                                <span>notes: {ping.cmd.title}</span>
                            </div>

                            <div className="flex items-center relative bottom-1 right-10">
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

                        <div className="absolute bottom-0 left-[50%]"></div>
                        <span className="absolute right-10 bottom-1 text-[0.7rem] text-white/30 flex gap-2">
                            {ping.cmd.metaSettings?.halt ? (
                                <MixIcon
                                    className={`h-4 w-4 
                                ${ishalting ? 'text-primary brightness-120' : ''}`}
                                />
                            ) : null}
                            {ping.cmd.metaSettings?.rerun ? (
                                <SymbolIcon className="h-4 w-4" />
                            ) : null}
                            {ping.cmd.metaSettings?.loose ? (
                                <EyeNoneIcon className="h-4 w-4" />
                            ) : null}
                            {ping.cmd.metaSettings?.sequencing ? (
                                <PlayIcon className="h-4 w-4" />
                            ) : null}
                            {ping.cmd.metaSettings?.ctrlc ? (
                                <div className="flex relative">
                                    <p>ctrl</p>
                                    <p className="absolute bottom-[7px] left-2">+C</p>
                                </div>
                            ) : null}
                            {ping.cmd.metaSettings?.delay ? (
                                <span className="flex relative">
                                    <TimerIcon
                                        className={`h-4 w-4 
                                    ${ping.reserved ? 'text-primary brightness-120' : ''}
                                    `}
                                    />
                                    {ping.cmd.metaSettings.delay ? (
                                        <span className="absolute left-[14.5px] bottom-2">
                                            {ping.cmd.metaSettings.delay / 1000}
                                        </span>
                                    ) : null}
                                </span>
                            ) : null}
                            {ping.cmd.metaSettings?.healthCheck ? (
                                <span className="flex relative">
                                    <HeartIcon
                                        className={`h-4 w-4 
                                    ${hcHeartBeat ? 'text-primary brightness-120' : ''}
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
