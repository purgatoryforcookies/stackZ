import { GoPlusCircle } from 'react-icons/go'
import { FormEvent, useRef, useState } from 'react'
import { useClickWatcher } from '@renderer/hooks/useClickWatcher'
import { baseSocket } from '@renderer/service/socket'


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
    variant: 'primary' | 'secondary',
    placeholder?: string
    muted?: boolean
    minimized?: boolean
}


export const Field = ({ value, disabled, onChange, variant, placeholder, minimized }: FieldProps) => {

    const style = `rounded-full py-1
    ${variant === 'primary' ?
            `pr-2 text-secondary-foreground bg-transparent ${minimized ? 'truncate' : ''}` :
            ' pl-3 pr-3 bg-primary truncate text-secondary'}`


    if (disabled) return (
        <p className={style}>
            {value}
        </p>
    )

    return (
        <input
            // autoFocus={variant === 'primary'}
            type='text'
            className={`${style} px-3`}
            onChange={(e) => onChange(e.target.value)}
            defaultValue={value}
            // size={Math.min(value?.length || 30, 50)}
            placeholder={placeholder}
        ></input>
    )
}

/**
 * Component shows key-value pair in a single row.
 * Can edit and create new records.
 * 
 * Sends changes to server.
 * 
 * @param {boolean} editMode - Fields become input fields to enable editing
 * @param {boolean} newRecord - Renders a new empty record
 * @param {string} minimized - Renders without value field
 */
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
        <div className={`text-sm ${muted ? 'brightness-50' : ''}`}
            ref={clickAwayRef}
            onClick={(e) => onClick(keyValue, e)}
            onContextMenu={handleClick}>
            {newRecord && !newRecordOpen ? <GoPlusCircle
                size={20}
                color='var(--primary)'
                onClick={() => setNewRecordOpen(!newRecordOpen)}
                className='flex justify-center items-center w-full mt-2 hover:cursor-pointer'
            /> :
                <form onSubmit={handleEdits}
                    className='flex font-semibold justify-between bg-muted hover:cursor-pointer pl-3 rounded-full'>
                    <Field
                        value={keyv}
                        disabled={!editMode}
                        onChange={setKeyValue}
                        variant='primary'
                        placeholder='KEY'
                        minimized={minimized} />

                    {!minimized ?
                        <Field
                            value={value}
                            disabled={!editMode}
                            onChange={setValueValue}
                            muted={muted}
                            variant='secondary'
                            placeholder='VALUE' />
                        : null}
                </form>
            }
        </div>
    )


}



export default Record


