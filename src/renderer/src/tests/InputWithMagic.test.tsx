import useCommandSettings from '../hooks/useCommandSettings'
import { TerminalUIEngine } from '../service/TerminalUIEngine'
import io from 'socket.io-client'
import InputWithMagic from '../components/Common/InputWithMagic'
import { render, renderHook } from '@testing-library/react'

jest.mock('socket.io-client', () => {
    const socket = {
        emit: jest.fn(),
        on: jest.fn()
    }

    return jest.fn(() => socket)
})
const socket = io('http://localhost:3123')

describe('InputWithMagic', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    const engine = new TerminalUIEngine('stackId', 'terminalId', 'http://localhost:3123')
    engine.socket = socket
    const tools = renderHook(() => useCommandSettings(engine))

    it('Sockets should retrieve their settings', function (done) {
        expect(socket.emit).toHaveBeenCalledWith('retrieveSettings', expect.any(Function))

        expect(tools).toBeDefined()

        done()
    })

    it('should render', async () => {
        const { findAllByTestId } = render(
            <InputWithMagic
                tools={tools.result.current}
                title="Test"
                engine={engine}
                defaultValue="Test"
                valueKey="cmd"
                historyKey="CMD"
            />
        )

        expect((await findAllByTestId('magickInput')).length).toBe(1)
    })
})
