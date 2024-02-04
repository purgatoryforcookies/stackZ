import { Cmd, SelectionEvents, Status } from '../../../../types'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { Button } from '@renderer/@/ui/button'
import { ChevronDownIcon, ChevronUpIcon, Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import CommandSettings from '../Common/CommandSettings'

type CommandProps = {
    data: Exclude<Cmd, undefined>
    hostStack: string
    handleClick: (
        stackId: string,
        terminalId: string,
        method?: SelectionEvents,
        cb?: () => void
    ) => void
    selected: string | null
}

function Command({ data, hostStack, handleClick, selected }: CommandProps) {
    const [ping, setPing] = useState<Status>({
        stackId: hostStack,
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })
    const [expanded, setExpanded] = useState<boolean>(false)

    useEffect(() => {
        baseSocket.on('terminalState', (d: Exclude<Status, undefined>) => {
            if (hostStack !== d.stackId || data.id !== d.cmd.id) return
            setPing(d)
        })
        baseSocket.emit('state', { stack: hostStack, terminal: data.id })
    }, [selected, hostStack, data])

    const handleState = async (delRecord = false) => {
        if (delRecord) {
            window.api.deleteCommand(hostStack, data.id)
            return
        }

        if (ping?.isRunning) {
            window.api.stopTerminal(hostStack, data.id)
        } else {
            window.api.startTerminal(hostStack, data.id)
        }
        baseSocket.emit('bigState', { stack: hostStack })
    }

    return (
        <div
            className={`
            p-1 m-2 rounded-md
            ${selected === data.id ? 'bg-card' : ''}`}
        >
            <div
                className="m-2 overflow-hidden rounded-md hover:cursor-pointer"
                onClick={() => handleClick(hostStack, data.id, SelectionEvents.CONN)}
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
                <div className={` relative
                     bg-terminalHeader 
                    ${selected === data.id ? '' : 'bg-background'}`}>
                    <div className='flex justify-between'>

                        <div className="flex flex-col pl-3 p-1 text-sm text-secondary-foreground">
                            <span>command: {ping.cmd.command.cmd}</span>
                            <span>shell: {ping.cmd.command.shell ?? data.command.shell}</span>
                            <span>
                                palettes: {ping.cmd.command.env?.length} {'(3 active)'}
                            </span>
                            <span>notes: {ping.cmd.title}</span>
                        </div>

                        <div className="flex items-center pr-10 relative">
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
                            <span className='absolute right-1 bottom-0 text-[0.7rem] text-white/30'>{ping.cmd.executionOrder ?? 'ei'}</span>
                        </div>
                    </div>

                    <div className={`${expanded ? "h-32" : "h-0"} 
                    transition-height duration-500 ease-in-out
                    
                    `}>

                        <div className="flex gap-1 justify-center p-2 pb-6 h-full">
                            <CommandSettings expanded={expanded} data={data} />
                        </div>


                    </div>
                    <div className='flex justify-center absolute bottom-0 right-[48%] hover:scale-125 hover:cursor-pointer w-7'
                        onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUpIcon className='h-4 w-4 ' />
                            : <ChevronDownIcon className='h-4 w-4 text-white/50' />}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Command
