import { FormEvent, useRef, useState } from 'react'
import styles from './newcommand.module.css'
import { GoPlusCircle } from 'react-icons/go'
import { Field } from '../ListItem'
import { useClickWatcher } from '@renderer/hooks/useClickWatcher'
import { Cmd } from 'src/types'

type NewCommandProps = {
    afterAdd: (cmd: Cmd) => void
}

function NewCommand({ afterAdd }: NewCommandProps) {

    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState<string>('')
    const reff = useRef(null)
    const { } = useClickWatcher(reff, setOpen)

    const handleClick = (e) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return
        setOpen(!open)
    }


    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (title.length === 0) return
        const newCommand = await window.api.createCommand(title)
        setOpen(false)
        setTitle('')
        afterAdd(newCommand)
    }



    return (
        <div className='flex justify-center' onClick={handleClick} ref={reff}>
            {!open ? <GoPlusCircle size={22} className='hover:cursor-pointer hover:text-primary-foreground text-primary' />
                : <div className={`${styles.new}`}>
                    <form onSubmit={handleSave}>

                        <Field
                            placeholder='Title'
                            disabled={false}
                            onChange={setTitle}
                            variant='primary'
                        />
                    </form>

                </div>}
        </div>
    )
}

export default NewCommand