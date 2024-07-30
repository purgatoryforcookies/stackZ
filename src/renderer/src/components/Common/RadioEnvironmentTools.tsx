import { Cmd, CustomClientSocket, EnvironmentHeartbeat } from '@t'
import { useEffect, useState } from 'react'
import { CustomToolTip } from './CustomTooltip'
import { BookmarkIcon, ExclamationTriangleIcon, Link2Icon } from '@radix-ui/react-icons'
import moment from 'moment'

type RadioEnvironmentToolsProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}

function RadioEnvironmentTools({ socket, id, data }: RadioEnvironmentToolsProps) {
    const [ping, setPing] = useState<EnvironmentHeartbeat>()
    const [hover, setHover] = useState(false)

    const askForRefresh = () => {
        socket.emit(
            'environmentListRefresh',
            {
                order: data.order,
                id: id
            },
            () => { }
        )
    }

    useEffect(() => {
        socket.on('environmentHeartbeat', (resp) => {
            if (resp.order !== data.order) {
                return
            }
            setPing(resp)
        })
    }, [])

    return (
        <div className="grid grid-cols-[40px_auto_40px]  grid-rows-1 relative top-[5px] ">
            <div className="flex pl-1 gap-1 relative top-[2px]">
                <div>
                    {data.remote && data.remote.autoFresh ? (
                        <CustomToolTip
                            message={`Synced on every terminal start`}
                            className="max-w-[30rem]"
                        >
                            <Link2Icon className="size-4 text-green-500" />
                        </CustomToolTip>
                    ) : null}
                </div>
                <div>
                    {data.remote && data.remote.keep ? (
                        <CustomToolTip message={`Local backup turned on`} className="max-w-[30rem]">
                            <BookmarkIcon className="size-4 text-green-500" />
                        </CustomToolTip>
                    ) : null}
                </div>
            </div>
            <div className="flex items-center justify-center text-nowrap text-ellipsis">
                <p
                    className="hover:cursor-pointer text-white/30 w-[100px] text-center"
                    onClick={askForRefresh}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {hover
                        ? 'Refresh'
                        : data.remote?.metadata?.updated
                            ? moment(data.remote?.metadata?.updated).fromNow()
                            : 'Not updated'}
                </p>
            </div>
            <div className="flex items-center justify-center relative top-[2px]">
                {ping?.error ? (
                    <CustomToolTip
                        message={`${ping.error}`}
                        hidden={!ping.error}
                        className="max-w-[30rem]"
                    >
                        <ExclamationTriangleIcon className={`size-4 text-orange-500`} />
                    </CustomToolTip>
                ) : null}
            </div>
        </div>
    )
}

export default RadioEnvironmentTools
