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

    const askForRefresh = () => {
        socket.emit(
            'environmentListRefresh',
            {
                order: data.order,
                id: id
            },
            () => {}
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
        <div>
            <div
                className=" h-[2px] 
                    relative overflow-hidden mt-1
                     "
            >
                <div
                    className={`absolute w-full h-[1px]
                        ${ping?.loading ? 'bg-gradient-to-r animate-border-linear' : 'bg-transparent'} 
                        from-[#ede5c200] via-[#e6ddb8ba] to-[#ede5c200]
                        `}
                />
            </div>
            <div className="grid grid-cols-[30px_auto_30px]  grid-rows-1">
                <div className="flex pl-1 gap-2 relative top-[2px]">
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
                            <CustomToolTip
                                message={`Local backup stored`}
                                className="max-w-[30rem]"
                            >
                                <BookmarkIcon className="size-4 text-green-500" />
                            </CustomToolTip>
                        ) : null}
                    </div>
                </div>
                <div className="flex items-center justify-center text-nowrap text-ellipsis">
                    <p
                        className="hover:cursor-pointer text-white/30 w-[100px] text-center"
                        onClick={askForRefresh}
                    >
                        {ping?.metadata?.metadata?.updated || data.remote?.metadata?.updated
                            ? moment(
                                  ping?.metadata?.metadata?.updated ||
                                      data.remote?.metadata?.updated
                              ).fromNow()
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
        </div>
    )
}

export default RadioEnvironmentTools
