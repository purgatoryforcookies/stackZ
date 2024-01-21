import { baseSocket } from '@renderer/service/socket';
import { useState } from 'react';
import Record from '@renderer/components/Common/ListItem';
import { Separator } from '@renderer/@/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@renderer/@/ui/toggle-group';



type EnvListProps = {
    data: {
        title: string;
        pairs: Record<string, string | undefined>;
        order: number;
        disabled: string[];
    }
    className?: 'highlighted' | ''
    onSelection: (e: string[]) => void
    terminalId: number
}



function EnvList({ data, onSelection, terminalId }: EnvListProps) {

    const [minimized, setMinimized] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<boolean>(false)


    const handleClik = (key: string | undefined, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return

        onSelection([key ?? '', key ? '' : ''])
    }

    const handleMute = () => {
        baseSocket.emit('environmentMute', { id: terminalId, orderId: data.order })
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
        baseSocket.emit('environmentDelete', { id: terminalId, orderId: data.order })
    }


    return (
        <div className='min-w-24 max-w-[20%] p-3 '>
            <h1 className='text-center text-foreground'>{data.title}</h1>
            <Separator className="my-2" />
            <ToggleGroup type="multiple" size='sm' variant='outline' className='my-3 text-foreground'>
                <ToggleGroupItem value="Minimize" aria-label="Toggle minimize" onClick={handleMinimize}>
                    Minimize
                </ToggleGroupItem>
                <ToggleGroupItem value="Mute" aria-label="Toggle mute" onClick={handleMute}>
                    Mute
                </ToggleGroupItem>
                <ToggleGroupItem value="Edit" aria-label="Toggle edit" >
                    Edit
                </ToggleGroupItem>
            </ToggleGroup>
            <div className='overflow-x-hidden overflow-auto flex flex-col gap-1 max-h-80'>
                {data.pairs ? Object.keys(data.pairs).map((key: string) => (


                    <Record
                        newRecord={false}
                        editMode={editMode}
                        terminalId={terminalId}
                        orderId={data.order}
                        minimized={minimized}
                        keyv={key}
                        key={key}
                        muted={data.disabled.includes(key)}
                        value={data.pairs[key]}
                        onClick={handleClik} />



                )) : null}
                {editMode ?
                    <Record
                        newRecord={true}
                        terminalId={terminalId}
                        orderId={data.order}
                        minimized={minimized}
                        onClick={() => { }}
                        editMode={editMode}
                    />
                    : null}
            </div>
        </div>
    )
}

export default EnvList