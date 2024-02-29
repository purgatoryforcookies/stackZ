import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { baseSocket } from '@renderer/service/socket'
import { useEffect, useState } from 'react'
import { ClientEvents, Cmd, PaletteStack, UtilityEvents } from '@t'
import { Socket, io } from 'socket.io-client'

export interface IReOrder {
    (stackId: string, terminalId: string, newOrder: number): void
}

export interface IUseStack {
    stack: Map<string, PaletteStack> | undefined
    stackSocket: Map<string, Socket>
    terminals: Map<string, Map<string, TerminalUIEngine>> | undefined
    loading: boolean
    selectStack: React.Dispatch<React.SetStateAction<string>>
    selectTerminal: React.Dispatch<React.SetStateAction<string>>
    addTerminal: (cmd: Cmd) => void
    addStack: (st: PaletteStack) => void
    reOrder: IReOrder
    selectedStack: string
    selectedTerminal: string
}

export const useStack = (SOCKET_HOST: string): IUseStack => {
    const [stack, setStack] = useState<Map<string, PaletteStack>>()
    const [stackSocket, setStackSockets] = useState<Map<string, Socket>>(new Map())
    const [terminals, setTerminals] = useState<Map<string, Map<string, TerminalUIEngine>>>()
    const [loading, setLoading] = useState(false)

    const [selectedStack, selectStack] = useState<string>('a')
    const [selectedTerminal, selectTerminal] = useState<string>('a')

    const fetchTerminals = async () => {
        setLoading(true)
        const data = (await window.api.getStack()) as PaletteStack[]
        const newStack = new Map<string, PaletteStack>()
        const newSocketStack = new Map<string, Socket>()
        data.forEach((stack) => {
            newStack.set(stack.id, stack)
            const sock = io(SOCKET_HOST, {
                query: { stack: stack.id }
            })
            newSocketStack.set(stack.id, sock)
        })
        setStackSockets(newSocketStack)

        const newTerminals = new Map<string, Map<string, TerminalUIEngine>>()
        data.forEach((stack) => {
            if (!stack.palette) return
            newTerminals.set(stack.id, new Map<string, TerminalUIEngine>())
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
        selectStack(data[0].id)
        selectTerminal(() => {
            const first = data[0].palette
            if (first) {
                const term = first.find((t) => t.executionOrder === 1)
                if (term) return term.id
            }
            return 'gibberish'
        })
        setStack(() => newStack)
        setLoading(false)
    }
    const addStack = (st: PaletteStack) => {
        const newStack = new Map(stack)
        const newSocketStack = new Map(stackSocket)
        newStack.set(st.id, st)
        const sock = io(SOCKET_HOST, {
            query: { stack: st.id }
        })
        newSocketStack.set(st.id, sock)
        setStack(() => newStack)
        setStackSockets(newSocketStack)
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
            newTerminals.set(selectedStack, new Map<string, TerminalUIEngine>())
        }
        const stacks = newTerminals.get(selectedStack)
        if (!stacks) return

        const engine = new TerminalUIEngine(selectedStack, cmd.id, SOCKET_HOST)
        engine.startListening()
        stacks.set(cmd.id, engine)
        setStack(newStack)
        setTerminals(newTerminals)
        selectTerminal(cmd.id)
    }

    /**
     *  Updates the execution order of a terminal
     */
    const reOrder: IReOrder = (stackId: string, terminalId: string, newOrder: number) => {
        const connection = stackSocket.get(stackId)
        if (!connection) return


        const newStack = new Map(stack)
        const selected = newStack.get(stackId)
        const oldPalette = selected?.palette
        if (!oldPalette) return

        const objectIndex = oldPalette.findIndex((obj) => obj.id === terminalId)
        if (objectIndex === -1) {
            throw new Error('Palette not found when trying to reorder')
        }

        const updatedArray = [...oldPalette]
        const item = updatedArray.splice(objectIndex, 1)[0]
        updatedArray.splice(newOrder - 1, 0, item)

        //set the new palette and remap execution orders now that the object was moved
        selected.palette = updatedArray.map((term, i) => {
            return { ...term, executionOrder: i + 1 }
        })

        setStack(newStack)

        connection.emit(UtilityEvents.REORDER, { terminalId, newOrder })
    }

    baseSocket.on(ClientEvents.DELTERMINAL, (d: { stack: string; terminal: string }) => {
        if (d.stack !== selectedStack) return
        if (stack) {
            const newStack = new Map(stack)
            const palette = newStack.get(d.stack)?.palette
            if (palette) {
                newStack.get(d.stack)!.palette = palette.filter((pal) => pal.id !== d.terminal)
            }
            setStack(newStack)
        }
        if (terminals) {
            const newTerminals = new Map(terminals)
            if (newTerminals.get(d.terminal)) {
                newTerminals.delete(d.terminal)
            }
            setTerminals(newTerminals)
        }
    })

    useEffect(() => {
        fetchTerminals()
    }, [])

    return {
        stack,
        stackSocket,
        terminals,
        loading,
        selectStack,
        selectTerminal,
        addTerminal,
        addStack,
        reOrder,
        selectedStack,
        selectedTerminal
    }
}
