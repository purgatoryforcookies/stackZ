import { readFile, writeFileSync, existsSync, promises } from 'fs'
import { Environment } from '../../../types'
import { ZodTypeAny, z } from 'zod'
import { exec } from 'child_process'
import { RequestOptions, request } from 'http'
import { DockerError } from './error'
import path from 'path'
import { NAME_FOR_OS_ENV_SET } from '../service/EnvironmentService'

const IGNORED_DIRS = ['node_modules']

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

export const readAnyFile = (path: string) => {
    return new Promise<string>((res, rej) => {
        readFile(path, 'utf-8', async (err, data) => {
            if (err) {
                rej(err)
            }
            res(data)
        })
    })
}


const createJsonFileTemplate = (path: string, schema: ZodTypeAny) => {
    const template = schema.parse([{}])
    writeFileSync(path, JSON.stringify(template))
}

export const parseBufferToEnvironment = (buf: ArrayBuffer | null): Record<string, string | undefined> => {
    if (!buf) return {}
    const enc = new TextDecoder('utf-8')
    let decoded = enc.decode(buf)


    try {
        const ifItsJson = JSON.parse(decoded)
        return ifItsJson
    } catch {
        //swallow, was not
    }

    const splitted = decoded.split('\n')
    const envir = {}

    splitted.forEach((row) => {
        if (!row) return
        try {
            if (row.startsWith('#')) return
            if (row.length < 2) return

            const [key, value] = row.split('=')
            const betterValue = value.replace(/["]+/g, '').trim()
            const betterKey = key.replace(/["]+/g, '').trim()
            envir[betterKey] = betterValue

        } catch {
            // swallow
        }
    })

    return envir
}



/**
 * Factory sorts envs into order and adds host environments
 * into the settings, if they dont already exist.
 */
export const envFactory = (args: Environment[] | undefined) => {
    const hostEnv: Environment = {
        title: NAME_FOR_OS_ENV_SET,
        pairs: process.env as Record<string, string>,
        order: 0,
        disabled: []
    }

    if (!args) return [hostEnv]

    let allenvs = args.map((obj) => ({ ...obj, disabled: [] })) as Environment[]

    if (args.findIndex((item) => item.title === NAME_FOR_OS_ENV_SET) === -1) {
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

/**
 * Checks if the string provided is a file.
 * @returns true if the provided path is a file. False in any other case.
 * @throws never throws.
 */
export const isAfile = async (path: string) => {
    try {
        const stat = await promises.stat(path)
        return stat.isFile()

    } catch (error) {
        return false
    }
}

/**
 * Runs a command provided with the shell given. 
 * 
 * By default (silent = false) throws any errors occured
 * 
 * If run on silent, will ignore errors and return empty string.
 */
export const executeScript = async (script: string, shell: string, silent = false) => {

    try {
        const data: string = await new Promise((res, rej) => {
            exec(script, { shell: shell, timeout: 10000 }, (err, stdout) => {
                if (err) {
                    rej(err)
                }
                res(stdout)
            })
        })

        return data
    } catch (error) {
        if (!silent) {
            throw error
        }
        return ''
    }
}

export const bakeEnvironmentToString = (env: Record<string, string | undefined>) => {
    let envString = ''

    Object.entries(env).forEach((entry) => {
        if (process.platform === 'win32') {
            envString += `$env:${entry[0]}='${entry[1]}'; `
        } else {
            envString += `${entry[0]}=${entry[1]} `
        }
    })

    return envString
}

export const dockerHTTPRequest = <T>(options: RequestOptions) => {
    return new Promise<T | null>((resolve, reject) => {
        const req = request(options, (res) => {
            let data = ''

            if (!res.statusCode) {
                reject(new DockerError('No response'))
                return
            }
            if (res.statusCode >= 300) {
                reject(new DockerError(`${res.statusCode} - ${res.statusMessage}`))
                return
            }

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data))
                } catch {
                    resolve(null)
                }
            })
            res.on('error', (err) => {
                reject(new DockerError(`${err.name} - ${err.message}`))
            })
        })

        req.on('error', (err) => {
            reject(new DockerError(`${err.message}`))
        })

        req.end()
    })
}

export const searchFiles = async (rootPath: string, extensions: string[]) => {

    const files: string[] = []

    async function* walk(dir: string) {
        for await (const d of await promises.opendir(dir)) {

            if (IGNORED_DIRS.some(i => i === d.name)) {
                continue
            }

            if (!extensions.some(i => d.name.includes(i))) {
                continue
            }

            const entry = path.join(dir, d.name);
            if (d.isDirectory()) yield* walk(entry);
            else if (d.isFile()) yield entry;
        }
    }

    for await (const p of walk(rootPath)) {
        if (p) {
            files.push(p)
        }
    }

    return files

}
