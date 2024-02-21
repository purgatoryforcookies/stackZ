import { baseSocket } from '@renderer/service/socket'
import { useEffect, useState } from 'react'
import Record from '@renderer/components/Common/ListItem'
import { Separator } from '@renderer/@/ui/separator'
import { TrashIcon } from '@radix-ui/react-icons'
import { Badge } from '@renderer/@/ui/badge'
import { ClientEvents, Environment, Status, UtilityEvents } from '@t'

type EnvListProps = {
    data: {
        title: string
        pairs: Record<string, string | undefined>
        order: number
        disabled: string[]
    }
    onSelection: (e: string[]) => void
    terminalId: string
    stackId: string
    highlight: string[] | null
}

function EnvList({ data, onSelection, terminalId, stackId, highlight }: EnvListProps) {
    const [minimized, setMinimized] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [ping, setPing] = useState<Environment>(data)

    const handleClik = (
        key: string | undefined,
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return

        onSelection([key ?? '', key ? data.pairs[key] || '' : ''])
    }

    useEffect(() => {
        baseSocket.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
            if (terminalId !== d.cmd.id) return
            const override = d.cmd.command.env?.find((e) => e.order === data.order)
            console.log(override)
            if (!override) return
            setPing(() => override)
        })
    }, [])

    const handleMute = () => {
        baseSocket.emit(UtilityEvents.ENVMUTE, {
            stack: stackId,
            terminal: terminalId,
            order: ping.order
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
        baseSocket.emit(UtilityEvents.ENVLISTDELETE, {
            stack: stackId,
            terminal: terminalId,
            order: ping.order
        })
    }

    return (
        <div
            className={`p-7 py-4
        ${minimized && editMode ? '' : 'max-w-[35rem]'}
        ${editMode ? 'max-w-[100%]' : ''}
        `}
        >
            <h1 className="text-center text-foreground text-nowrap">{ping.title}</h1>
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
                        ping.disabled.length === Object.keys(ping.pairs).length
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
                        {Object.keys(ping.pairs).length}{' '}
                        <span className="text-base">variables</span>
                    </h2>
                    <h3 className="text-lg">
                        {ping.disabled.length} <span className="text-sm">muted</span>
                    </h3>
                </div>
            ) : (
                <div className="flex flex-col gap-1 overflow-auto h-[100%] py-2 ">
                    {ping.pairs
                        ? Object.keys(ping.pairs).map((key: string) => (
                            <Record
                                key={key} //react component key
                                newRecord={false}
                                editMode={editMode}
                                terminalId={terminalId}
                                orderId={ping.order}
                                stackId={stackId}
                                minimized={minimized}
                                keyv={key}
                                muted={ping.disabled.includes(key)}
                                value={ping.pairs[key]}
                                onClick={handleClik}
                                highlight={highlight ? highlight[0] === key : false}
                            />
                        ))
                        : null}
                    {editMode ? (
                        <Record
                            newRecord={true}
                            terminalId={terminalId}
                            orderId={ping.order}
                            stackId={stackId}
                            minimized={minimized}
                            onClick={() => { }}
                            editMode={editMode}
                        />
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default EnvList
