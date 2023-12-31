import { useRef, useState } from 'react';
import styles from './newenvlist.module.css'
import { IoAddCircleOutline } from "react-icons/io5";
import { useClickWatcher } from '@renderer/hooks/useClickWatcher';
import { baseSocket } from '@renderer/service/socket';


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
        <div className={styles.main}>
            <div className={`${styles.addArea} ${expanded ? styles.active : ''}`} onClick={handle} ref={clickAwayRef}>
                {expanded ?
                    <div className={styles.new}>
                        <form onSubmit={handleAdd} onReset={() => { setExpanded(false), setTitle('') }}>
                            <input autoFocus={true} value={title} type="text" placeholder='Name' onChange={(e) => setTitle(e.target.value)} />
                            <div className={styles.actions}>
                                <button type='reset'>Cancel</button>
                                <button type='submit'>Add</button>
                            </div>
                        </form>
                    </div>
                    : <IoAddCircleOutline size={30} />}
            </div>

        </div>
    )
}

export default NewEnvList