import { CheckedState } from '@radix-ui/react-checkbox'
import { Cross1Icon, FileIcon, PlusIcon } from '@radix-ui/react-icons'
import { Button } from '@renderer/@/ui/button'
import { Checkbox } from '@renderer/@/ui/checkbox'
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
import { useDebounce } from '@renderer/hooks/useDebounce'
import useLocalStorage from '@renderer/hooks/useLocalStorage'
import { IUseStack } from '@renderer/hooks/useStack'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { useContext, useEffect, useState } from 'react'

type NewEnvListProps = {
    scroll: () => void
    terminal: TerminalUIEngine
    stack: IUseStack
}

export function NewEnvList({ scroll, terminal, stack }: NewEnvListProps) {
    const [title, setTitle] = useState<string>('')
    const [file, setFile] = useState<File | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [dragover, setDragover] = useState<boolean>(false)
    const [global, setGlobal] = useState<CheckedState>(false)

    const theme = useContext(ThemeContext)

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let buf: ArrayBuffer | null = null
        if (file) buf = await file.arrayBuffer()
        terminal.socket.emit('environmentList', {
            value: title,
            fromFile: buf,
            id: global ? stack.selectedStack : null
        })

        setTitle('')
        scroll()
        setOpen(false)
        setFile(null)
    }

    const handleFileChange = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragover(false)
        const fileGrab = event.dataTransfer?.files[0]
        if (fileGrab) {
            setFile(fileGrab)
        }
        setOpen(true)
    }

    const { read, write } = useLocalStorage()

    /**
     * Testing this out. Highlight the dropzone for user
     * in semi-random times.
     */
    useEffect(() => {
        let timestamp = read('since')
        if (!timestamp) {
            const now = new Date().toISOString()
            write('since', now)
            timestamp = now
        }
        const today = new Date()
        const since = new Date(timestamp)
        if (today.getSeconds() - since.getSeconds() > 60 * 60 * 24) {
            setDragover(true)
            setTimeout(() => {
                setDragover(false)
            }, 10000)
            write('since', new Date().toISOString())
        }
    }, [terminal])

    const handleEnter = useDebounce(dragover, 100)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div
                    onDrop={handleFileChange}
                    onDragOver={(e) => {
                        e.preventDefault(), setDragover(true)
                    }}
                    onDragLeave={() => setDragover(false)}
                    className="size-32"
                >
                    <div
                        className={`
                    p-[1px] 
                    ${
                        !handleEnter
                            ? 'bg-transparent'
                            : `animate-border  bg-gradient-to-r
                  from-[#ede5c2e6] via-[#e2e0d74e] to-[#e1d7b076] hover:cursor-pointer bg-[length:_700%_900%]
                    p-0 flex justify-center items-center`
                    }
                    z-10 size-32 rounded-[7.5px]`}
                    >
                        <span
                            className={`
                        ${!handleEnter ? 'bg-transparent' : 'bg-gradient'}
                        text-center rounded-[6px] px-2 
                        h-[calc(100%-2px)] 
                        w-[calc(100%-2px)] 
                        bg-[length:_800%_800%] flex justify-center items-center`}
                        >
                            <PlusIcon className=" h-8 w-8 hover:cursor-pointer hover:text-primary text-secondary-foreground" />
                            {handleEnter ? (
                                <span className="text-secondary-foreground ">Dropzone</span>
                            ) : null}
                        </span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent data-theme={theme.theme}>
                <DialogHeader>
                    <DialogTitle>Environment</DialogTitle>
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
                        <div className="flex items-center">
                            <div className="flex gap-1 pr-5">
                                <Checkbox
                                    id="sequencing"
                                    checked={global}
                                    onCheckedChange={(e) => setGlobal(e)}
                                />
                                <Label htmlFor="sequencing" className="flex items-center gap-2">
                                    Stack environment
                                </Label>
                            </div>
                            {file ? (
                                <span className="flex gap-1 absolute left-0">
                                    <FileIcon className="h-4 w-4" />
                                    {file?.name}
                                    <Cross1Icon
                                        className="h-4 w-4 hover:cursor-pointer"
                                        onClick={() => setFile(null)}
                                    />
                                </span>
                            ) : null}
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
