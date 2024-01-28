import Anser from 'anser';

export class DataMiddleWare {
    size: number
    buffer: string
    constructor(size: number) {
        this.size = size
        this.buffer = ''
    }

    // TODO: Solve this somehow.
    buf(data: string, callBack: Function) {
        const t = Anser.ansiToJson(data)
        if (t[1].content.includes("PS") && t[2].content === 'c') {
            this.buffer += t[2].content
        }
        if (t[1].content === 'd') this.buffer += t[1].content

        if (this.checkBuffer()) {
            if (t[1].content.includes('PS')) {
                callBack(t[1].content.replace("\r\nPS", "").replace(">", "").trim())
            }
        }
    }

    checkBuffer() {
        if (this.buffer.length > 2) this.buffer = ''
        return this.buffer.includes('cd')
    }

}