import { Button } from '@renderer/@/ui/button'
import { Cmd, CustomClientSocket } from '@t'
import { useEffect, useState } from 'react'
import CodeEditor from '../CodeEditor'

type LocalEnvEditorProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
    setOpen: (open: boolean) => void
}

function LocalEnvEditor({ data, socket, id, setOpen }: LocalEnvEditorProps) {
    const [oldText, setOldText] = useState<string>('')
    const [text, setText] = useState<string>('')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        let existingText = ''
        Object.keys(data.pairs).map((key) => {
            existingText += `${key}=${data.pairs[key]}\n`
        })
        existingText = existingText.trimEnd()
        setText(existingText)
        setOldText(existingText)
    }, [])

    const handleSave = () => {
        const enc = new TextEncoder()
        const environtAsBuffer = enc.encode(text)

        socket.emit(
            'environmentListEdit',
            {
                id: id,
                fromFile: environtAsBuffer,
                order: data.order
            },
            (error) => {
                if (error) {
                    setError(error)
                } else {
                    setOpen(false)
                    // Clear text after dialog close animation has ended
                    setTimeout(() => {
                        setText('')
                    }, 300)
                }
            }
        )
    }


    return (
        <>
            {error ? <p>{error}</p> : null}
            <div className="h-full">
                {/* <Textarea
                    className="w-full h-full resize-none"
                    placeholder={placeHolderTexts.join('\n')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    spellCheck={false}
                /> */}
                <CodeEditor text={text} setText={setText} />
            </div>
            <Button
                onClick={handleSave}
                className="mt-4 w-full"
                disabled={oldText === text && !data.remote}
            >
                Save
            </Button>
        </>
    )
}

export default LocalEnvEditor
