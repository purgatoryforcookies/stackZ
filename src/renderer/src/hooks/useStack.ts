import { TerminalUIEngine } from "@renderer/service/TerminalUIEngine"
import { useEffect, useState } from "react"
import { Cmd, PaletteStack } from "src/types"


export const useStack = (SOCKET_HOST: string) => {

    const [stack, setStack] = useState<Map<number, PaletteStack>>()
    const [terminals, setTerminals] = useState<Map<number, Map<number, TerminalUIEngine>>>()
    const [loading, setLoading] = useState(false)

    const [selectedStack, selectStack] = useState<number>(1)
    const [selectedTerminal, selectTerminal] = useState<number>(1)

    const fetchTerminals = async () => {

        setLoading(true)
        const data = await window.api.getStack() as PaletteStack[]
        const newStack = new Map<number, PaletteStack>()
        data.forEach((stack) => {
            newStack.set(stack.id, stack)
        })

        const newTerminals = new Map<number, Map<number, TerminalUIEngine>>()
        data.forEach((stack) => {
            if (!stack.palette) return
            newTerminals.set(stack.id, new Map<number, TerminalUIEngine>())
            stack.palette.forEach((cmd) => {
                if (!cmd) return
                const s = newTerminals.get(stack.id)
                if (!s) return
                const engine = new TerminalUIEngine(stack.id, cmd.id, SOCKET_HOST)
                engine.startListening()
                s.set(cmd.id, engine)
            })
        })
        setTerminals(() => newTerminals)
        setStack(() => newStack)
        setLoading(false)
    }
    const addStack = (st: PaletteStack) => {
        const newStack = new Map<number, PaletteStack>(stack)
        newStack.set(st.id, st)
        setStack(() => newStack)
    }

    const addTerminal = async (cmd: Cmd) => {

        if (terminals?.get(selectedStack)?.has(cmd.id)) return

        const newStack = new Map(stack)
        const selected = newStack.get(selectedStack)
        if (!selected) return
        if (!selected.palette) selected.palette = []
        selected.palette.push(cmd)

        const newTerminals = new Map(terminals)

        if (!newTerminals.get(selectedStack)) {
            newTerminals.set(selectedStack, new Map<number, TerminalUIEngine>())
        }
        const stacks = newTerminals.get(selectedStack)
        if (!stacks) return
        const engine = new TerminalUIEngine(selectedStack, cmd.id, SOCKET_HOST)
        engine.startListening()
        stacks.set(cmd.id, engine)
        setStack(newStack)
        setTerminals(newTerminals)
    }




    useEffect(() => {
        // setTimeout(() => {
        fetchTerminals()
        // }, 500);
    }, [])


    return {
        stack,
        terminals,
        loading,
        selectStack,
        selectTerminal,
        addTerminal,
        addStack,
        selectedStack,
        selectedTerminal,
    }


}