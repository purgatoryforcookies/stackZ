import { io } from 'socket.io-client'
import { CustomClientSocket } from '../../../types'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from '@xterm/addon-search'

import 'xterm/css/xterm.css'
import { WebLinksAddon } from '@xterm/addon-web-links'

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
    socket: CustomClientSocket
    private mounted = false
    private isConnected = false
    private isRunning: boolean
    private host: string
    stackId: string
    terminalId: string
    private fitAddon: FitAddon
    private searchAddon: SearchAddon
    private weblinkAddon: WebLinksAddon
    private hostdiv: HTMLElement
    private buffer: string
    private searchWord: string
    ctrlCPassthrough: boolean = false

    constructor(stackId: string, terminalId: string, host: string) {
        this.fitAddon = new FitAddon()
        this.searchAddon = new SearchAddon()
        this.weblinkAddon = new WebLinksAddon((_, uri) => window.open(uri))
        this.stackId = stackId
        this.terminalId = terminalId
        this.host = host
        this.terminal.loadAddon(this.fitAddon)
        this.terminal.loadAddon(this.searchAddon)
        this.terminal.loadAddon(this.weblinkAddon)
        this.searchWord = ''
        this.buffer = ''
        this.isRunning = false
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
        const newDims = this.fitAddon.proposeDimensions()
        if (!newDims) return this
        this.socket.emit('resize', {
            value: newDims
        })
        return this
    }

    startListening() {
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
            this.rawWrite(`Error ${this.socket.id} ${err}`)
            this.prompt()
            this.rawWrite(`-----------------------------`)
            this.prompt()
        })

        this.terminal.onKey((data) => {
            this.sendInput(data.key)
        })

        this.terminal.attachCustomKeyEventHandler((e) => {
            if (e.type === 'keyup') {
                if (e.code === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    if (!this.isRunning) {
                        window.api.startTerminal(this.stackId, this.terminalId)
                    } else {
                        window.api.stopTerminal(this.stackId, this.terminalId)
                    }
                    return false
                }
            }
            if (e.code === 'KeyV' && (e.metaKey || e.ctrlKey)) {
                if (e.type === 'keyup') {
                    this.paste()
                }
                return false
            }
            if (e.code === 'KeyC' && (e.metaKey || e.ctrlKey)) {
                if (e.type === 'keyup') {
                    this.copy()
                }
                return false
            }
            return true
        })
    }

    async paste() {
        const clip = await navigator.clipboard.readText()
        this.sendInput(clip)
    }
    async copy() {
        if (this.ctrlCPassthrough) {
            this.sendInput('\x03')
            this.ctrlCPassthrough = false
        } else {
            const clip = this.terminal.getSelection()
            navigator.clipboard.writeText(clip)
            this.ctrlCPassthrough = true
            setTimeout(() => {
                this.ctrlCPassthrough = false
            }, 300)
        }
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
        this.terminal.write(`\r\n`)
    }

    attachTo(element: HTMLElement) {
        this.hostdiv = element
        if (this.hostdiv.hasChildNodes()) element.innerHTML = ''
        this.terminal.open(this.hostdiv)
        this.terminal.focus()
        this.mounted = true

        if (window.process.platform !== 'win32') {
            const terms = document.getElementsByClassName('xterm')
            if (terms.length > 0) {
                terms[0].setAttribute('style', 'padding-top:27px;')
            }
        }
        this.resize()
        this.socket.on('terminalState', (data) => {
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
    }

    dispose() {
        this.terminal.dispose()
        this.socket.off('hello')
        this.socket.off('error')
        this.socket.disconnect()
        this.mounted = false
        this.isConnected = false
    }

    getCurrentTerminalLine() {
        const cursorRow = this.terminal.buffer.active.cursorY
        return (
            this.terminal.buffer.active.getLine(cursorRow)?.translateToString(true).slice(2) || ''
        )
    }
}
