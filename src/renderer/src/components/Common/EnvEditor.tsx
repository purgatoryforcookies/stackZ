import { DialogDescription } from "@radix-ui/react-dialog"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Button } from "@renderer/@/ui/button"
import { Checkbox } from "@renderer/@/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/@/ui/dialog"
import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import { Separator } from "@renderer/@/ui/separator"
import { Switch } from "@renderer/@/ui/switch"
import { Textarea } from "@renderer/@/ui/textarea"
import { ThemeContext } from "@renderer/App"
import { Cmd, CustomClientSocket } from "@t"
import { useContext, useEffect, useState } from "react"
import { CustomToolTip } from "./CustomTooltip"


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
    const [integrated, setIntegrated] = useState<boolean>(false)

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
        <Dialog open={!editorOpen} onOpenChange={setOpen}>
            <DialogContent data-theme={theme.theme} className="
            max-w-[1100px] max-h-[700px] 
            w-[70%] h-[80%] 
            min-w-[200px] min-h-[300px] 
            rounded-sm
            flex flex-col justify-between
            overflow-auto
            ">
                <DialogHeader className="pb-1">
                    <DialogTitle>Environment editor</DialogTitle>
                    <DialogDescription>{data.title}</DialogDescription>
                    <div className="w-full flex justify-end gap-2 items-center h-7">
                        <Switch id="integrated" onCheckedChange={setIntegrated} />
                        <Label htmlFor="integrated">Integrated</Label>
                    </div>
                </DialogHeader>
                {!integrated ? <div className="h-full">
                    <Textarea
                        className="w-full h-full resize-none"
                        placeholder={placeHolderTexts.join('\n')}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        spellCheck={false}
                    />
                </div> :
                    <div className="h-full md:grid flex flex-col grid-cols-[45%_55%] grid-rows-[60%_20%_20%] gap-5 p-2">
                        <div className="col-start-1 row-start-1 mt-10">
                            <p>Integrated environement set looks for external sources for the variables. This can be either a file or a service provider.</p>
                            <p>Environment variables are not saved into stackZ, they are fetched on-the-fly keeping them up to date.</p>

                        </div>
                        <div className="col-start-1 row-start-2">
                            <Input placeholder="File path | command" />
                            <Button
                                onClick={handleSave}
                                className="mt-4 float-right mr-2"
                                disabled={oldText === text}
                            >Preview</Button>
                        </div>
                        <div className="col-start-1 row-start-3 flex justify-end">

                            <div className="flex items-center space-x-2">

                                <Checkbox
                                // checked={settings?.cmd.metaSettings?.halt || false}
                                // onCheckedChange={(e) => onChange('halt', e)}
                                />
                                <Label htmlFor="halt" className="flex items-center gap-2">
                                    Automatic refresh
                                    <CustomToolTip message="If you let stackZ keep the set fresh, variables are refreshed on every terminal start. Otherwise you will have to do it manually.">
                                        <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                                    </CustomToolTip>
                                </Label>
                            </div>
                        </div>

                        <div className="row-span-3 col-start-2 row-start-1 
                        flex items-center gap-7 
                        flex-col md:flex-row 
                        h-[600px] md:h-auto">
                            <Separator orientation="vertical" className="hidden md:block h-[90%]" />
                            <Separator orientation="horizontal" className="md:hidden block" />
                            <div className="pb-10 w-full h-full">
                                <Label htmlFor="integrated-preview">Preview</Label>
                                <Textarea
                                    id="integrated-preview"
                                    disabled
                                    className="w-full h-full resize-none"
                                    placeholder={placeHolderTexts.join('\n')}
                                    value={text}
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                    </div>

                }
                <Button
                    onClick={handleSave}
                    className="mt-4 w-full"
                    disabled={oldText === text}
                >Save</Button>

            </DialogContent>
        </Dialog>
    )
}

export default EnvEditor