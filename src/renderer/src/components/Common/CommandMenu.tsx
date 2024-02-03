import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut
} from '@renderer/@/ui/command'
import { useContext, useEffect, useState } from 'react'
import { PaletteStack, SelectionEvents } from '../../../../types'
import { ButtonIcon, GlobeIcon, LayersIcon } from '@radix-ui/react-icons'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@renderer/@/ui/tooltip'
import { Separator } from '@renderer/@/ui/separator'
import { ThemeContext } from '@renderer/App'

type CommandMenuProps = {
  stack: Map<string, PaletteStack> | undefined
  dispatch: (stackId: string, terminalId: number, method: SelectionEvents, cb?: () => void) => void
}

export function CommandMenu({ stack, dispatch }: CommandMenuProps) {
  const theme = useContext(ThemeContext)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen} data-theme={theme}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            Hide/show env explorer
            <CommandShortcut>Alt+X</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Hide/show palette
            <CommandShortcut>Alt+Z</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <Separator />
        {/* <CommandGroup heading="New">
                    <CommandItem>Terminal</CommandItem>
                    <CommandItem>Environment</CommandItem>
                </CommandGroup> */}
        <Separator />
        <CommandGroup heading="Stacks">
          {stack
            ? [...stack.values()].map((stack) => {
              return (
                <CommandItem
                  key={stack.id}
                  className="flex gap-5"
                  value={stack.id + stack.stackName}
                  onSelect={() => {
                    dispatch(stack.id, 1, SelectionEvents.CONN, () => {
                      setOpen(false)
                    })
                  }}
                >
                  <span>{stack.palette?.length ?? 0}x</span>
                  <LayersIcon className="mr-2 h-4 w-4" />
                  <div className="flex justify-between w-full">
                    <span>
                      #{stack.id}: {stack.stackName}
                    </span>
                    {stack.env?.length && stack.env.length > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <GlobeIcon />
                          </TooltipTrigger>

                          <TooltipContent side={'left'}>
                            <p>Has global environments</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </div>
                </CommandItem>
              )
            })
            : null}
        </CommandGroup>
        <Separator />
        <CommandGroup heading="Terminals">
          {stack
            ? [...stack.values()].map((stack) => {
              if (!stack.palette) return null
              return stack.palette.map((cmd) => {
                return (
                  <CommandItem
                    key={String(stack.id) + String(cmd.id)}
                    className="flex gap-5"
                    value={cmd.title + cmd.command.cmd + cmd.command.cwd + stack.stackName}
                    onSelect={() => {
                      dispatch(stack.id, cmd.id, SelectionEvents.CONN, () => {
                        setOpen(false)
                      })
                    }}
                  >
                    <ButtonIcon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>
                        #{cmd.id}: {cmd.title}
                      </span>
                      <div className="flex flex-col">
                        <span>{cmd.command.cmd}</span>
                        <span>@{cmd.command.cwd}</span>
                        <span>
                          stack: #{stack.id} - {stack.stackName}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                )
              })
            })
            : null}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
