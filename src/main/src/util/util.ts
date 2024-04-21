import { readFile, writeFileSync, existsSync } from 'fs'
import { Environment, TPorts } from '../../../types'
import { ZodTypeAny, z } from 'zod'
import { exec } from 'child_process'

export const readJsonFile = <T extends z.ZodTypeAny>(
    path: string,
    schema: T
): Promise<z.infer<T>> => {
    return new Promise((res, rej) => {
        if (!existsSync(path)) {
            createJsonFileTemplate(path, schema)
        }

        readFile(path, 'utf-8', async (err, data) => {
            if (err) {
                rej({ message: `No json file found, tried to create. Failed. Path: ${path}` })
            }
            try {
                const file = schema.parse(JSON.parse(data))
                res(file)
            } catch (error) {
                rej(error)
            }
        })
    })
}

const createJsonFileTemplate = (path: string, schema: ZodTypeAny) => {
    const template = schema.parse([{}])
    writeFileSync(path, JSON.stringify(template))
}

export const parseBufferToEnvironment = (buf?: ArrayBuffer) => {
    if (!buf) return {}
    const enc = new TextDecoder('utf-8')
    const decoded = enc.decode(buf).split('\n')


    const envir = {}

    decoded.forEach(row => {
        if (!row) return
        try {
            if (row.startsWith("#")) return
            if (row.length < 2) return
            const [key, value] = row.split("=")
            const betterValue = value.replace(/["]+/g, '').trim()
            envir[key.trim()] = betterValue
        } catch {
            // swallow
        }

    })

    return envir
}

parseBufferToEnvironment()

/**
 * Factory sorts envs into order and adds host environments
 * into the settings, if they dont already exist.
 */
export const envFactory = (args: Environment[] | undefined) => {
    const hostEnv: Environment = {
        title: 'OS Environment',
        pairs: process.env as Record<string, string>,
        order: 0,
        disabled: []
    }

    if (!args) return [hostEnv]

    let allenvs = args.map((obj) => ({ ...obj, disabled: [] })) as Environment[]

    if (args.findIndex((item) => item.title === 'OS Environment') === -1) {
        allenvs = allenvs.concat(hostEnv)
    }

    return allenvs
}

export const mapEnvs = (obj: Environment[]) => {
    const reduced: Record<string, string | undefined> = {}
    obj.forEach((envSet) => {
        Object.keys(envSet.pairs).forEach((key) => {
            if (envSet.disabled.includes(key)) return
            reduced[key] = envSet.pairs[key]
        })
    })

    return reduced
}

export const haveThesameElements = <T>(arr1: T[], arr2: T[]) => {
    return arr1.every((e) => arr2.includes(e))
}

export const resolveDefaultCwd = () => {
    if (process.env.HOME) return process.env.HOME
    if (process.env.HOMEDRIVE) {
        if (process.env.HOMEPATH) {
            return process.env.HOMEDRIVE + process.env.HOMEPATH
        }
    }
    return '~'
}

export const parsePSTCPMessage = (message: string) => {

    const linesInArray = message.split('\n').slice(3)
    const groupedLines2 = new Map<string, Map<number, TPorts[]>>()

    linesInArray.forEach(item => {
        const trimmed = trimShellTableRow(item)
        if (!trimmed) return

        const obj = {
            localAddress: trimmed[0],
            localPort: Number(trimmed[1]),
            remoteAddress: trimmed[2],
            remotePort: Number(trimmed[3]),
            state: trimmed[4],
            pid: Number(trimmed[5]),
            process: trimmed[6],
            protocol: 'TCP'
        }


        if (!groupedLines2.has(obj.process)) {
            groupedLines2.set(obj.process, new Map())
        }
        if (!groupedLines2.get(obj.process)?.has(obj.localPort)) {
            groupedLines2.get(obj.process)?.set(obj.localPort, [])
        }

        groupedLines2.get(obj.process)?.get(obj.localPort)?.push(obj)
    })

    return groupedLines2
}

//TODO: this and tcp one can be made into one.
export const parsePSUDPMessage = (message: string) => {
    const linesInArray = message.split('\n').slice(3)


    const groupedLines2 = new Map<string, Map<number, TPorts[]>>()

    linesInArray.forEach(item => {
        const trimmed = trimShellTableRow(item)
        if (!trimmed) return

        const obj: TPorts = {
            localAddress: trimmed[0],
            localPort: Number(trimmed[1]),
            remoteAddress: null,
            remotePort: null,
            state: null,
            pid: Number(trimmed[2]),
            process: trimmed[3],
            protocol: 'UDP'
        }

        if (!groupedLines2.has(obj.process)) {
            groupedLines2.set(obj.process, new Map())
        }
        if (!groupedLines2.get(obj.process)?.has(obj.localPort)) {
            groupedLines2.get(obj.process)?.set(obj.localPort, [])
        }

        groupedLines2.get(obj.process)?.get(obj.localPort)?.push(obj)
    })
    return groupedLines2

}



const trimShellTableRow = (row: string) => {
    if (row.length < 10) return
    return row.split(' ').filter(i => i.length > 0 && i !== '\r')

}


export const executePowerShellScript = async (script: string) => {


    try {
        const data: string = await new Promise((res, rej) => {
            exec(script, { shell: 'powershell.exe' }, (err, stdout) => {
                if (err) {
                    rej(err)
                }
                res(stdout)
            })
        })

        return data

    } catch (error) {
        console.log(error)
        return ''
    }




}