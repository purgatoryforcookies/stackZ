import { Badge } from "@renderer/@/ui/badge"
import { IUseStack } from "@renderer/hooks/useStack"
import { StackStatus } from "@t"
import { useEffect, useState } from "react"


// Line 46 bg-transparent -> something else to get a border

function RadioBadge({ stack, id }: { stack: IUseStack, id: string }) {

    const [running, setRunning] = useState(false)


    useEffect(() => {
        const socket = stack.stackSocket?.get(id)
        if (!socket) return

        socket.on('badge', (d: StackStatus) => {
            setRunning(d.isRunning || d.isReserved)
        })

        return () => {
            socket.off('badge')
        }

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
            from-[#ede5c2e6] via-[#e2e0d74e] to-[#e1d7b076] hover:cursor-pointer bg-[length:_700%_900%]
             h-[22px] p-0 flex justify-center items-center
            `}
        >
            <span className={`${isSelect ? 'bg-primary' : running ? 'bg-gradient' : 'bg-transparent'}
              text-center rounded-[4px] px-2 h-[90%] w-[92%] bg-[length:_800%_800%] flex justify-center items-center
            
            `}>
                {stack.stack?.get(id)?.stackName}
            </span>

        </Badge >


    )
}

export default RadioBadge