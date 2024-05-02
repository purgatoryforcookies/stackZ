import { useState } from 'react'
import Record from '@renderer/components/Common/ListItem'
import { Separator } from '@renderer/@/ui/separator'
import { TrashIcon } from '@radix-ui/react-icons'
import { Badge } from '@renderer/@/ui/badge'
import { CustomToolTip } from './CustomTooltip'
import { GoInfo } from 'react-icons/go'
import { Cmd, CustomClientSocket } from '@t'

type EnvListProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}

function EnvList({ data, socket, id }: EnvListProps) {
    const [minimized, setMinimized] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)

    const handleMute = () => {
        socket.emit('environmentMute', {
            order: data.order,
            id: id
        })
    }

    const handleMinimize = () => {
        if (!minimized) {
            setMinimized(true)
        }
        if (minimized && !hidden) {
            setHidden(true)
        }
        if (minimized && hidden) {
            setHidden(false)
            setMinimized(false)
        }
    }

    const handleDelete = () => {
        socket.emit('environmentListDelete', {
            order: data.order,
            id: id
        })
    }

    return (
        <div
            className={`p-7 py-4 mb-8
        ${minimized && editMode ? '' : 'max-w-[35rem]'}
        ${editMode ? 'max-w-[100%]' : ''}
        `}
        >
            <div className='flex justify-center'>

                {data.title === 'OS Environment' ? (
                    <CustomToolTip message="This environment is editable, but not persistent.">
                        <h1 className="text-center text-foreground text-nowrap flex items-center gap-1">
                            {data.title} <GoInfo className="w-4 h-4 text-white/50" />
                        </h1>
                    </CustomToolTip>
                ) : (
                    <h1 className="text-center text-foreground text-nowrap">{data.title}</h1>
                )}

            </div>
            <Separator className="my-2" />
            <div className="flex gap-1 justify-center mb-2">
                <Badge
                    variant={'outline'}
                    className={`hover:cursor-pointer hover:bg-accent`}
                    aria-label="Toggle minimize"
                    onClick={handleMinimize}
                >
                    {minimized ? (hidden ? 'Show' : 'Hide') : 'Minimize'}
                </Badge>
                <Badge
                    variant={
                        data.disabled.length === Object.keys(data.pairs).length
                            ? 'default'
                            : 'outline'
                    }
                    className={`hover:cursor-pointer hover:bg-accent`}
                    aria-label="Toggle mute"
                    onClick={handleMute}
                >
                    Mute
                </Badge>
                {!minimized ? (
                    <>
                        <Badge
                            variant={editMode ? 'default' : 'outline'}
                            className={`hover:cursor-pointer hover:bg-accent`}
                            aria-label="Toggle edit"
                            onClick={() => setEditMode(!editMode)}
                        >
                            Edit
                        </Badge>
                        {editMode ? (
                            <TrashIcon
                                className="w-5 h-5 relative left-2 rounded-full text-white/50 hover:text-red-800 hover:cursor-pointer"
                                onClick={handleDelete}
                            />
                        ) : null}
                    </>
                ) : null}
            </div>
            {hidden ? (
                <div className="flex flex-col justify-center items-center pt-10 text-white/40">
                    <h2 className="text-2xl">
                        {Object.keys(data.pairs).length}{' '}
                        <span className="text-base">variables</span>
                    </h2>
                    <h3 className="text-lg">
                        {data.disabled.length} <span className="text-sm">muted</span>
                    </h3>
                </div>
            ) : (
                <div
                    className="flex flex-col gap-1 overflow-auto h-full py-2"
                    style={{ scrollbarGutter: 'stable' }}
                >
                    {data.pairs
                        ? Object.keys(data.pairs).map((key: string) => (
                            <Record
                                key={key} //react component key
                                id={id}
                                newRecord={false}
                                editMode={editMode}
                                socket={socket}
                                orderId={data.order}
                                minimized={minimized}
                                keyv={key}
                                muted={data.disabled.includes(key)}
                                value={data.pairs[key]}
                            />
                        ))
                        : null}
                    {editMode ? (
                        <Record
                            newRecord={true}
                            id={id}
                            socket={socket}
                            orderId={data.order}
                            minimized={minimized}
                            editMode={editMode}
                        />
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default EnvList
