import { Server } from 'socket.io'
import { Cmd, CustomServer } from '../../types'
import { Terminal } from '../src/Terminal'
import { HistoryService } from '../src/service/HistoryService'
import { EnvironmentService } from '../src/service/EnvironmentService'
jest.mock('../src/service/HistoryService')
jest.mock('../src/service/EnvironmentService')

describe('Terminal', () => {
    let testTerminal: Terminal | null = null

    const testCommand: Cmd = {
        id: 'commandId',
        title: 'Test',
        command: {
            cmd: 'echo hello'
        }
    }

    const testServer = new Server<CustomServer>({
        cors: {
            origin: '*'
        }
    }).listen(3124)

    const mockStackUtility = jest.fn()
    const mockedHistory = new HistoryService()
    const mockedEnvironment = new EnvironmentService(testServer)

    testServer.on('connection', (client) => {
        testTerminal = new Terminal(
            'stackID',
            testCommand,
            client,
            mockStackUtility,
            mockStackUtility,
            mockedHistory,
            mockedEnvironment
        )
    })

    it('Has created a terminal instance', () => {
        expect(testTerminal).toBeDefined()
    })
})
