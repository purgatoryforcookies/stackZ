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

        <div className="">
            <div className="text-secondary-foreground">
                TCP Ports in use
            </div>
            <ScrollArea className=" whitespace-nowrap rounded-md border" >
                <div className="flex w-max space-x-1 p-2 mb-2">
                    {processes ? processes.map((process, i) => (

                        <PortStrip key={process.process} name={process.process} ports={process.byPort} color={selectColor(i)} />
                    )) : <p className="text-white text-lg">Loading...</p>}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

    )
}

export default Ports


