import { Badge } from "@renderer/@/ui/badge"
import { IUseStack } from "@renderer/hooks/useStack"
import { baseSocket } from "@renderer/service/socket"
import { ClientEvents, StackStatus, UtilityEvents } from "@t"
import { useEffect, useState } from "react"

// Line 46 bg-transparent -> something else to get a border

function RadioBadge({ stack, id }: { stack: IUseStack, id: string }) {

    const [running, setRunning] = useState(false)


    useEffect(() => {
        baseSocket.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
            console.log(d)

            if (d.stack !== id) return
            setRunning(d.isRunning || d.isReserved)
        })

        baseSocket.emit(UtilityEvents.STACKSTATE)
    }, [])

    const isSelect = stack.selectedStack === id

    return (

        <Badge
            onClick={() => {
                let firstTerminalId = ''
                const firstOneOnStack = stack.stack?.get(id)?.palette
                if (!firstOneOnStack) firstTerminalId = 'gibberish'
                else firstTerminalId = firstOneOnStack[0]?.id
                stack.selectStack(id)
                stack.selectTerminal(firstTerminalId)
            }}
            variant={isSelect ? 'default' : 'outline'}
            className={` text-nowrap
            ${running && !isSelect ? 'animate-border  bg-gradient-to-r' : isSelect ? 'bg-primary' : ''}
            from-[#fff9d448] via-[#d1c99357] to-gradient p-0  hover:cursor-pointer bg-[length:_400%_400%]
            flex justify-center items-center
            `}
        >
            <span className={`${isSelect ? 'bg-primary' : 'bg-transparent'}
            w-[96%] h-[95%] text-center rounded-[4px] px-4 py-1 
            relative top-[0px] right-[0.0px]
            `}>
                {stack.stack?.get(id)?.stackName}
            </span>

        </Badge >


    )
}

export default RadioBadge