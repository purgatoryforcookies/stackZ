import { useEffect, useState } from 'react'
import Record from '@renderer/components/Common/ListItem'
import { TrashIcon } from '@radix-ui/react-icons'
import { Badge } from '@renderer/@/ui/badge'
import { CustomToolTip } from './CustomTooltip'
import { GoInfo } from 'react-icons/go'
import { Cmd, CustomClientSocket, Environment } from '@t'
import EnvEditor, { NAME_FOR_OS_ENV_SET } from './EnvironmentEditor/EnvEditor'
import { Button } from '@renderer/@/ui/button'
import RadioEnvironmentTools from './RadioEnvironmentTools'

type EnvListProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}

function EnvList({ data, socket, id }: EnvListProps) {
    const [minimized, setMinimized] = useState(true)
    const [hidden, setHidden] = useState(true)
    const [editorOpen, setEditorOpen] = useState(false)
    const [delayedLoading, setDelayedLoading] = useState(false)

    useEffect(() => {
        socket.on('environmentHeartbeat', (resp) => {
            if (resp.order !== data.order) {
                return
            }
            //UX reason
            if (resp.loading) {
                setDelayedLoading(true)
            } else {
                setTimeout(() => {
                    setDelayedLoading(false)
                }, 1200)
            }
        })
    }, [])

    const handleMute = () => {
        socket.emit('environmentMute', {
            order: data.order,
            id: id
        })
    }

    const handleVisualState = (state: Environment['visualState']) => {
        socket.emit('environmentVisualState', {
            order: data.order,
            id: id,
            value: state
        })
    }

    const handleMinimize = () => {
        if (!minimized) {
            setMinimized(true)
            handleVisualState('1')
        }
        if (minimized && !hidden) {
            setHidden(true)
            handleVisualState('2')
        }
        if (minimized && hidden) {
            setHidden(false)
            setMinimized(false)
            handleVisualState('0')
        }
    }

    useEffect(() => {
        if (data.title === NAME_FOR_OS_ENV_SET && !data.visualState) {
            setHidden(true)
            setMinimized(true)
            return
        }

        switch (data.visualState) {
            case '0':
                setHidden(false)
                setMinimized(false)
                break
            case '1':
                setHidden(false)
                setMinimized(true)
                break
            case '2':
                setHidden(true)
                setMinimized(true)
                break
            default:
                setHidden(false)
                setMinimized(false)
                break
        }
    }, [data])

    const handleDelete = () => {
        socket.emit('environmentListDelete', {
            order: data.order,
            id: id
        })
    }

    return (
        <div className={`${minimized ? '' : 'max-w-[35rem]'} h-[calc(100%-100px)] `}>
            <EnvEditor
                setOpen={setEditorOpen}
                editorOpen={editorOpen}
                data={data}
                socket={socket}
                id={id}
            />
            <div className="flex justify-center cursor-pointer" onClick={() => setEditorOpen(true)}>
                {data.title === NAME_FOR_OS_ENV_SET ? (
                    <CustomToolTip message="This environment is editable, but not persistent.">
                        <h1 className="text-center text-foreground text-nowrap flex items-center gap-1">
                            {data.title} <GoInfo className="w-4 h-4 text-white/50" />
                        </h1>
                    </CustomToolTip>
                ) : (
                    <h1 className="text-center text-foreground text-nowrap">{data.title}</h1>
                )}
            </div>
            {/* <Separator className="my-2" /> */}
            <div className=" h-[1px] my-2 relative overflow-hidden bg-border">
                <div
                    className={`absolute w-full h-[0.5px]
                        ${delayedLoading ? 'bg-gradient-to-r animate-border-linear' : 'bg-border'} 
                        from-[#ede5c200] via-[#ecdfa8] to-[#ede5c200]
                        `}
                />
            </div>
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
                <TrashIcon
                    className="w-5 h-5 relative left-1 rounded-full text-white/50 hover:text-red-800 hover:cursor-pointer"
                    onClick={handleDelete}
                />
            </div>
            {hidden ? (
                <div className="flex flex-col justify-center items-center pt-10 text-white/40 h-full pb-10">
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
                    className="flex flex-col gap-1 overflow-auto py-2 h-full relative"
                    style={{ scrollbarGutter: 'stable' }}
                >
                    {Object.keys(data.pairs).length > 0 ? (
                        Object.keys(data.pairs).map((key: string) => (
                            <Record
                                key={key} //react component key
                                id={id}
                                socket={socket}
                                orderId={data.order}
                                minimized={minimized}
                                keyv={key}
                                muted={data.disabled.includes(key)}
                                value={data.pairs[key]}
                                onDoubleClick={() => setEditorOpen(true)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col gap-6 pt-5">
                            <h1 className="text-center text-white/40">No variables</h1>
                            <Button size={'sm'} onClick={() => setEditorOpen(true)}>
                                Add
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {data.remote ? <RadioEnvironmentTools data={data} socket={socket} id={id} /> : null}
        </div>
    )
}

export default EnvList
