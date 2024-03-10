import { Server } from 'socket.io'
import { Stack } from '../src/Stack'
import { ClientEvents, StackStatus, Status, UtilityEvents, stackSchema } from '../../types'
import { existsSync, unlinkSync } from 'fs'
import { Socket, io } from 'socket.io-client'
import { join } from 'path'

const testServer = new Server({
    cors: {
        origin: '*'
    }
})

const filepath = join(__dirname, './testStack1.json')

const SOCKET_HOST_FOR_CLIENT = 'http://localhost:3123'

// Test is designed to be run in order.
describe('stack', () => {
    const stack = new Stack(filepath, testServer, stackSchema)
    const testTerminalNames = ['terminal1', 'terminal2', 'terminal3', 'terminal4']
    const testStacks: Map<string, string[]> = new Map()
    const uiSockets: Socket[] = []

    beforeAll(async () => {
        await stack.load()
    })

    afterAll((done) => {
        testServer.close()
        unlinkSync(filepath)
        done()
    })

    it('Creates a file if it does not exists', () => {
        expect(existsSync(filepath)).toBeTruthy()
    })

    it('Inits the default stack, and starts a server', async () => {
        expect(stack.palettes.size).toBe(0)

        stack.init()?.startServer()

        expect(stack.palettes.size).toBe(1)
        stack.palettes.forEach((palette) => {
            expect(palette.terminals.size).toBe(0)
            expect(palette.settings.id).toBeDefined()
        })

        stack.raw.forEach((raw) => {
            expect(raw.id).toBeDefined()
        })

        expect(stack.server).toBeDefined()
    })

    it('Creates a new stack, and removes it', () => {
        const newstack = stack.createStack('Test1')

        const test = stack.palettes.get(newstack.id)

        expect(test).toBeDefined()
        expect(test?.terminals.size).toBe(0)
        expect(test?.settings.id).toBe(newstack.id)
        expect(test?.settings.stackName).toBe(newstack.stackName)
        expect(test?.settings.env).toBeUndefined()

        stack.removeStack(test!.settings.id)
        expect(stack.palettes.size).toBe(1)
        expect(stack.palettes.get(newstack.id)).toBeUndefined()
    })

    it('Creates a terminal into a stack and removes it', async () => {
        const newstack = stack.createStack('Test1')

        const newTerminal = await stack.createTerminal({ title: 'Test00' }, newstack.id)
        const test = stack.palettes.get(newstack.id)

        expect(test).toBeDefined()
        expect(test?.settings.palette?.length).toBe(1)

        expect(newTerminal).toBeDefined()
        expect(newTerminal?.title).toBe('Test00')
        expect(newTerminal?.executionOrder).toBeDefined()

        stack.deleteTerminal(newstack.id, newTerminal?.id)
        stack.removeStack(test!.settings.id)

        expect(test?.settings.palette?.length).toBe(0)
    })

    it('Creates terminal instances into palette settings', async () => {
        const testNames = ['stack1', 'stack2', 'stack3']
        const testStackIds: string[] = []

        testNames.forEach((m) => {
            const s = stack.createStack(m)
            testStackIds.push(s.id)
        })

        for (const id of testStackIds) {
            const tTerminals: string[] = []
            for (const term of testTerminalNames) {
                const newT = await stack.createTerminal({ title: term }, id)
                tTerminals.push(newT.id)
            }
            testStacks.set(id, tTerminals)
        }

        testStackIds.forEach((id) => {
            const s = stack.palettes.get(id)
            expect(s).toBeDefined()
            expect(s?.settings.palette?.length).toBe(4)
        })
    })

    it('Creates a terminal instance once socket connects to it', async () => {
        // At this point each 3 stacks have 4 terminals
        // None of the terminals exist in anywhere else than in settings
        // The client asks for a terminal to be connected once it is
        // Being shown in the UI, so we need to make that happen somehow.

        // Lets pretend to be a ui's terminal engine and connect with sockets

        for (const [stackId, terms] of testStacks) {
            for (const termId of terms) {
                await new Promise<void>((r) => {
                    const sock = io(SOCKET_HOST_FOR_CLIENT, {
                        query: { stack: stackId, id: termId }
                    })
                    uiSockets.push(sock)
                    sock.on('hello', () => {
                        r()
                    })
                })
            }
        }

        expect(uiSockets.length).toBe(12)

        // Now there should be actual terminals in the palettes, not just in raw settings objects
        // Each terminals default settings are also being checked

        for (const [stackId, terms] of testStacks) {
            const pal = stack.palettes.get(stackId)
            expect(pal).toBeDefined()
            expect(pal?.terminals.size).toBe(4)
            terms.forEach((tId, i) => {
                expect(stack.palettes.get(stackId)?.terminals.get(tId)).toBeDefined()
                expect(stack.palettes.get(stackId)?.terminals.get(tId)?.ptyProcess).toBeDefined()
                expect(stack.palettes.get(stackId)?.terminals.get(tId)?.stackId).toBe(stackId)
                expect(
                    stack.palettes.get(stackId)?.terminals.get(tId)?.settings.command.cmd
                ).toBeDefined()
                expect(
                    stack.palettes.get(stackId)?.terminals.get(tId)?.settings.executionOrder
                ).toBeDefined()
                expect(stack.palettes.get(stackId)?.terminals.get(tId)?.settings.title).toBe(
                    testTerminalNames[i]
                )
                expect(
                    stack.palettes.get(stackId)?.terminals.get(tId)?.settings.metaSettings
                ).toBeUndefined()
            })
        }
    })

    it.todo('Starts and stops each terminal')

    describe('Socket events :)', () => {
        const stackMockSockets: Socket[] = []

        beforeAll(async () => {
            Array.from(testStacks.keys()).forEach((id) => {
                stackMockSockets.push(
                    io(SOCKET_HOST_FOR_CLIENT, {
                        query: { stack: id }
                    })
                )
            })
        })

        afterAll(() => {
            stackMockSockets.forEach((s) => {
                s.disconnect()
            })
            uiSockets.forEach((sock) => {
                sock.disconnect()
            })
        })

        // We have 3 stacks and 12 terminals (4 in each)

        it('Emits stacks state for all terminals of a stack if terminal id is not given', (done) => {
            let stackCounter = 0

            stackMockSockets.forEach((socket) => {
                socket.on(ClientEvents.STACKSTATE, (d: StackStatus) => {
                    expect(d.stack).toBeDefined()
                    expect(d.state.length).toBe(4)
                    expect(d.state[0].id).toBeDefined()
                    expect(d.state[0].running).toBeDefined()

                    stackCounter += 1
                    if (stackCounter === 3) {
                        done()
                    }
                })
                socket.emit(UtilityEvents.STACKSTATE)
            })
        }, 1000)

        it("Emits individial terminals state with given id's", (done) => {
            let terminalCounter = 0
            for (const sock of uiSockets) {
                sock.on(ClientEvents.TERMINALSTATE, (d: Exclude<Status, undefined>) => {
                    expect(d.isRunning).toBeDefined()
                    expect(d.cmd).toBeDefined()
                    expect(d.stackId).toBeDefined()
                    expect(d.cwd).toBeDefined()
                    terminalCounter += 1

                    if (terminalCounter === 12) {
                        done()
                    }
                })

                sock.emit(UtilityEvents.STATE)
            }
        }, 1000)

        it.todo('Changes current working directory of a terminal')
        it.todo('Changes shell of a  terminal')
        it.todo('Changes command to be run of a terminal')
        it.todo('Mutes an env set')
        it.todo('Mutes an env, singular')
        it.todo('Deletes an env set')
        it.todo('Deletes asinglee env from correct set')
        it.todo('Edits a single env')
        it.todo('Creates an env to a set')
    })
})
