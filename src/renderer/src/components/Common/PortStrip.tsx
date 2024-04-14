import { Badge } from "@renderer/@/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@renderer/@/ui/hover-card"
import PortCard from "./PortCard"
import { Processes } from "@t"



type PortStripProps = {
    name: string
    ports: Processes[0]['byPort']
    color: string
}
function PortStrip({ name, ports, color }: PortStripProps) {

    return (
        <div className="px-3 flex flex-col gap-1 justify-center items-center w-fit">
            <h1 className="text-secondary-foreground" >{name}</h1>
            <div className="flex gap-2">
                {ports.map((port) => (
                    <HoverCard key={port.number} >
                        <HoverCardTrigger>
                            <Badge className='text-sm border-full' style={{ backgroundColor: color }}>
                                {port.number}
                            </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-full p-1">
                            <PortCard port={port.ports} />
                        </HoverCardContent>
                    </HoverCard>
                ))}
            </div>
        </div>
    )
}

export default PortStrip