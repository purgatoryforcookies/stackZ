import { FormEvent, useRef, useState } from 'react'
import styles from './newcommand.module.css'
import { GoPlusCircle } from 'react-icons/go'
import { Field } from '../ListItem/ListItem'
import { useClickWatcher } from '@renderer/hooks/useClickWatcher'
import { Cmd } from 'src/types'

type NewCommandProps = {
    afterAdd: (cmd: Cmd) => void
}

function NewCommand({ afterAdd }: NewCommandProps) {

    const [open, setOpen] = useState(false)
    const [command, setCommand] = useState<string>('')
    const reff = useRef(null)
    const { } = useClickWatcher(reff, setOpen)

    const handleClick = (e) => {
        if ((e.target as HTMLElement).nodeName === 'INPUT') return
        setOpen(!open)
    }


    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (command.length === 0) return
        const newCommand = await window.api.createCommand(command)
        setOpen(false)
        setCommand('')
        afterAdd(newCommand)
    }



    return (
        <div className={styles.main} onClick={handleClick} ref={reff}>
            {!open ? <GoPlusCircle size={20} className={styles.dot} />
                : <div className={`${styles.new}`}>
                    <form onSubmit={handleSave}>

                        <Field
                            placeholder='Command'
                            disabled={false}
                            onChange={setCommand}
                            className='primary'
                            onBlur={handleSave}
                        />
                    </form>

                </div>}
        </div>
    )
}

export default NewCommand