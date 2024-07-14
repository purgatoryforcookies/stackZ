import { CustomClientSocket } from '@t'

type ListItemProps = {
    orderId: number
    minimized: boolean
    socket: CustomClientSocket | undefined
}

interface RecordProps extends ListItemProps {
    keyv?: string
    value?: string
    muted?: boolean
    highlight?: boolean
    onDoubleClick?: () => void
    id: string
}

type FieldProps = {
    value?: string
    variant: 'primary' | 'secondary'
    minimized?: boolean
}

export const Field = ({
    value,
    variant,
    minimized
}: FieldProps) => {
    const style = `rounded-full py-1
    ${variant === 'primary'
            ? `px-3 text-secondary-foreground bg-transparent bg-[length:_150%_50%] ${minimized ? 'truncate' : ''}`
            : `px-3  truncate text-primary-foreground bg-primary
            }`
        }`

    return <p className={style}>{value}</p>

}

/**
 * Component shows key-value pair in a single row.
 * Can open editor on double click.
 *
 * Sends mute event to server to disable record.
 *
 * @param {string} minimized - Renders without value field
 */
const Record = ({
    socket,
    keyv,
    value,
    orderId,
    minimized,
    muted,
    onDoubleClick,
    id
}: RecordProps) => {


    const handleMute = () => {
        socket?.emit('environmentMute', {
            value: keyv,
            order: orderId,
            id: id
        })
    }

    return (
        <div
            className={`text-sm relative px-1 ${muted ? 'brightness-50' : ''}`}
            onContextMenu={handleMute}
            onDoubleClick={onDoubleClick}
        >
            <form
                className="flex font-semibold justify-between hover:cursor-pointer rounded-full bg-muted"
            >
                <Field
                    value={keyv}
                    variant="primary"
                    minimized={minimized}
                />
                {!minimized ? (
                    <Field
                        value={value}
                        variant="secondary"
                        minimized={minimized}
                    />
                ) : null}
            </form>

        </div>
    )
}

export default Record
