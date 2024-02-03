import { FormEvent, useContext, useState } from 'react'
import { Cmd } from 'src/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type NewCommandProps = {
  afterAdd: (cmd: Cmd) => void
  stackId: number
}

function NewCommand({ afterAdd, stackId }: NewCommandProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState<string>('')
  const [shell, setShell] = useState<string>('')
  const [cwd, setCwd] = useState<string>('')
  const theme = useContext(ThemeContext)

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (title.length === 0) return
    const newCommand = await window.api.createCommand(title, stackId)
    setOpen(false)
    setTitle('')
    afterAdd(newCommand)
    console.log('newCommand', newCommand)
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
      <DialogContent data-theme={theme}>
        <DialogHeader>
          <DialogTitle>New Command</DialogTitle>
          <DialogDescription>Create new</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSave}
          className="flex gap-5 text-secondary-foreground flex-col"
          onReset={() => setTitle('')}
        >
          <div className="grid gap-4 py-2 w-full">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Shell
              </Label>
              <Input
                id="name"
                className="col-span-3"
                onChange={(e) => setShell(e.target.value)}
                placeholder="Optional"
                value={shell}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                CWD
              </Label>
              <Input
                id="name"
                className="col-span-3"
                onChange={(e) => setCwd(e.target.value)}
                placeholder="Optional"
                value={cwd}
              />
            </div>
          </div>
          <DialogFooter className="w-full">
            <Button type="submit" disabled={title.length === 0}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewCommand
