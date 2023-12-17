import { Socket, io } from 'socket.io-client';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';


export class TerminalUIEngine {
    private terminal = new Terminal();
    private socket: Socket;
    private running = false
    private id: number
    private host: string

    constructor(id: number, host: string) {
        this.id = id
        this.host = host
    }

    isRunning() {
        return this.running
    }

    async startListening() {
        this.socket = io(this.host, {
            query: { id: this.id }
        })

        this.terminal.onData(data => this.sendInput(data))
        this.socket.on("output", (data: string) => this.write(data))

        this.socket.on('hello', () => {
            this.terminal.write(`Terminal connected - ${this.socket.id}`)
            this.prompt()
            this.running = true
        })

        this.socket.on('error', (err) => {
            this.terminal.write(`Error - ${this.socket.id} - ${err.message}`)
            this.prompt()
            this.running = false
        })
    }

    ping() {
        this.socket.emit("hello")
    }

    sendInput(input: string) {
        this.socket.emit('input', input)
    }

    write(text: string) {
        this.terminal.write(text)
    }

    prompt() {
        this.terminal.write(`\r\n$ `)
    }

    attachTo(element: HTMLElement) {
        if (!this.terminal) return
        if (element.hasChildNodes()) element.innerHTML = ''
        this.terminal.open(element);
    }

    clear() {
        this.terminal.clear()
    }

    detach() {

        this.terminal.dispose()
        this.socket.off('output')
        this.socket.off('input')
        this.running = false

    }

}




