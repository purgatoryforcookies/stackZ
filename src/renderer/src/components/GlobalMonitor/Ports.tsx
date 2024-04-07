import { Processes } from "@t"
import PortStrip from "../Common/PortStrip"
import { useEffect, useState } from "react"
import { baseSocket } from "@renderer/service/socket"
import { ScrollArea, ScrollBar } from "@renderer/@/ui/scroll-area"
import { selectColor } from "@renderer/service/util"

function Ports() {

    const [processes, setProcesses] = useState<Processes>()

    useEffect(() => {
        baseSocket.emit('m_ports', (data: Processes) => {
            setProcesses(data)
        })
    }, [])

    return (

        <ScrollArea className=" whitespace-nowrap rounded-md border" >
            <div className="flex w-max space-x-4 p-4">

                {processes ? processes.map((process, i) => (

                    <PortStrip name={process.process} ports={process.ports} color={selectColor(i)} />
                )) : <p className="text-white text-lg">Loading...</p>}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>

    )
}

export default Ports


