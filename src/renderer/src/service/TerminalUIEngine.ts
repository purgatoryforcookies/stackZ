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

            const isOutOfBoundsLeft = this.terminal.buffer.active.cursorX <= 2
            const isOutOfBoundsRigth = this.terminal.buffer.active.cursorX - 1 > this.getCurrentTerminalLine().length


            switch (data.domEvent.key) {
                case 'Enter': {
                    this.changeSettingsMaybe()
                    this.prompt()
                    this.buffer = ''
                    this.step = 0
                    break
                }
                case 'Backspace': {
                    if (isOutOfBoundsLeft) return
                    this.removeViaBuffer()
                    this.step = 0
                    break
                }
                case 'ArrowDown':
                    this.getHistory(-1)
                    break
                case 'ArrowUp':
                    this.getHistory(1)
                    break
                case 'ArrowLeft':
                    if (isOutOfBoundsLeft) return
                    this.rawWrite('\u001b[1D')
                    break
                case 'ArrowRight':
                    if (isOutOfBoundsRigth) return
                    this.rawWrite('\x1b[1C')
                    break
                default: {
                    this.writeViaBuffer(data.key)
                    this.step = 0
                }
            }
        })
        this.terminal.attachCustomKeyEventHandler((e) => {
            if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey) && e.type === 'keyup') {
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

    /**
     * Used for writing the users input to xterm terminal.
     * Writes into either end of the line or middle of it
     * depending on cursor positioning.
     * 
     * Note: Should not be used for escape character commands. 
     * use rawWrite() instead.
     */
    writeViaBuffer(data: string) {
        const curPos = this.terminal.buffer.active.cursorX - 2

        this.buffer = this.buffer.slice(0, curPos) + data + this.buffer.slice(curPos)
        this.rawWrite('\u001b[1000D')
        this.rawWrite('\u001b[0K$ ')
        this.rawWrite(this.buffer)
        this.rawWrite('\u001b[1000D')
        if (curPos != this.buffer.length - 1) {
            this.rawWrite(`\u001b[${curPos + 3}C`)
        }
        else {
            this.rawWrite(`\u001b[${this.buffer.length + 2}C`)
        }
    }

    removeViaBuffer() {
        const curPos = this.terminal.buffer.active.cursorX - 2
        this.buffer = this.buffer.slice(0, curPos - 1) + this.buffer.slice(curPos)
        this.rawWrite('\u001b[1000D')
        this.rawWrite('\u001b[0K$ ')
        this.rawWrite(this.buffer)
        this.rawWrite('\u001b[1000D')
        this.rawWrite(`\u001b[${curPos + 1}C`)

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

    changeSettingsMaybe() {

        const cursorRow = this.terminal.buffer.active.cursorY
        const currentRow = this.terminal.buffer.active.getLine(cursorRow)?.translateToString(true, 2)
        if (!currentRow) return

        const [keyword, cmd] = currentRow.split(" ", 2)

        switch (keyword) {
            case 'cd':
                this.socket.emit('changeCwd', {
                    stack: this.stackId,
                    terminal: this.terminalId,
                    value: cmd
                })
                break
            case 'shell':
                this.socket.emit('changeShell', {
                    stack: this.stackId,
                    terminal: this.terminalId,
                    value: cmd
                })
                break
            case 'clear':
                this.clear()
                break
            default:
                this.socket.emit('changeCommand', {
                    stack: this.stackId,
                    terminal: this.terminalId,
                    value: currentRow
                })
                break
        }

    }

    async pasteClipBoardMaybe() {
        const clip = await navigator.clipboard.readText()
        if (this.isRunning) this.terminal.paste(clip)
        else this.rawWrite(clip)
    }

    getHistory(dir: 1 | -1) {

        this.socket.emit("history", this.getCurrentTerminalLine(), this.step, (data: string) => {
            if (!data) {
                this.step = 0
                return
            }
            this.rawWrite('\u001b[2K\u001b[1000D$ ')
            this.rawWrite(data)
            this.buffer = data
            dir === 1 ? this.step += 1 : this.step -= 1
        })
    }

    getCurrentTerminalLine() {
        const cursorRow = this.terminal.buffer.active.cursorY
        return this.terminal.buffer.active.getLine(cursorRow)?.translateToString(true).slice(2) || '' //Hack
    }
}
