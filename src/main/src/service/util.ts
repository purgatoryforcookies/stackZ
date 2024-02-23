import { readFile, writeFileSync, existsSync } from 'fs'
import { Environment } from '../../../types'
import { ZodTypeAny, z } from 'zod'

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

export const parseVariables = () => {
    return []
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

    return allenvs.sort((a, b) => a.order - b.order)
}

export const mapEnvs = (obj: Environment[], shell?: string) => {
    const reduced: Record<string, string | undefined> = {}
    obj.forEach((envSet) => {
        Object.keys(envSet.pairs).forEach((key) => {
            if (envSet.disabled.includes(key)) return
            reduced[key] = envSet.pairs[key]
        })
    })

    if (shell) {
        if (shell = 'zsh' || '/bin/zsh') reduced['TERM'] = 'xterm-256color'
    }


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

// eslint-disable-next-line
export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    // eslint-disable-next-line
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}
