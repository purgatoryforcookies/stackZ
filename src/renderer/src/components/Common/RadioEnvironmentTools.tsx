import { Button } from "@renderer/@/ui/button"
import { Cmd, CustomClientSocket } from "@t"
import { useEffect, useState } from "react"


type RadioEnvironmentToolsProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}

function RadioEnvironmentTools({ socket, id, data }: RadioEnvironmentToolsProps) {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const askForRefresh = () => {

        setError(null)
        socket.emit('environmentListRefresh', {
            order: data.order,
            id: id
        }, (err) => {
            if (err) {
                setError(err)
            }
        })
    }

    useEffect(() => {
        socket.on('environmentHeartbeat', (resp) => {
            if (resp.order !== data.order) {
                return
            }
            setLoading(resp.loading)
            setError(resp.error)
        })
    }, [])


    return (
        <div>
            <div className='w-full h-[2px] 
                    relative overflow-hidden my-3
                     '>
                <div className={`absolute w-full h-[1px]
                         
                        ${loading ? 'bg-gradient-to-r animate-border-linear' : 'bg-transparent'} 
                        from-[#ede5c200] via-[#e6ddb8ba] to-[#ede5c200]
                        `} />
            </div>
            <div className='flex gap-2 bg-black/30 absolute'>

                <p>{data.order}</p>
                <Button
                    size={'sm'}
                    variant={'link'}
                    onClick={askForRefresh}>Refresh</Button>
            </div>
        </div>
    )
}

export default RadioEnvironmentTools