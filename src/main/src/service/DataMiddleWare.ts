export class DataMiddleWare {
    size: number
    buffer: string[]
    constructor(size: number) {
        this.size = size
        this.buffer = []
    }

    // TODO: Solve this somehow.
    parseCwd(data: string, callBack: Function) {


        const d = data.split("\n")
        if (d.length > 1) return
        const trimmed = d[0].substring(
            d[0].indexOf("PS") + 2,
            d[0].lastIndexOf(">")
        );

        if (trimmed.includes("\\")) {
            console.log(`Firiing callback with ${trimmed.trim()}`)
            callBack(trimmed.trim())
            console.count("Callbakc!")
        }
    }



}