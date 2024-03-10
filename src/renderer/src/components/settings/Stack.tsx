import { Button } from '@renderer/@/ui/button'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import { IUseStack } from '@renderer/hooks/useStack'
import { ClientEvents, StackDefaultsProps, StackStatus, UtilityEvents } from '@t'
import { useEffect, useState } from 'react'

function Stack({ stack, close }: { stack: IUseStack; close: () => void }) {
    const [name, setName] = useState(stack.stack?.get(stack.selectedStack)?.stackName)
    const [defShell, setDefShell] = useState<string>()
    const [defCommand, setDefCommand] = useState<string>()
    const [defCwd, setDefCwd] = useState<string>()
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)

    useEffect(() => {
        stack.stackSocket
            .get(stack.selectedStack)
            ?.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
                setDefCwd(d.cwd)
                setDefShell(d.shell)
                setDefCommand(d.cmd)
            })
        stack.stackSocket.get(stack.selectedStack)?.emit(UtilityEvents.STACKSTATE)

        return () => {
            stack.stackSocket.get(stack.selectedStack)?.off(ClientEvents.STACKSTATE)
        }
    }, [])

    const handleSave = () => {
        const newDefaults: StackDefaultsProps = {
            defaultCwd: defCwd,
            defaultShell: defShell,
            defaultCommand: defCommand
        }
        stack.stackSocket.get(stack.selectedStack)?.emit(UtilityEvents.STACKDEFAULTS, newDefaults)
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        stack.stackSocket
            .get(stack.selectedStack)
            ?.emit(UtilityEvents.STACKNAME, { name: e.target.value })
        stack.renameStack(e.target.value)
        setName(e.target.value)
    }

    const handleDelete = () => {
        if (deleteConfirmation) {
            window.api.deleteStack(stack.selectedStack)
            stack.deleteStack()
            close()
        } else {
            setDeleteConfirmation(true)
        }
    }

    return (
        <div className="py-8">
            <Label className="text-right">Stack</Label>
            <div className="grid gap-4 py-4 ">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="name"
                        placeholder="path..."
                        defaultValue={name}
                        className="col-span-3 text-secondary-foreground"
                        onChange={handleNameChange}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cwd" className="text-right">
                        Default CWD
                    </Label>
                    <Input
                        id="cwd"
                        placeholder="path..."
                        value={defCwd}
                        className="col-span-3 text-secondary-foreground"
                        onChange={(e) => setDefCwd(e.target.value || undefined)}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shell" className="text-right">
                        Default Shell
                    </Label>
                    <Input
                        id="shell"
                        placeholder="path..."
                        value={defShell}
                        className="col-span-3 text-secondary-foreground"
                        onChange={(e) => setDefShell(e.target.value || undefined)}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="command" className="text-right">
                        Default Command
                    </Label>
                    <Input
                        id="command"
                        placeholder="command..."
                        value={defCommand}
                        className="col-span-3 text-secondary-foreground"
                        onChange={(e) => setDefCommand(e.target.value || undefined)}
                    />
                </div>
                <div className="flex justify-between py-6 px-4 ">
                    <Button
                        variant={deleteConfirmation ? 'destructive' : 'link'}
                        onClick={handleDelete}
                        tabIndex={-1}
                        onBlur={() => setDeleteConfirmation(false)}
                        className={`w-28 ${deleteConfirmation ? '' : 'text-secondary-foreground/50'}`}
                    >
                        {deleteConfirmation ? 'Confirm?' : 'Delete Stack'}
                    </Button>
                    <Button variant={'default'} onClick={handleSave} className="w-28">
                        Save changes
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Stack
