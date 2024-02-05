import { Server } from 'socket.io'
import { Stack } from '../src/Stack'
import { stackSchema } from '../../types'
import { after } from 'node:test'


describe('stack', () => {

    const testServer = new Server({
        cors: {
            origin: '*'
        }
    })

    const stack = new Stack('./src/main/tests/fixtures/testStack1.json', testServer, stackSchema)

    afterAll(() => {
        testServer.close()
    })

    it('Loads stacks, and creates it', async () => {
        await stack.load()
        expect(stack.palettes.size).toBe(0)


        stack.init()?.startServer()


        expect(stack.palettes.size).toBe(2)
        stack.palettes.forEach(palette => {
            expect(palette.terminals.size).toBe(0)
        })


        stack.palettes.forEach(palette => {
            expect(palette.settings.id).toBeDefined()
        })
        stack.raw.forEach(raw => {
            expect(raw.id).toBeDefined()
        })



    })







})
