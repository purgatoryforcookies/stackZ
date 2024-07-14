import { DialogDescription } from "@radix-ui/react-dialog"
import { Button } from "@renderer/@/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/@/ui/dialog"
import { Textarea } from "@renderer/@/ui/textarea"
import { ThemeContext } from "@renderer/App"
import { Cmd, CustomClientSocket } from "@t"
import { useContext, useEffect, useState } from "react"


type EnvEditorProps = {
    setOpen: (open: boolean) => void
    editorOpen?: boolean
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}


/**
 * Editor for environment.
 * Submits changes to the server on close. 
 */
function EnvEditor({ setOpen, editorOpen, data, socket, id }: EnvEditorProps) {

    const theme = useContext(ThemeContext)

    const [oldText, setOldText] = useState<string>('')
    const [text, setText] = useState<string>('')

    useEffect(() => {
        let existingText = ""
        Object.keys(data.pairs).map(key => {
            existingText += `${key}=${data.pairs[key]}\n`
        })
        existingText = existingText.trimEnd()
        setText(existingText)
        setOldText(existingText)
    }, [editorOpen])



    const handleSave = () => {

        const enc = new TextEncoder()
        const environtAsBuffer = enc.encode(text)

        socket.emit('environmentListEdit', {
            value: data.title,
            id: id,
            fromFile: environtAsBuffer,
            order: data.order
        })

        setOpen(false)
        // Clear text after dialog close animation has ended
        setTimeout(() => {
            setText('')
        }, 300);

    }


    const placeHolderTexts = [
        'Separate key value pairs with new lines. Example:',
        'KEY=VALUE',
        'KEY=LONG VALUE',
        'KEY="VALUES WITH QUOTES"',
        'KEYWITHNOVALUE=',
        'KEY  =   ARBITURARY SPACES',
    ]

    return (
        <Dialog open={editorOpen} onOpenChange={setOpen}>
            <DialogContent data-theme={theme.theme} className="min-w-[900px] min-h-[600px] rounded-sm">
                <DialogHeader>
                    <DialogTitle>Environment editor</DialogTitle>
                    <DialogDescription className="pb-8">{data.title}</DialogDescription>
                    <div className="h-full pb-10">
                        <Textarea
                            className="w-full h-full resize-none"
                            placeholder={placeHolderTexts.join('\n')}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            spellCheck={false}
                        />
                        <Button
                            onClick={handleSave}
                            className="mt-4 w-full"
                            disabled={oldText === text}
                        >Save</Button>
                    </div>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}

export default EnvEditor