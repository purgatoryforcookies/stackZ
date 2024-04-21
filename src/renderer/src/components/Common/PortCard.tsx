import { Separator } from '@renderer/@/ui/separator'
import { TPorts } from '@t'

function PortCard({ port }: { port: TPorts[] }) {
    return (
        <div className="flex text-secondary-foreground gap-4 items-center px-2">
            <div className="flex flex-col  items-center">
                <h1 className="text-lg px-4">{port[0].localPort}</h1>
                <p className="text-secondary-foreground/50 text-xs self-start pr-20">
                    {port[0].process}
                </p>
                <p className="text-secondary-foreground/50 text-xs self-start pr-20">
                    PID {port[0].pid}
                </p>
            </div>
            <Separator orientation="vertical" color="#FFFFF" className="h-14" />
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-secondary-foreground/65">Local</p>
                        {port.map((port, i) => (
                            <h1 key={i}>{port.localAddress}</h1>
                        ))}
                    </div>
                    <div className="text-center">
                        <p className="text-secondary-foreground/65">Remote</p>
                        {port.map((port, i) => (
                            <h1 key={i}>{port.remoteAddress}</h1>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PortCard
