
import { FiEdit2 } from "react-icons/fi";
import styles from './newenvinput.module.css'
import { baseSocket } from "@renderer/service/socket";

type NewEnvInputProps = {
    envKey?: string
    envvalue?: string
    orderId: number
    terminalId: number
    style?: 'key' | 'value'
    onClose?: () => void

}


function NewEnvInput({ envKey, envvalue, terminalId, orderId, style = 'value', onClose }: NewEnvInputProps) {



    const handleEdits = (key: string | undefined, value: string, orderId: number, enabled = true) => {
        console.log('editev3ent')
        if (!key) {
            if (!value) return
            baseSocket.emit('environmentEdit',
                {
                    id: terminalId,
                    key: value,
                    value: "",
                    orderId,
                    enabled
                })
        }

        baseSocket.emit('environmentEdit', { id: terminalId, key, value, enabled, orderId })
        if (onClose) onClose()
    }

    return (
        <div className={styles.edit}>
            <FiEdit2 size={13} />
            <input
                autoFocus={true}
                type='text'
                className={`${styles.editField} ${style === 'key' ? styles.secondaryColors : ''}`}
                onBlur={(e) => handleEdits(envKey, e.target.value, orderId)}
                defaultValue={envvalue}
                disabled
            ></input>
        </div>
    )
}

export default NewEnvInput