import { Socket, io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';


export class TerminalUIEngine {
    private terminal = new Terminal({
        theme: {
            background: '#1e1717',
            cursor: '#f7571c',

        },
        cursorBlink: true
    });
    private socket: Socket;
    private mounted = false
    private id: number
    private host: string
    private fitAddon: FitAddon
    private hostdiv: HTMLElement

    constructor(id: number, host: string) {
        this.fitAddon = new FitAddon();
        this.id = id
        this.host = host
        this.terminal.loadAddon(this.fitAddon)
    }

    isMounted() {
        return this.mounted
    }
    getId() {
        return this.id
    }
    resize() {
        this.fitAddon.fit()
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
        })

        this.socket.on('error', (err) => {
            this.terminal.write(`Error - ${this.socket.id} - ${err.message}`)
            this.prompt()
        })
    }

    ping() {
        console.log("sengin ping")
        this.socket.emit("state")
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
        this.hostdiv = element
        if (this.hostdiv.hasChildNodes()) element.innerHTML = ''
        this.terminal.open(this.hostdiv);
        this.mounted = true
        this.resize()

    }

    clear() {
        this.terminal.clear()
    }

    detach() {
        this.hostdiv.innerHTML = ''
        // this.terminal.dispose()
        // this.socket.off('output')
        // this.socket.off('input')
        this.mounted = false

    }

}




