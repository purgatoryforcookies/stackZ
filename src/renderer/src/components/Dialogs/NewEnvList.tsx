import { Cross1Icon, FileIcon, PlusIcon } from '@radix-ui/react-icons'
import { Button } from '@renderer/@/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@renderer/@/ui/dialog'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import { ThemeContext } from '@renderer/App'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { UtilityEvents } from '@t'
import { useContext, useState } from 'react'

type NewEnvListProps = {
    scroll: () => void
    terminal: TerminalUIEngine
}

export function NewEnvList({ scroll, terminal }: NewEnvListProps) {
    const [title, setTitle] = useState<string>('')
    const [file, setFile] = useState<File | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [dragover, setDragover] = useState<boolean>(false)

    const theme = useContext(ThemeContext)

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let buf: ArrayBuffer | null = null
        if (file) buf = await file.arrayBuffer()
        terminal.socket.emit(UtilityEvents.ENVLIST, { value: title, fromFile: buf })
        setTitle('')
        scroll()
        setOpen(false)
    }


    const handleFileChange = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragover(false)
        const fileGrab = event.dataTransfer?.files[0];
        if (fileGrab) {
            setFile(fileGrab)
            setOpen(true)
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div
                    onDrop={handleFileChange}
                    onDragEnter={() => setDragover(true)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setDragover(false)}
                    className={`size-32 flex items-center justify-center animate-in animate-out ${dragover ? 'border-2' : ''}`}>
                    <PlusIcon className="h-8 w-8 hover:cursor-pointer hover:text-primary text-secondary-foreground" />
                </div>
            </DialogTrigger>
            <DialogContent data-theme={theme}>
                <DialogHeader>
                    <DialogTitle>New Environment</DialogTitle>
                    <DialogDescription>Create new</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={handleAdd}
                    className="flex gap-5 text-secondary-foreground flex-col"
                    onReset={() => setTitle('')}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                            />
                        </div>
                    </div>
                    <DialogFooter className="relative">
                        <div className='flex items-center'>
                            {file ? <span className='flex gap-1 absolute left-0'>
                                <FileIcon className="h-4 w-4" />
                                {file?.name}
                                <Cross1Icon className="h-4 w-4 hover:cursor-pointer" onClick={() => setFile(null)} />
                            </span> : null}
                            <Button type="submit" disabled={title.length === 0}>
                                Save
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
