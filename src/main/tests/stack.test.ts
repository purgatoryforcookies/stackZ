import { Server } from 'socket.io'
import { Stack } from '../src/Stack'
import { stackSchema } from '../../types'
import { after } from 'node:test'
import { existsSync, unlinkSync } from 'fs'


describe('stack', () => {

    const testServer = new Server({
        cors: {
            origin: '*'
        }
    })

    const filepath = './src/main/tests/fixtures/testStack1.json'

    const stack = new Stack(filepath, testServer, stackSchema)


    beforeAll(async () => {
        await stack.load()
    })

    afterAll(() => {
        testServer.close()
        unlinkSync(filepath)
    })


    it("Creates a file if it does not exists", () => {
        expect(existsSync(filepath)).toBeTruthy()
    })

    it('Loads stacks, and creates it, and starts a server', async () => {

        expect(stack.palettes.size).toBe(0)


        stack.init()?.startServer()


        expect(stack.palettes.size).toBe(1)
        stack.palettes.forEach(palette => {
            expect(palette.terminals.size).toBe(0)
            expect(palette.settings.id).toBeDefined()
        })

        stack.raw.forEach(raw => {
            expect(raw.id).toBeDefined()
        })

        expect(stack.server).toBeDefined()

    })

    it("Creates a new stack, and removes it", () => {
        const newstack = stack.createStack("Test1")

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

    it("Creates a terminal into a stack and removes it", () => {
        const newstack = stack.createStack("Test1")

        const newTerminal = stack.createTerminal("Test00", newstack.id)
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

})
