
import useCommandSettings from "../hooks/useCommandSettings";
import { TerminalUIEngine } from "../service/TerminalUIEngine";
import io from 'socket.io-client';
import InputWithMagic from "../components/Common/InputWithMagic";
import { render, renderHook } from '@testing-library/react';

jest.mock('socket.io-client', () => {
    const emit = jest.fn();
    const on = jest.fn();
    const socket = { emit, on };
    return jest.fn(() => socket);
})
let socket = io('http://localhost:3123');

describe("InputWithMagic", () => {


    afterEach(() => {
        jest.restoreAllMocks();
    });

    const engine = new TerminalUIEngine("stackId", "terminalId", "http://localhost:3123")
    engine.socket = socket
    const tools = renderHook(() => useCommandSettings(engine))

    it('Sockets should', function (done) {
        expect(socket.emit).toHaveBeenCalledWith('retrieve_settings', expect.any(Function))

        expect(tools).toBeDefined()

        done()
    })




    it("should render correctly", async () => {
        const { findAllByTestId } = render(
            <InputWithMagic
                tools={tools.result.current}
                title="Test"
                engine={engine}
                defaultValue="Test"
                valueKey="cmd"
                historyKey="CMD"
            />
        );

        expect((await findAllByTestId('magickInput')).length).toBe(1)

    });



})




