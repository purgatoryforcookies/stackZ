import styles from './listitem.module.css'
import { GoPlusCircle } from 'react-icons/go'
import { FormEvent, useRef, useState } from 'react'
import { useClickWatcher } from '@renderer/hooks/useClickWatcher'
import { baseSocket } from '@renderer/service/socket'
import { BsDot } from 'react-icons/bs'


type ListItemProps = {
    newRecord: boolean,
    terminalId: number,
    orderId: number,
    minimized: boolean,

}

interface RecordProps extends ListItemProps {
    keyv?: string,
    value?: string,
    onClick: (key: string | undefined, e) => void,
    editMode: boolean,
    muted?: boolean,
}


type FieldProps = {
    value?: string,
    disabled: boolean,
    onChange: (value: string) => void,
    className: 'primary' | 'secondary',
    placeholder?: string
    muted?: boolean
}


export const Field = ({ value, disabled, onChange, className, placeholder, muted = false }: FieldProps) => {

    if (disabled) return (
        <p className={`${styles.field} ${styles[className]} ${muted ? styles.muted : ''}`}>{value}</p>
    )

    return (
        <input
            autoFocus={className === 'primary'}
            type='text'
            className={`${styles.field} ${styles[className]} ${muted ? styles.muted : ''}`}
            onChange={(e) => onChange(e.target.value)}
            defaultValue={value}
            size={Math.min(value?.length || 30, 50)}
            placeholder={placeholder}
        ></input>
    )
}

const Record = ({ terminalId, keyv, value, onClick, editMode, newRecord, orderId, minimized, muted }: RecordProps) => {

    const [newRecordOpen, setNewRecordOpen] = useState(false)
    const [keyValue, setKeyValue] = useState<string | undefined>(keyv)
    const [keyPreviousValue] = useState<string | undefined>(keyv)
    const [valueValue, setValueValue] = useState<string | undefined>(value)
    const clickAwayRef = useRef<HTMLDivElement>(null)

    const { } = useClickWatcher(clickAwayRef, setNewRecordOpen)

    const handleClick = () => {
        if (editMode) return
        baseSocket.emit('environmentMute', { id: terminalId, key: keyValue, orderId })
    }

    const handleEdits = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!keyValue) return

        baseSocket.emit('environmentEdit',
            {
                id: terminalId,
                key: keyValue,
                previousKey: keyPreviousValue,
                value: valueValue,
                orderId,
                enabled: true
            })

        setNewRecordOpen(false)

    }



    return (
        <div className={`
        ${styles.recordRow}
        ${editMode ? styles.editMode : ''}
        ${minimized ? styles.minimized : ''}
        ${newRecord && !newRecordOpen ? styles.newRecord : ''}
        `}
            ref={clickAwayRef}
            onClick={(e) => onClick(keyValue, e)}
            onContextMenu={handleClick}

        >

            {newRecord && !newRecordOpen ? <GoPlusCircle
                size={20}
                color='var(--primary)'
                onClick={() => setNewRecordOpen(!newRecordOpen)}
                className={styles.addButton}
            /> :

                <>

                    <div className={`${styles.key} ${minimized ? styles.minimized : ''}`}>
                        <form onSubmit={handleEdits}>
                            <Field
                                value={keyv}
                                disabled={!editMode}
                                onChange={setKeyValue}
                                className='primary'
                                placeholder='KEY' />
                        </form>
                    </div>

                    {!minimized ? <div className={styles.value} >
                        <form onSubmit={handleEdits}>
                            <Field
                                value={value}
                                disabled={!editMode}
                                onChange={setValueValue}
                                muted={muted}
                                className='secondary'
                                placeholder='VALUE' />
                        </form>
                    </div> : muted ?
                        <BsDot size={20} color='var(--primary-accent)'
                            className={styles.dot}
                        /> : null}
                </>

            }

        </div>
    )


}



export default Record


