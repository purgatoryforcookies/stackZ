import { Socket, io } from 'socket.io-client'
import { Status, UtilityEvents } from '../../../types'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export class TerminalUIEngine {
    private terminal = new Terminal({
        theme: {
            cursor: '#f7571c'
        },
        cursorBlink: true,
        rightClickSelectsWord: false
    })
    socket: Socket
    private mounted = false
    private isConnected = false
    private isRunning = false
    private host: string
    stackId: string
    terminalId: string
    private fitAddon: FitAddon
    private hostdiv: HTMLElement
    private buffer: string

    constructor(stackId: string, terminalId: string, host: string) {
        this.fitAddon = new FitAddon()
        this.stackId = stackId
        this.terminalId = terminalId
        this.host = host
        this.terminal.loadAddon(this.fitAddon)
        this.buffer = ''
    }

    isMounted() {
        return this.mounted
    }
    isListening() {
        return this.isConnected
    }

    resize() {
        this.fitAddon.fit()
        this.socket.emit(UtilityEvents.RESIZE, {
            value: this.fitAddon.proposeDimensions()
        })
        return this
    }

    async startListening() {
        this.socket = io(this.host, {
            query: { stack: this.stackId, id: this.terminalId }
        })
        this.socket.on('output', (data: string) => {
            this.write(data)
        })

        this.socket.on('terminalState', (data: Status) => {
            this.isRunning = data.isRunning
        })

        this.socket.on('hello', () => {
            this.write(`Terminal connected - ${this.socket.id}`)
            this.prompt()
            this.isConnected = true
        })

        this.socket.on('error', (err) => {
            this.write(`Error - ${this.socket.id} ${err.message}`)
            this.prompt()
            this.write(`-----------------------------`)
            this.prompt()
        })

        this.terminal.onKey((data) => {
            this.sendInput(data.key)
            if (this.isRunning) return
            switch (data.domEvent.key) {
                case 'Enter': {
                    this.changeSettingsMaybe(this.buffer)
                    this.sendInput(this.buffer)
                    this.prompt()
                    this.buffer = ''
                    break
                }
                case 'Backspace': {
                    if (this.buffer.length === 0) break
                    this.buffer = this.buffer.slice(0, -1)
                    this.write('\b \b')
                    break
                }
                case 'ArrowDown':
                    break
                case 'ArrowUp':
                    break
                case 'ArrowLeft':
                    break
                case 'ArrowRight':
                    break
                default: {
                    this.buffer += data.key
                    this.write(data.key)
                }
            }
        })
        this.terminal.attachCustomKeyEventHandler((e) => {
            if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey)) {
                this.pasteClipBoardMaybe()
                return false
            }
            return true
        })
    }

    ping() {
        this.socket.emit('state')
    }

    sendInput(input: string) {
        this.socket.emit('input', { data: input })
    }

    write(char: string) {
        this.terminal.write(char)
    }

    prompt() {
        this.sendInput(this.buffer)
        this.terminal.write(`\r\n$ `)
    }

    attachTo(element: HTMLElement) {
        this.hostdiv = element
        if (this.hostdiv.hasChildNodes()) element.innerHTML = ''
        this.terminal.open(this.hostdiv)
        this.mounted = true
        this.resize()
        return this
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
        this.isConnected = false
    }

    changeSettingsMaybe(command: string) {
        if (command.slice(0, 2) === 'cd') {
            this.socket.emit('changeCwd', {
                stack: this.stackId,
                terminal: this.terminalId,
                value: command.slice(2)
            })
            return
        }
        if (command.slice(0, 5) === 'shell') {
            this.socket.emit('changeShell', {
                stack: this.stackId,
                terminal: this.terminalId,
                value: command.slice(5)
            })
            return
        }
        if (command === 'clear') {
            this.clear()
            return
        } else {
            this.socket.emit('changeCommand', {
                stack: this.stackId,
                terminal: this.terminalId,
                value: command
            })
        }
    }

    async pasteClipBoardMaybe() {
        const clip = await navigator.clipboard.readText()
        if (this.buffer.includes(clip)) return
        this.buffer += clip
        this.write(clip)
        if (this.isRunning) this.sendInput(clip)
    }
}
