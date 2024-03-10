import { PlusIcon } from '@radix-ui/react-icons'
import { Badge } from '@renderer/@/ui/badge'
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
import { useContext, useState } from 'react'
import { PaletteStack } from '@t'

type NewStack = {
    set: (st: PaletteStack) => void
}

export function NewStack({ set }: NewStack) {
    const [name, setName] = useState<string>('')
    const [open, setOpen] = useState<boolean>(false)

    const theme = useContext(ThemeContext)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newStack = await window.api.createStack(name)
        set(newStack)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Badge
                    variant={'outline'}
                    className={`hover:bg-primary hover:text-background 
                        hover:cursor-pointer`}
                >
                    <PlusIcon className="h-4 w-4" />
                </Badge>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" data-theme={theme}>
                <DialogHeader>
                    <DialogTitle>New Stack</DialogTitle>
                    <DialogDescription>Create new</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex gap-5 text-secondary-foreground flex-col"
                    onReset={() => setName('')}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Keep it short!"
                                className="col-span-3"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shell" className="text-right">
                                Default command
                            </Label>
                            <Input
                                id="shell"
                                value="Not supported"
                                disabled
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shell" className="text-right">
                                Default shell
                            </Label>
                            <Input
                                id="shell"
                                value="Not supported"
                                disabled
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shell" className="text-right">
                                Default cwd
                            </Label>
                            <Input
                                id="shell"
                                value="Not supported"
                                disabled
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={name.length === 0}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
