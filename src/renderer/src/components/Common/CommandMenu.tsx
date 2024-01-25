import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@renderer/@/ui/command"
import { useEffect, useState } from "react"
import { ExtendedCmd, SelectionEvents } from "../../../../types"
import { ComponentNoneIcon } from "@radix-ui/react-icons"

type CommandMenuProps = {
    terminals: ExtendedCmd
    dispatch: (id: number, method: SelectionEvents, cb?: (...args: any) => void) => void,
    theme: string | undefined
}


export function CommandMenu({ terminals, dispatch, theme }: CommandMenuProps) {
    const [open, setOpen] = useState(false)



    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    //TODO: Finish these options
    return (
        <CommandDialog open={open} onOpenChange={setOpen} data-theme={theme}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>Hide/show env explorer</CommandItem>
                    <CommandItem>Hide/show palette</CommandItem>
                    <CommandItem>*terminal</CommandItem>
                    <CommandItem>*environment</CommandItem>
                    <CommandItem>Start</CommandItem>
                    <CommandItem>Stop</CommandItem>
                </CommandGroup>
                <CommandGroup heading="Terminals" >
                    {terminals ? [...terminals.values()].map(term => {
                        return <CommandItem key={term.id} onSelect={() => {

                            dispatch(term.id, SelectionEvents.CONN, () => {
                                setOpen(false)
                            })
                        }}>
                            <ComponentNoneIcon className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                                <span>#{term.id}: {term.title}</span>
                                <span>{term.command.cmd} @ {term.command.cwd}</span>

                            </div>
                            <CommandShortcut>⌘P</CommandShortcut>

                        </CommandItem>

                    }) : null}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}