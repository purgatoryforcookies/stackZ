import { readFile, writeFileSync, existsSync } from 'fs'
import { Environment } from '../../../types'
import { ZodTypeAny, z } from 'zod'
import { exec } from 'child_process'
import { RequestOptions, request } from 'http'
import { DockerError } from './error'

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

export const parseBufferToEnvironment = (buf: ArrayBuffer | null) => {
    if (!buf) return {}
    const enc = new TextDecoder('utf-8')
    const decoded = enc.decode(buf).split('\n')

    const envir = {}

    decoded.forEach((row) => {
        if (!row) return
        try {
            if (row.startsWith('#')) return
            if (row.length < 2) return
            const [key, value] = row.split('=')
            const betterValue = value.replace(/["]+/g, '').trim()
            envir[key.trim()] = betterValue
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

export const executeScript = async (script: string, shell: string, silent = false) => {
    try {
        const data: string = await new Promise((res, rej) => {
            exec(script, { shell: shell }, (err, stdout) => {
                if (err) {
                    rej(err)
                }
                res(stdout)
            })
        })

        return data
    } catch (error) {
        if (!silent) {
            console.log(error)
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
