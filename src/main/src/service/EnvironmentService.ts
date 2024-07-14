import { Environment } from '../../../types'
import { envFactory, haveThesameElements } from '../util/util'


// TODO: Remove the singleton pattern. it was a bad idea afterall.

/**
 * Environment service stores and keeps track of
 * all the environments given stack or terminal can have.
 * Each environment can consist of multiple sets of environment variable lists.
 * Each list has an order, specifying its uniqueness in a given record
 * and order its applied. 
 * 
 * When enviroment is baked, order determines it's precedence in the output.
 * Higher the order, higher the priority of its keys.
 */
export class EnvironmentService {
    os: Environment[]
    public store: Map<string, Environment[]> = new Map()
    private static instance: EnvironmentService

    // @ts-ignore singleton
    private constructor() { }

    public static get() {
        if (!EnvironmentService.instance) {
            EnvironmentService.instance = new EnvironmentService()
        }
        return EnvironmentService.instance
    }

    register(id: string, env?: Environment[], omitOS = false) {
        if (omitOS) {
            if (!env) return
            this.store.set(id, env)
            return
        }
        const hostBakedIn = envFactory(env)
        this.store.set(id, hostBakedIn)
    }

    unregister(id: string) {
        this.store.delete(id)
    }

    retrieve(id: string, omitOS: boolean = true) {
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




    addOrder(id: string, title: string, variables: Record<string, string>) {
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
                item.order = i
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

    /**
     * Flush replaces the contents of an environment without changing its
     * order or id. Useful for mass edits.
     * 
     * If no environment is provided, it resets the environment to be an
     * empty environment. 
     */
    flush(id: string, order: number, env?: Record<string, string | undefined>) {
        const target = this.store.get(id)?.find((list) => list.order === order)
        if (!target) throw new Error('Editing failed. No environment found.')

        if (!env) {
            target.pairs = {}
        } else {
            target.pairs = env
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
     * ands enumerates them to one single environment. 
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
                    if (omitOS && envSet.title === 'OS Environment') return

                    Object.keys(envSet.pairs).forEach((key) => {
                        if (envSet.disabled.includes(key)) return
                        reduced[key] = envSet.pairs[key]
                    })
                })
        })

        return reduced
    }
}
