import { useRef, useState } from 'react';
import { IoAddCircleOutline } from "react-icons/io5";
import { useClickWatcher } from '@renderer/hooks/useClickWatcher';
import { baseSocket } from '@renderer/service/socket';
import { Input } from '@renderer/@/ui/input';
import { Button } from '@renderer/@/ui/button';


type NewEnvListProps = {
    scroll: () => void
}


function NewEnvList({ scroll }: NewEnvListProps) {

    const [expanded, setExpanded] = useState<boolean>(false)
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
        baseSocket.emit('environmentList', { id: 1, title: title })
        setTitle('')
        setExpanded(false)
    }


    return (
        <div className='h-10 min-w-32 flex justify-center ' ref={clickAwayRef}>
            {expanded ?
                <form onSubmit={handleAdd} className='flex flex-col gap-5 ' onReset={() => { setExpanded(false), setTitle('') }}>
                    <Input placeholder='Name' value={title} type='text' onChange={(e) => setTitle(e.target.value)} />
                    <div className='flex justify-center gap-3 pr-5'>
                        <Button type='reset' variant={'ghost'} size={'sm'} className='hover:bg-secondary'>Cancel</Button>
                        <Button type='submit' variant={'outline'} size={'sm'}>Add</Button>
                    </div>
                </form>
                : <IoAddCircleOutline size={30} onClick={handle} className='hover:cursor-pointer hover:text-primary-foreground text-primary' />}
        </div>
    )
}

export default NewEnvList