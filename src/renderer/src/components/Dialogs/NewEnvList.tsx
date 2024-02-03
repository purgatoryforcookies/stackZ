import { PlusIcon } from '@radix-ui/react-icons'
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
import { baseSocket } from '@renderer/service/socket'
import { useContext, useState } from 'react'

type NewEnvListProps = {
  scroll: () => void
  stackId: number
  terminalId: number
}

export function NewEnvList({ scroll, terminalId, stackId }: NewEnvListProps) {
  const [title, setTitle] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const theme = useContext(ThemeContext)

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    baseSocket.emit('environmentList', { stack: stackId, terminal: terminalId, value: title })
    setTitle('')
    scroll()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <PlusIcon className="h-8 w-8 hover:cursor-pointer hover:text-primary text-secondary-foreground" />
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
