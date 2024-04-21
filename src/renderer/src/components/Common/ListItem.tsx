import { GoPlus } from 'react-icons/go'
import { FormEvent, useState } from 'react'
import { Input } from '@renderer/@/ui/input'
import { Cross1Icon } from '@radix-ui/react-icons'
import { UtilityEvents } from '@t'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'

type ListItemProps = {
    newRecord: boolean
    orderId: number
    minimized: boolean
    terminal: TerminalUIEngine
}

interface RecordProps extends ListItemProps {
    keyv?: string
    value?: string
    editMode: boolean
    muted?: boolean
    highlight?: boolean
}

type FieldProps = {
    value?: string
    disabled: boolean
    onChange: (value: string) => void
    variant: 'primary' | 'secondary'
    placeholder?: string
    muted?: boolean
    minimized?: boolean
}

export const Field = ({
    value,
    disabled,
    onChange,
    variant,
    placeholder,
    minimized
}: FieldProps) => {
    const style = `rounded-full py-1
    ${
        variant === 'primary'
            ? `px-3 text-secondary-foreground bg-transparent bg-[length:_150%_50%] ${minimized ? 'truncate' : ''}`
            : `px-3  truncate text-primary-secondary bg-primary
            }`
    }`

    if (disabled) return <p className={style}>{value}</p>

    return (
        <Input
            type="text"
            className={`${style} h-9 w-[20rem] ${variant === 'primary' ? 'pl-8' : ''}`}
            onChange={(e) => onChange(e.target.value)}
            defaultValue={value || ''}
            placeholder={placeholder}
            autoFocus={variant === 'primary' && !value}
        />
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
const Record = ({
    terminal,
    keyv,
    value,
    editMode,
    newRecord,
    orderId,
    minimized,
    muted
}: RecordProps) => {
    const [newRecordOpen, setNewRecordOpen] = useState(false)
    const [keyValue, setKeyValue] = useState<string | undefined>(keyv)
    const [keyPreviousValue] = useState<string | undefined>(keyv)
    const [valueValue, setValueValue] = useState<string | undefined>(value)

    const handleMute = () => {
        if (editMode) return
        terminal.socket.emit(UtilityEvents.ENVMUTE, {
            value: keyValue,
            order: orderId
        })
    }

    const handleEdits = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (newRecordOpen && (!keyValue || !valueValue)) return
        terminal.socket.emit(UtilityEvents.ENVEDIT, {
            order: orderId,
            key: keyValue,
            previousKey: keyPreviousValue,
            value: valueValue,
            enabled: true
        })
        setNewRecordOpen(false)
    }

    const handleDelete = () => {
        terminal.socket.emit(UtilityEvents.ENVDELETE, {
            order: orderId,
            value: keyValue
        })
    }

    return (
        <div
            className={`text-sm relative px-1 ${muted ? 'brightness-50' : ''}`}
            onContextMenu={handleMute}
        >
            {editMode && !newRecordOpen && !newRecord ? (
                <Cross1Icon
                    onClick={handleDelete}
                    className="absolute left-[13px] top-[9px] w-4 h-4 hover:text-red-600 hover:cursor-pointer hover:scale-110"
                />
            ) : null}
            {newRecord && !newRecordOpen ? (
                <GoPlus
                    size={20}
                    onClick={() => setNewRecordOpen(!newRecordOpen)}
                    className="flex justify-center items-center w-full mt-2 hover:cursor-pointer text-secondary-foreground"
                />
            ) : (
                <form
                    onSubmit={handleEdits}
                    onBlur={handleEdits}
                    className="flex font-semibold justify-between hover:cursor-pointer rounded-full bg-muted"
                >
                    <Field
                        value={keyv}
                        disabled={!editMode}
                        onChange={setKeyValue}
                        variant="primary"
                        placeholder="KEY"
                        minimized={minimized}
                    />

                    {!minimized ? (
                        <Field
                            value={value}
                            disabled={!editMode}
                            onChange={setValueValue}
                            muted={muted}
                            variant="secondary"
                            placeholder="VALUE"
                        />
                    ) : null}
                </form>
            )}
        </div>
    )
}

export default Record
