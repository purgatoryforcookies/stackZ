import { EnginedCmd, SelectionEvents, Status } from '../../../../types'
import { useEffect, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { Button } from '@renderer/@/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';


type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: SelectionEvents) => void
    selected: number | null
    onRemove: (cmd: EnginedCmd) => void
}


function Command({ data, handleClick, selected }: CommandProps) {

    const [ping, setPing] = useState<Status>({
        cmd: data,
        isRunning: false,
        cwd: data.command.cwd
    })

    useEffect(() => {
        baseSocket.on("terminalState", (d: Status) => {
            if (d.cmd.id !== data.id) return
            setPing(d)
        })
        baseSocket.emit('state', data.id)
    }, [selected])

    const handleState = async () => {
        if (ping?.isRunning) {
            window.api.stopTerminal(data.id)
            return
        }
        window.api.startTerminal(data.id)
    }


    return (
        <div className={`
            p-1
            ${(selected === data.id) ? 'bg-black' : ''}`}>
            <div className={`m-2 overflow-hidden rounded-s-md
                    hover:cursor-pointer
                    `}
                onClick={() => handleClick(data.id, SelectionEvents.CONN)}>
                <div className='pl-4 text-base bg-black10 flex justify-between pr-5'>
                    <span className='truncate' dir='rtl'>
                        {ping.cwd}
                    </span>
                    {ping?.isRunning && <span className='text-primary brightness-75'>Running</span>}
                </div>
                <div className={` 
                flex justify-between
                ${(selected === data.id) ? 'bg-terminalBlack ' : 'bg-background mix-blend-screen '}`}>
                    <div className='flex flex-col pl-3 p-1 text-sm'>
                        <span>command: {ping.cmd.command.cmd}</span>
                        <span>shell: powershell.exe</span>
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