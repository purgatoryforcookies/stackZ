import { DialogDescription } from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@renderer/@/ui/dialog'
import { Label } from '@renderer/@/ui/label'
import { Switch } from '@renderer/@/ui/switch'
import { ThemeContext } from '@renderer/App'
import { Cmd, CustomClientSocket } from '@t'
import { useContext, useEffect, useState } from 'react'
import RemoteEnvEditor from './RemoteEnvEditor'
import LocalEnvEditor from './LocalEnvEditor'

type EnvEditorProps = {
    setOpen: (open: boolean) => void
    editorOpen?: boolean
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
}
export const NAME_FOR_OS_ENV_SET = 'OS Environment'

/**
 * Editorbody for local and remote environment editing.
 * Submits changes to the server on save.
 */
function EnvEditor({ setOpen, editorOpen, data, socket, id }: EnvEditorProps) {
    const theme = useContext(ThemeContext)

    const [remote, setRemote] = useState<boolean>(false)

    useEffect(() => {
        setRemote(data.remote ? true : false)
    }, [editorOpen])

    return (
        <Dialog open={editorOpen} onOpenChange={setOpen}>
            <DialogContent
                data-theme={theme.theme}
                className="
            max-w-[1100px] max-h-[700px] 
            w-[70%] h-[80%] 
            min-w-[200px] min-h-[300px] 
            rounded-sm
            flex flex-col 
            overflow-auto
            "
            >
                <DialogHeader className="pb-1">
                    <DialogTitle>Environment editor</DialogTitle>
                    <DialogDescription>{data.title}</DialogDescription>
                    <div className="w-full flex gap-2 items-center justify-end pr-2">
                        <Switch
                            id="integrated"
                            onCheckedChange={setRemote}
                            checked={remote}
                            disabled={data.title === NAME_FOR_OS_ENV_SET}
                        />
                        <Label htmlFor="integrated">Remote</Label>
                    </div>
                </DialogHeader>

                {!remote ? (
                    <LocalEnvEditor data={data} socket={socket} id={id} setOpen={setOpen} />
                ) : (
                    <RemoteEnvEditor socket={socket} data={data} id={id} setOpen={setOpen} />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EnvEditor
