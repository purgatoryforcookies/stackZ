import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenu,
    ContextMenuSeparator,
    ContextMenuLabel,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger
} from "@renderer/@/ui/context-menu";
import { ThemeContext } from "@renderer/App";
import { IUseStack } from "@renderer/hooks/useStack";
import { Cmd } from "@t";
import { useContext } from "react";

type CommandContextMenuProps = {
    children: React.ReactNode
    stack: IUseStack
    terminal: Cmd
}

export default function CommandContextMenu({ children, stack, terminal }: CommandContextMenuProps) {

    const theme = useContext(ThemeContext)

    const startTerminal = () => window.api.startTerminal(stack.selectedStack, terminal.id)
    const stopTerminal = () => window.api.stopTerminal(stack.selectedStack, terminal.id)
    const deleteTerminal = () => window.api.deleteCommand(stack.selectedStack, terminal.id)

    const dublicateTo = async (stackId: string) => {
        const newTerminal = await window.api.createCommand(terminal, stackId)
        if (!newTerminal) return
        stack.addTerminal(newTerminal, stackId)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent data-theme={theme.theme} className="w-96">
                <ContextMenuItem inset onClick={startTerminal}>Start</ContextMenuItem>
                <ContextMenuItem inset onClick={stopTerminal}>Stop</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem inset>Copy to clipboard</ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger inset>Duplicate to</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        {stack.stack ? Array.from(stack.stack.values()).map(st => (
                            <ContextMenuItem
                                onClick={() => dublicateTo(st.id)}
                                key={st.id}
                                className="flex justify-between">
                                <p>
                                    {st.stackName}
                                </p>
                                <p className="text-white/40">
                                    x{st.palette?.length || 0}
                                </p>

                            </ContextMenuItem>
                        )) : null}
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuLabel className="text-white/40" inset>
                    <p className="text-[0.7rem]">Terminal</p>
                    {terminal.id}
                </ContextMenuLabel>
                <ContextMenuLabel className="text-white/40" inset>
                    <p className="text-[0.7rem]">Stack</p>
                    {stack.selectedStack}
                </ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem inset onClick={deleteTerminal}>Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
