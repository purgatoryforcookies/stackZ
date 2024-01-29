import { useRef, useState } from 'react';
import { IoAddCircleOutline } from "react-icons/io5";
import { useClickWatcher } from '@renderer/hooks/useClickWatcher';
import { baseSocket } from '@renderer/service/socket';
import { Input } from '@renderer/@/ui/input';
import { Button } from '@renderer/@/ui/button';


type NewEnvListProps = {
    scroll: () => void
    stackId: number
    terminalId: number
}


function NewEnvList({ scroll, terminalId, stackId }: NewEnvListProps) {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const clickAwayRef = useRef<HTMLDivElement>(null)


    const { } = useClickWatcher(clickAwayRef, setExpanded)


    const handle = () => {
        if (!expanded) {
            setExpanded(true)

        }

    }

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        baseSocket.emit('environmentList', { stack: stackId, terminal: terminalId, value: title })
        setTitle('')
        setExpanded(false)
        scroll()
    }


    return (
        <div className='absolute right-12 bottom-12 ' ref={clickAwayRef}>
            {expanded ?
                <form onSubmit={handleAdd} className='flex items-center gap-5 text-secondary-foreground' onReset={() => { setExpanded(false), setTitle('') }}>
                    <Input placeholder='Name' value={title} type='text' onChange={(e) => setTitle(e.target.value)} autoFocus />
                    <Button type='submit' variant={'ghost'} size={'sm'} >Add</Button>
                    <Button type='reset' variant={'destructive'} size={'sm'} >Cancel</Button>
                </form>
                : <IoAddCircleOutline size={30} onClick={handle} className='hover:cursor-pointer hover:text-primary text-secondary-foreground' />}
        </div>
    )
}

export default NewEnvList