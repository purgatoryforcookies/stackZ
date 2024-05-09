import { FormEvent, useContext, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@renderer/@/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import { Label } from '@radix-ui/react-label'
import { Button } from '@renderer/@/ui/button'
import { Input } from '@renderer/@/ui/input'
import { ThemeContext } from '@renderer/App'
import { Badge } from '@renderer/@/ui/badge'
import { IUseStack } from '@renderer/hooks/useStack'
import { Cmd, RecursivePartial } from '@t'


type NewCommandProps = {
    stack: IUseStack
}

function NewCommand({ stack }: NewCommandProps) {
    const [open, setOpen] = useState(false)
    const theme = useContext(ThemeContext)

    const [command, setCommand] = useState<RecursivePartial<Cmd>>()

    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!command) return
        if (command?.title?.length === 0) return
        const newCommand = await window.api.createCommand(command, stack.selectedStack)
        setOpen(false)
        setCommand(undefined)
        stack.addTerminal(newCommand)
    }

    useEffect(() => {
        setCommand(undefined)
    }, [open])

    const handleChange = (e: FormEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget

        const newCommand = { ...command }
        if (name === 'title') {
            newCommand[name] = value
        } else {
            if (!newCommand.command) {
                newCommand.command = {}
            }
            newCommand.command[name] = value
        }

        setCommand(newCommand as Cmd)

    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Badge
                    variant={'outline'}
                    className={`hover:bg-primary hover:text-background 
                        hover:cursor-pointer`}
                >
                    <PlusIcon className="h-5 w-5" />
                </Badge>
            </DialogTrigger>
            <DialogContent data-theme={theme.theme}>
                <DialogHeader>
                    <DialogTitle>New Command</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSave}
                    className="flex gap-5 text-secondary-foreground flex-col"
                >
                    <div className="grid gap-4 py-2 w-full">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Notes
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                name="title"
                                onChange={handleChange}
                                value={command?.title || ''}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="command" className="text-right">
                                Command
                            </Label>
                            <Input
                                id="command"
                                className="col-span-3"
                                placeholder="Optional"
                                name="cmd"
                                onChange={handleChange}
                                value={command?.command?.cmd || ''}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Shell
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                name="shell"
                                onChange={handleChange}
                                placeholder="Optional"
                                value={command?.command?.shell || ''}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                CWD
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                name="cwd"
                                onChange={handleChange}
                                placeholder="Optional"
                                value={command?.command?.cwd || ''}
                            />
                        </div>
                    </div>
                    <DialogFooter className="w-full">
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default NewCommand
