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

    const [expanded, setExpanded] = useState<boolean>(true)
    const [title, setTitle] = useState<string>('')
    const clickAwayRef = useRef<HTMLDivElement>(null)


    const { } = useClickWatcher(clickAwayRef, setExpanded)


    const handle = () => {
        if (!expanded) {
            setExpanded(true)
            scroll()
        }

    }

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        baseSocket.emit('environmentList', { stack: stackId, terminal: terminalId, title: title })
        setTitle('')
        setExpanded(false)
    }


    return (
        <div className='absolute right-12 bottom-12 ' ref={clickAwayRef}>
            {expanded ?
                <form onSubmit={handleAdd} className='flex items-center gap-5 bg-background' onReset={() => { setExpanded(false), setTitle('') }}>
                    <Input placeholder='Name' value={title} type='text' onChange={(e) => setTitle(e.target.value)} autoFocus />
                    <Button type='submit' variant={'ghost'} size={'sm'} className='hover:bg-primary'>Add</Button>
                    <Button type='reset' variant={'destructive'} size={'sm'} >Cancel</Button>
                </form>
                : <IoAddCircleOutline size={30} onClick={handle} className='hover:cursor-pointer hover:text-primary-foreground text-primary' />}
        </div>
    )
}

export default NewEnvList