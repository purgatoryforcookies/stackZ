import { MonitorPortsResponse, Processes } from "@t"
import PortStrip from "../Common/PortStrip"
import { useEffect, useState } from "react"
import { baseSocket } from "@renderer/service/socket"
import { ScrollArea, ScrollBar } from "@renderer/@/ui/scroll-area"
import { selectColor } from "@renderer/service/util"

function Ports() {

    const [tcpProcesses, setTcpProcesses] = useState<Processes>()
    const [udpProcesses, setUdpProcesses] = useState<Processes>()

    useEffect(() => {
        baseSocket.emit('m_ports', (data: MonitorPortsResponse) => {
            setTcpProcesses(data.tcp)
            setUdpProcesses(data.udp)
        })
    }, [])

    return (

        <div className="flex flex-col gap-2">
            <div>
                <div className="text-secondary-foreground">
                    TCP ports in use
                </div>
                <ScrollArea className=" whitespace-nowrap rounded-md border" >
                    <div className="flex p-1 mb-2">
                        {tcpProcesses ? tcpProcesses.map((process, i) => (

                            <PortStrip key={process.process} name={process.process} ports={process.byPort} color={selectColor(i)} />
                        )) : <p className="text-white text-lg">Loading...</p>}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            <div>
                <div className="text-secondary-foreground">
                    UDP ports in use
                </div>
                <ScrollArea className=" whitespace-nowrap rounded-md border" >
                    <div className="flex p-1 mb-2">
                        {udpProcesses ? udpProcesses.map((process, i) => (

                            <PortStrip key={process.process} name={process.process} ports={process.byPort} color={selectColor(i)} />
                        )) : <p className="text-white text-lg">Loading...</p>}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>

    )
}

export default Ports


