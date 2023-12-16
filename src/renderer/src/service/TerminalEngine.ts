// Heavily inspired by https://www.opcito.com/blogs/building-browser-based-terminal-using-xtermjs-and-nodejs


import socket from './socket';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';


export class TerminalEngine {
    private terminal = new Terminal();
    private socket = socket;

    consctructor() {
        
    }

    startListening() {
        this.terminal.onData(data => this.sendInput(data))
        this.socket.on('output', (data: string) => this.write(data))
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
        this.terminal.open(element);

        setTimeout(() => {
            this.terminal.write('Terminal connected')
            this.terminal.write('')
            this.prompt()
        }, 600);



    }

    clear() {
        this.terminal.clear()
    }

    detach() {
        this.terminal.write('Disconnecting terminal...')

        setTimeout(() => {
            this.terminal.dispose()
            this.socket.off('output')
            this.socket.off('input')
        }, 300);
    }
}




