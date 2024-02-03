import { GoPlusCircle } from 'react-icons/go'
import { FormEvent, useState } from 'react'
import { baseSocket } from '@renderer/service/socket'

type ListItemProps = {
  newRecord: boolean
  terminalId: number
  orderId: number
  minimized: boolean
  stackId: number
}

interface RecordProps extends ListItemProps {
  keyv?: string
  value?: string
  onClick: (key: string | undefined, e) => void
  editMode: boolean
  muted?: boolean
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
        ? `pr-2 text-secondary-foreground bg-transparent ${minimized ? 'truncate' : ''}`
        : ' pl-3 pr-3 bg-primary truncate text-secondary'
    }`

  if (disabled) return <p className={style}>{value}</p>

  return (
    <input
      type="text"
      className={`${style} px-3`}
      onChange={(e) => onChange(e.target.value)}
      defaultValue={value}
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
const Record = ({
  terminalId,
  stackId,
  keyv,
  value,
  onClick,
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

  const handleClick = () => {
    if (editMode) return
    baseSocket.emit('environmentMute', {
      stack: stackId,
      terminal: terminalId,
      value: keyValue,
      order: orderId
    })
  }

  const handleEdits = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!keyValue) return
    if (newRecordOpen && (!keyValue || !valueValue)) return
    baseSocket.emit('environmentEdit', {
      stack: stackId,
      terminal: terminalId,
      order: orderId,
      key: keyValue,
      previousKey: keyPreviousValue,
      value: valueValue,
      enabled: true
    })

    setNewRecordOpen(false)
  }

  return (
    <div
      className={`text-sm ${muted ? 'brightness-50' : ''}`}
      onClick={(e) => onClick(keyValue, e)}
      onContextMenu={handleClick}
    >
      {newRecord && !newRecordOpen ? (
        <GoPlusCircle
          size={20}
          color="var(--primary)"
          onClick={() => setNewRecordOpen(!newRecordOpen)}
          className="flex justify-center items-center w-full mt-2 hover:cursor-pointer"
        />
      ) : (
        <form
          onSubmit={handleEdits}
          onBlur={handleEdits}
          className="flex font-semibold justify-between bg-muted hover:cursor-pointer pl-3 rounded-full"
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
          <button hidden>hello</button>
        </form>
      )}
    </div>
  )
}

export default Record
