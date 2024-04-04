import { Badge } from "@renderer/@/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@renderer/@/ui/hover-card"


function PortStrip() {

    const process = 'discord'
    const ports = [{
        process: 'discord',
        pid: 1992,
        state: 'Listen',
        localPort: 1234,
        protocol: 'TCP',
        remotePort: 0,
        localAddress: '192.168.0.1',
        remoteAddress: '222.394.292.2',
        created: '2021-09-01 12:00:00',
    },
    {
        process: 'discord',
        pid: 1222,
        state: 'Listen',
        localPort: 5000,
        protocol: 'TCP',
        remotePort: 0,
        localAddress: '192.168.0.1',
        remoteAddress: '222.394.292.2',
        created: '2021-09-01 12:00:00',
    },
    {
        process: 'discord',
        pid: 5000,
        state: 'Listen',
        localPort: 9800,
        protocol: 'TCP',
        remotePort: 0,
        localAddress: '192.168.0.1',
        remoteAddress: '222.394.292.2',
        created: '2021-09-01 12:00:00',
    },
    {
        process: 'discord',
        pid: 1203,
        state: 'Listen',
        localPort: 3000,
        protocol: 'TCP',
        remotePort: 0,
        localAddress: '192.168.0.1',
        remoteAddress: '222.394.292.2',
        created: '2021-09-01 12:00:00',
    },
    ]


    return (
        <div className="px-3 flex flex-col justify-center items-center w-fit">
            <h1>{process}</h1>
            <div className="flex gap-2">
                {ports.map((port) => (
                    <HoverCard>
                        <HoverCardTrigger><Badge key={port.pid} className="text-sm">{port.localPort}</Badge></HoverCardTrigger>
                        <HoverCardContent>
                            The React Framework – created and maintained by @vercel.
                        </HoverCardContent>
                    </HoverCard>
                ))}
            </div>
        </div>
    )
}

export default PortStrip