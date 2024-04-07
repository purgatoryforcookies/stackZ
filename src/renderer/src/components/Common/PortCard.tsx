import { Separator } from "@renderer/@/ui/separator"
import { TPorts } from "@t"

function PortCard({ port }: { port: TPorts }) {
    return (
        <div className="flex text-secondary-foreground gap-4 items-center px-2">
            <div className="flex flex-col  items-center">
                <h1 className="text-lg">{port.localPort}</h1>
                <p>{port.process}</p>
            </div>
            <Separator orientation="vertical" color="#FFFFF" className="h-14" />
            <div className="flex flex-col items-center gap-2">
                <h1>Listen</h1>
                <div className="flex gap-10">
                    <div className="text-center">
                        <p>Local</p>
                        <h1>{port.localAddress}</h1>
                    </div>
                    <div className="text-center">
                        <p>Remote</p>
                        <h1>{port.remoteAddress}</h1>
                    </div>
                </div>
                <p>PID {port.pid}</p>
            </div>
        </div>
    )
}

export default PortCard