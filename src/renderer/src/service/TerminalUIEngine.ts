import { Socket, io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';


export class TerminalUIEngine {
    private terminal = new Terminal({
        theme: {
            cursor: '#f7571c',
            background: "var(--terminalBlack)"
        },
        cursorBlink: true,

    });
    private socket: Socket;
    private mounted = false
    private id: number
    private host: string
    private fitAddon: FitAddon
    private hostdiv: HTMLElement
    private buffer: string

    constructor(id: number, host: string) {
        this.fitAddon = new FitAddon();
        this.id = id
        this.host = host
        this.terminal.loadAddon(this.fitAddon)
        this.buffer = ''
    }

    isMounted() {
        return this.mounted
    }
    getId() {
        return this.id
    }
    resize() {
        this.fitAddon.fit()
        return this
    }

    async startListening() {
        this.socket = io(this.host, {
            query: { id: this.id }
        })

        this.socket.on("output", (data: string) => this.write(data))

        this.socket.on('hello', () => {
            this.write(`Terminal connected - ${this.socket.id}`)
            this.prompt()
        })

        this.socket.on('error', (err) => {
            this.write(`Error - ${this.socket.id} - ${err.message}`)
            this.prompt()
        })

        this.terminal.onKey((data) => {

            switch (data.domEvent.key) {
                case 'Enter': {
                    this.changeWorkindDirectoryMaybe(this.buffer)
                    this.buffer = ''
                    this.write('\n\r')
                    break
                }
                case 'Backspace': {
                    if (this.buffer.length === 0) break
                    this.buffer = this.buffer.slice(0, -1)
                    this.write('\b \b')
                    break
                }
                case 'ArrowDown': break
                case 'ArrowUp': break
                case 'ArrowLeft': break
                case 'ArrowRight': break
                default: {
                    this.buffer += data.key
                    this.write(data.key);
                }
            }
        })
        this.terminal.attachCustomKeyEventHandler((e) => {
            console.log(e)
            if (e.code === 'KeyV' && e.ctrlKey) {
                this.pasteClipBoardMaybe()
                return false
            }
            return true
        })

    }

    ping() {
        this.socket.emit("state")
    }

    sendInput(input: string) {
        this.socket.emit('input', input)
    }

    write(char: string) {
        this.terminal.write(char)
    }

    prompt() {
        this.terminal.write(`\r\n$ `)
    }

    attachTo(element: HTMLElement) {
        if (!this.terminal) {
            this.mounted = false
            return
        }
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
        this.mounted = false
    }

    dispose() {
        this.terminal.dispose()
        this.socket.off('hello')
        this.socket.off('error')
        this.socket.disconnect()
        this.mounted = false
    }

    changeWorkindDirectoryMaybe(command: string) {
        if (command.slice(0, 3) === 'cwd') {
            this.socket.emit("changeCwd", { id: this.id, value: command.slice(3) })
        }
    }

    async pasteClipBoardMaybe() {
        const clip = await navigator.clipboard.readText()
        if (this.buffer.includes(clip)) return
        this.buffer += clip
        this.write(clip)
    }

}




