import { Cmd, EnginedCmd, SelectionEvents, Status } from '../../../../types'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { Button } from '@renderer/@/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';


type CommandProps = {
    data: Exclude<Cmd, undefined>
    hostStack: number
    handleClick: (stackId: number, terminalId: number, method?: SelectionEvents, cb?: (...args: any) => void,) => void
    selected: number | null
    onRemove?: (cmd: EnginedCmd) => void
}


function Command({ data, hostStack, handleClick, selected }: CommandProps) {

    const [ping, setPing] = useState<Status>({
        stackId: hostStack,
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })

    useEffect(() => {
        baseSocket.on("terminalState", (d: Exclude<Status, undefined>) => {
            if ((hostStack !== d.stackId) || (data.id !== d.cmd.id)) return
            setPing(d)
        })
        baseSocket.emit('state', { stack: hostStack, terminal: data.id })
    }, [selected, hostStack, data])

    const handleState = async () => {
        if (ping?.isRunning) {
            window.api.stopTerminal(hostStack, data.id)
            return
        }
        window.api.startTerminal(hostStack, data.id)
    }

    return (
        <div className={`
            p-1 m-2 rounded-md
            ${(selected === data.id) ? 'bg-card' : ''}`}>
            <div className='m-2 overflow-hidden rounded-md hover:cursor-pointer'
                onClick={() => handleClick(hostStack, data.id, SelectionEvents.CONN)}>
                <div className='pl-4 bg-black/80 flex justify-between pr-5 '>
                    <span className='truncate text-secondary-foreground ' dir='rtl'>
                        {ping.cwd}
                    </span>
                    {ping?.isRunning && <span className='font-bold brightness-75'>Running</span>}
                </div>
                <div className={` 
                flex justify-between bg-terminalHeader 
                ${(selected === data.id) ? '' : 'bg-background'}`}>
                    <div className='flex flex-col pl-3 p-1 text-sm text-secondary-foreground'>
                        <span>command: {data.command.cmd}</span>
                        <span>shell: {ping.cmd.command.shell ?? data.command.shell}</span>
                        <span>palettes: {ping.cmd.command.env?.length} {"(3 active)"}</span>
                        <span>notes: {ping.cmd.title}</span>
                    </div>

                    <div className='flex items-center pr-10'>
                        <div>
                            <Button variant={'ghost'} onClick={handleState}>
                                {ping?.isRunning ? <>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    Running...
                                </> : 'Start'
                                }
                            </Button>

                        </div>
                    </div>

                </div>
            </div>
        </div >
    )
}

export default Command