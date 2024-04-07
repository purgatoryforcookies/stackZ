import { Badge } from "@renderer/@/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@renderer/@/ui/hover-card"
import PortCard from "./PortCard"
import { TPorts } from "@t"



type PortStripProps = {
    name: string
    ports: TPorts[]
    color: string
}
function PortStrip({ name, ports, color }: PortStripProps) {

    return (
        <div className="px-3 flex flex-col gap-1 justify-center items-center w-fit">
            <h1 className="text-secondary-foreground" >{name}</h1>
            <div className="flex gap-2">
                {ports.map((port) => (
                    <HoverCard key={port.process} openDelay={0.2} closeDelay={0.3}>
                        <HoverCardTrigger>
                            <Badge className='text-sm' style={{ backgroundColor: color }}>
                                {port.localPort}
                            </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-full">
                            <PortCard port={port} />
                        </HoverCardContent>
                    </HoverCard>
                ))}
            </div>
        </div>
    )
}

export default PortStrip