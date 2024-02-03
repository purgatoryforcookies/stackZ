import { v4 as uuidv4 } from 'uuid';
import { Cmd, PaletteStack } from '../../types'
import { Terminal } from './service/Terminal'
import { Server } from 'socket.io'

export class Palette {
  settings: PaletteStack
  terminals: Map<string, Terminal>
  server: Server

  constructor(settings: PaletteStack, server: Server) {
    this.settings = settings
    this.terminals = new Map<string, Terminal>()
    this.server = server
  }

  initTerminal(socketId: string, server: Server, remoteTerminalID: string) {
    const terminal = this.settings.palette?.find((palette) => palette.id === remoteTerminalID)
    if (terminal) {
      const newTerminal = new Terminal(this.settings.id, terminal, socketId, server)
      this.terminals.set(terminal.id, newTerminal)
      newTerminal.ping()
    }
  }

  deleteTerminal(terminalId: string) {
    console.log(`Removing stack ${terminalId}, ${this.settings.id}`)
    this.terminals.delete(terminalId)
    this.settings.palette = this.settings.palette?.filter((pal) => pal.id !== terminalId)
  }

  pingState() {
    const state = [...this.terminals.values()].map((term) => {
      if (!term) return term
      return {
        id: term.settings.id,
        running: term.isRunning
      }
    })

    this.server.emit('stackState', { stack: this.settings.id, state: state })
  }

  pingAll() {
    this.terminals.forEach((term) => term.ping())
  }

  get() {
    return this.settings
  }

  createCommand(title: string) {

    const newOne: Cmd = {
      id: uuidv4(),
      title: title,
      command: {
        cmd: 'echo Hello World!',
        cwd: process.env.HOME || '~'
      }
    }
    if (!this.settings.palette) {
      this.settings.palette = []
    }
    this.settings.palette.push(newOne)
    return newOne
  }

  startTerminal(id: string) {
    console.log(`Starting terminal number ${id}`)
    const terminal = this.terminals.get(id)
    if (!terminal) return false
    terminal.start()
    return true
  }

  stopTerminal(id: string) {
    console.log(`Stopping terminal number ${id}`)
    const terminal = this.terminals.get(id)
    if (!terminal) return false
    terminal.stop()
    return true
  }

  killAll() {
    this.terminals.forEach((terminal) => {
      terminal.stop()
    })
  }
}
