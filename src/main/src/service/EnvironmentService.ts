import { CustomServer, Environment, EnvironmentFlushOptions } from '../../../types'
import {
    envFactory,
    executeScript,
    haveThesameElements,
    isAfile,
    parseBufferToEnvironment,
    readAnyFile
} from '../util/util'

export const NAME_FOR_OS_ENV_SET = 'OS Environment'

/**
 * Environment service stores and keeps track of
 * all the environments given stack or terminal can have.
 * Each environment can consist of multiple sets of environment variable lists.
 * Each list has an order, specifying its uniqueness in a given record
 * and the order it is applied to.
 *
 * Each set in an environment can be a local or a remote set. Local set's
 * are stored in stacks.json and remote sets fetched on-the-fly.
 *
 *
 * When enviroment is baked, order determines it's precedence in the output.
 * Higher the order, higher the priority of its keys.
 */
export class EnvironmentService {
    public store: Map<string, Environment[]> = new Map()
    private isWin: boolean = process.platform === 'win32'
    private server: CustomServer

    constructor(server: CustomServer) {
        this.server = server
    }

    register(id: string, env?: Environment[], omitOS = false) {
        if (omitOS) {
            if (!env) return
            this.store.set(id, env)
        } else {
            const hostBakedIn = envFactory(env)
            this.store.set(id, hostBakedIn)
        }
    }

    unregister(id: string) {
        this.store.delete(id)
    }

    getCopy(id: string) {
        const target = this.store.get(id)
        if (!target) return
        return JSON.parse(JSON.stringify(target))
    }

    get(id: string, omitOS: boolean = true) {
        const existing = this.store.get(id)
        if (!existing) return

        if (omitOS) {
            return existing.filter((i) => i.order !== 0)
        }
        return existing
    }

    mute(id: string, order: number, key?: string) {
        if (key && key.trim().length == 0) return
        const target = this.store.get(id)?.find((list) => list.order === order)

        if (!target) return

        if (!key) {
            if (haveThesameElements(Object.keys(target.pairs), target.disabled)) {
                target.disabled = []
            } else {
                target.disabled.push(...Object.keys(target.pairs))
            }
        } else if (target.disabled.includes(key)) {
            target.disabled = target.disabled.filter((item) => item !== key)
        } else {
            target.disabled.push(key)
        }
    }

    addOrder(id: string, title: string, variables: Record<string, string | undefined>) {
        if (!title) return

        let target = this.store.get(id)
        if (!target) {
            this.register(id, [])
            target = []
        }

        if (target.some((env) => env.title === title)) {
            title += ' (1)'
        }

        const newEnv: Environment = {
            pairs: variables,
            title: title,
            order: target.length === 0 ? 0 : target.length + 1,
            disabled: []
        }
        target.push(newEnv)
        this.store.set(id, target)
    }

    removeViaOrder(id: string, order: number) {
        const target = this.store.get(id)
        if (!target) throw new Error('Deleting failed. No environment found')

        const newTarget = target
            .filter((env) => env.order !== order)
            .map((item, i) => {
                /**
                 * Remapping orders after delete.
                 * Order number 0 is reserved for OS.
                 */
                if (item.order === 0) return item

                /**
                 * +1 because index of 0 would go for OS
                 */
                item.order = i + 1
                return item
            })

        if (!newTarget) return
        if (newTarget.length === 0) {
            this.store.delete(id)
        } else {
            this.store.set(id, newTarget)
        }
    }

    /**
     * Edits or adds a key-value pair to given set.
     *
     * @param id Stack or terminal ID
     * @param order Order of the environment
     * @deprecated after 1.0.0. Editing local environments uses flush mainly due to the new environement
     * editor and the ease of use of flush.
     */
    edit(id: string, order: number, value: string, key: string, prevKey?: string) {
        if (key.trim().length == 0) return

        const target = this.store.get(id)?.find((list) => list.order === order)
        if (!target) throw new Error('Editing failed. No environment found.')

        if (prevKey) {
            delete target.pairs[prevKey]
        }
        target.pairs[key] = value
    }

    async refreshRemote(id: string, order: number) {
        const target = this.store.get(id)?.find((list) => list.order === order)
        if (!target) throw new Error('Refresh failed. No environment found.')
        if (!target.remote) throw new Error('Refresh failed. This is not a remote environment.')

        this.emitStatus(id, order, true, null, target.remote)

        try {
            const isFileInSystem = await isAfile(target.remote.source)

            if (isFileInSystem) {
                const [_raw, variables] = await this.readFromFile(target.remote.source)
                target.pairs = variables
            } else {
                const [_raw, variables] = await this.readFromService(target.remote.source)
                target.pairs = variables
            }

            target.remote.metadata = {
                updated: new Date().valueOf()
            }
        } catch (error) {
            this.emitStatus(id, order, false, String(error), target.remote)
            throw error
        }

        this.emitStatus(id, order, false, null, target.remote)
    }

    async refresAllRemotes(id: string) {
        const target = this.store.get(id)
        if (!target) throw new Error('Refresh failed. No environment found.')

        target.forEach((environment) => {
            if (environment.remote) {
                this.refreshRemote(id, environment.order)
            }
        })
    }

    private emitStatus(
        id: string,
        order: number,
        status: boolean,
        error: string | null,
        metadata: Environment['remote'] | null
    ) {
        if (status) {
            this.server.emit('environmentHeartbeat', {
                loading: status,
                id: id,
                order: order,
                error: error,
                metadata: metadata
            })
        } else {
            setTimeout(() => {
                this.server.emit('environmentHeartbeat', {
                    loading: status,
                    id: id,
                    order: order,
                    error: error,
                    metadata: metadata
                })
            }, 1200)
        }
    }

    /**
     * Flush replaces the contents of an environment without changing its
     * order or id. Useful for mass edits.
     *
     * Options object is required, passing an empty object is a destructive
     * operation.
     */
    flush(id: string, order: number, options: EnvironmentFlushOptions) {
        const target = this.store.get(id)?.find((list) => list.order === order)
        if (!target) throw new Error('Editing failed. No environment found.')

        if (options.env) {
            target.pairs = options.env
        } else {
            target.pairs = {}
        }
        if (options.remote) {
            target.remote = options.remote
        } else {
            delete target.remote
        }
    }

    remove(id: string, key: string, order: number) {
        const target = this.store.get(id)
        if (!target) throw new Error('Could not remove. No environment found')

        const list = target.find((list) => list.order === order)
        delete list?.pairs[key]
    }

    setVisuals(id: string, order: number, state: Environment['visualState']) {
        const target = this.store.get(id)?.find((list) => list.order === order)
        if (!target) throw new Error('Setting visual state failed. No environment found')
        target.visualState = state
    }

    /**
     * Baking takes all the environments in a given terminal
     * and enumerates them to one single environment.
     * This action removes duplicated keys and muted variables.
     * Dublicated key is always overwritten by the last key present.
     */
    bake(id: string[], omitOS: boolean = false) {
        const reduced: Record<string, string | undefined> = {}

        id.forEach((i) => {
            const environment = this.store.get(i)
            if (!environment) return

            environment
                .sort((a, b) => a.order - b.order)
                .forEach((envSet) => {
                    if (omitOS && envSet.title === NAME_FOR_OS_ENV_SET) return

                    Object.keys(envSet.pairs).forEach((key) => {
                        if (envSet.disabled.includes(key)) return
                        reduced[key] = envSet.pairs[key]
                    })
                })
        })

        return reduced
    }

    /**
     * Reads any file and returns an environment with raw string before parsing.
     *
     * Throws if data cannot be read or if data cannot be converted to buffer.
     */
    async readFromFile(path: string): Promise<[string, Record<string, string | undefined>]> {
        const data = await readAnyFile(path)
        const buffer = new TextEncoder().encode(data)
        return [data, parseBufferToEnvironment(buffer)]
    }

    /**
     * Attempts to read key value data from a service with exec().
     * Converts it to an environment and returns it with raw string before parsing.
     *
     * Throws if command exits with an error or its output cannot be converted to a buffer.
     */
    async readFromService(command: string): Promise<[string, Record<string, string | undefined>]> {
        const shell = this.isWin ? 'powershell.exe' : 'bin/bash'
        const data = await executeScript(command, shell, false)
        const buffer = new TextEncoder().encode(data)
        return [data, parseBufferToEnvironment(buffer)]
    }
}
