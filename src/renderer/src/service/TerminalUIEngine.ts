import { Socket, io } from 'socket.io-client'
import { ClientEvents, Status, UtilityEvents } from '../../../types'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import 'xterm/css/xterm.css'

export class TerminalUIEngine {
    private terminal = new Terminal({
        theme: {
            cursor: '#f7571c'
        },
        cursorBlink: true,
        rightClickSelectsWord: false,
        allowProposedApi: true,
        convertEol: false
    })
    socket: Socket
    private mounted = false
    private isConnected = false
    private isRunning: boolean
    private host: string
    stackId: string
    terminalId: string
    private fitAddon: FitAddon
    private searchAddon: SearchAddon
    private hostdiv: HTMLElement
    private buffer: string
    private searchWord: string
    private step: number

    constructor(stackId: string, terminalId: string, host: string) {
        this.fitAddon = new FitAddon()
        this.searchAddon = new SearchAddon()
        this.stackId = stackId
        this.terminalId = terminalId
        this.host = host
        this.terminal.loadAddon(this.fitAddon)
        this.terminal.loadAddon(this.searchAddon)
        this.searchWord = ''
        this.buffer = ''
        this.isRunning = false
        this.step = 0
    }

    isMounted() {
        return this.mounted
    }
    isListening() {
        return this.isConnected
    }
    search(word?: string) {
        if (word) this.searchWord = word
        this.searchAddon.findPrevious(word || this.searchWord, {
            decorations: {
                activeMatchColorOverviewRuler: '#888a89',
                activeMatchBackground: '#888a89',
                matchOverviewRuler: '#403830',
                matchBackground: '#403830'
            }
        })
    }
    blurSearch() {
        this.searchAddon.clearDecorations()
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
            this.rawWrite(data)
        })

        this.socket.on('hello', () => {
            this.rawWrite(`Terminal connected - ${this.socket.id}`)
            this.prompt()
            this.isConnected = true
        })

        this.socket.on('error', (err) => {
            this.rawWrite(`Error ${this.socket.id} ${err.message}`)
            this.prompt()
            this.rawWrite(`-----------------------------`)
            this.prompt()
        })

        this.terminal.onKey((data) => {
            this.sendInput(data.key)
            if (this.isRunning) return
        })

        this.terminal.attachCustomKeyEventHandler((e) => {
            if (e.type === 'keyup') {
                if (e.code === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    if (!this.isRunning) {
                        window.api.startTerminal(this.stackId, this.terminalId)
                    }
                    else {
                        window.api.stopTerminal(this.stackId, this.terminalId)
                    }
                    return false
                }
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

    rawWrite(data: string) {
        this.terminal.write(data)
    }

    prompt() {
        this.sendInput(this.buffer)
        this.terminal.write(`\r\n$ `)
    }

    attachTo(element: HTMLElement) {
        this.hostdiv = element
        if (this.hostdiv.hasChildNodes()) element.innerHTML = ''
        this.terminal.open(this.hostdiv)
        this.terminal.focus()
        this.mounted = true
        this.resize()
        this.socket.on(ClientEvents.TERMINALSTATE, (data: Status) => {
            this.isRunning = data.isRunning
        })

        return this
    }

    clear() {
        this.terminal.clear()
    }

    detach() {
        this.hostdiv.innerHTML = ''
        this.mounted = false
        this.socket.off(ClientEvents.STACKSTATE)
    }

    dispose() {
        this.terminal.dispose()
        this.socket.off('hello')
        this.socket.off('error')
        this.socket.disconnect()
        this.mounted = false
        this.isConnected = false
    }

    getHistory(dir: 1 | -1) {
        this.socket.emit('history', null, this.step, (data: string) => {
            if (!data) {
                this.step = 0
                return
            }
            dir === 1 ? (this.step += 1) : (this.step -= 1)
        })
    }

    getCurrentTerminalLine() {
        const cursorRow = this.terminal.buffer.active.cursorY
        return (
            this.terminal.buffer.active.getLine(cursorRow)?.translateToString(true).slice(2) || ''
        )
    }
}
