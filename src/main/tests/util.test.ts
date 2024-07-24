import { ClientToServerEvents, ServerToClientEvents } from 'src/types'
import { EnvironmentService } from '../src/service/EnvironmentService'
import { Server } from 'socket.io'

describe('Utilities tests', () => {

    const socketServer = new Server<ClientToServerEvents, ServerToClientEvents>({
        cors: {
            origin: '*'
        }
    })

    const envService = new EnvironmentService(socketServer)

    beforeAll(() => {
        envService.store = new Map()
    })

    it('Does nothing if no env is provided and OS env is omitted (stack creation)', () => {
        envService.register('stack1', undefined, true)
        expect(envService.store.get('stack1')).toBeUndefined()
    })

    it('Registers a new env set for existing stack', () => {
        const newEnv: Record<string, string> = {
            key1: 'value1.1',
            key2: 'value2.1',
            key3: 'value3.1'
        }

        envService.addOrder('stack1', 'title1', newEnv)

        expect(envService.store.get('stack1')).toBeDefined()
        expect(envService.store.get('stack1')?.length).toBe(1)
        expect(envService.store.get('stack1')?.[0].title).toBe('title1')
        expect(envService.store.get('stack1')?.[0].order).toBe(0)
        expect(envService.store.size).toBe(1)
    })

    it('Registers another env set for existing stack', () => {
        const newEnv: Record<string, string> = {
            key1: 'value1.2',
            key2: 'value2.2',
            key3: 'value3.2'
        }

        envService.addOrder('stack1', 'title2', newEnv)

        expect(envService.store.get('stack1')).toBeDefined()
        expect(envService.store.get('stack1')?.length).toBe(2)
        expect(envService.store.get('stack1')?.[1].title).toBe('title2')
        // TODO: might want to revisit that ordering logic. technically should be 1..
        expect(envService.store.get('stack1')?.[1].order).toBe(2)
        expect(envService.store.size).toBe(1)
    })

    it('Registering a new terminal with empty env and with OS', () => {
        envService.register('term1')

        expect(envService.store.get('term1')).toBeDefined()
        expect(envService.store.get('term1')?.length).toBe(1)
        expect(envService.store.get('term1')?.[0].title).toBe('OS Environment')
        expect(envService.store.get('term1')?.[0].order).toBe(0)
        expect(envService.store.size).toBe(2)
    })

    it('Registering a new env set for existing terminal', () => {
        const newEnv: Record<string, string> = {
            key12: 'value1.1',
            key22: 'value2.1',
            key32: 'value3.1'
        }

        envService.addOrder('term1', 'env1', newEnv)

        expect(envService.store.get('term1')).toBeDefined()
        expect(envService.store.get('term1')?.length).toBe(2)
        expect(envService.store.get('term1')?.[0].title).toBe('OS Environment')
        expect(envService.store.get('term1')?.[0].order).toBe(0)
        expect(envService.store.get('term1')?.[1].title).toBe('env1')
        // TODO: might want to revisit that ordering logic. technically should be 1..
        expect(envService.store.get('term1')?.[1].order).toBe(2)
        expect(envService.store.size).toBe(2)
    })

    it('Bakes environment correctly for a terminal to run', () => {
        const envs = envService.bake(['stack1', 'term1'])

        const toLookFor = ['key12', 'key22', 'key32', 'key1', 'key2', 'key3']
        const toLookForValues = [
            'value1.1',
            'value2.1',
            'value3.1',
            'value1.2',
            'value2.2',
            'value3.2'
        ]

        console.log(envs)

        toLookFor.forEach((key, i) => {
            expect(envs[key]).toBeDefined()
            expect(envs[key]).toBe(toLookForValues[i])
        })

        // Expect that if this is defined, the OS envs are with the set
        expect(envs.HOME).toBeDefined()
    })

    it.todo('Bakes environment correctly when there are dublicated keys')
})
