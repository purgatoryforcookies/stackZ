import { EnginedCmd, SelectionEvents } from '../../../../types'
import { useEffect, useRef, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { Status } from '../DetailHeader/DetailHeader';
import { Toggle } from '@renderer/@/ui/toggle';



type CommandProps = {
    data: EnginedCmd
    handleClick: (id: number, method?: SelectionEvents) => void
    selected: number | null
    onRemove: (cmd: EnginedCmd) => void
}


function Command({ data, handleClick, selected }: CommandProps) {

    const [ping, setPing] = useState<Status>()
    const pathRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        baseSocket.on("terminalState", (d) => {
            if (d.id !== data.id) return
            setPing(d)
        })
    }, [])


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
                    hover:cursor-pointer hover:bg-background hover:bg-opacity-10
                    `}
                onClick={() => handleClick(data.id, SelectionEvents.CONN)}>
                <div className='pl-4 text-base bg-black10 flex justify-between pr-5'>
                    <span>
                        C://Users/max/documents/projects/Koodausprojekteja
                    </span>
                    {ping?.isRunning && <span className='text-primary brightness-75'>Running</span>}
                </div>
                <div className={` 
                flex justify-between
                ${(selected === data.id) ? 'bg-terminalBlack ' : 'bg-background mix-blend-screen '}`}>
                    <div className='flex flex-col pl-3 p-1 text-sm'>
                        <span>command: aws sso login</span>
                        <span>shell: powershell.exe</span>
                        <span>palettes: 5 {"(3 active)"}</span>
                        <span>notes: sso login</span>
                    </div>

                    <div className='flex'>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default Command