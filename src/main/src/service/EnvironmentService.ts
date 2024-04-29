import { Environment } from "src/types"
import { envFactory, haveThesameElements } from "../util/util"


export class EnvironmentService {

    os: Environment[]
    public store: Map<string, Environment[]> = new Map()
    private static instance: EnvironmentService

    private constructor() { }

    public static get() {
        if (!EnvironmentService.instance) {
            EnvironmentService.instance = new EnvironmentService()
        }
        return EnvironmentService.instance
    }

    register(id: string, env?: Environment[], omitOS = false) {

        if (omitOS && env) {
            this.store.set(id, env)
            return
        }
        const hostBakedIn = envFactory(env)
        this.store.set(id, hostBakedIn)
    }

    unregister(id: string) {
        this.store.delete(id)
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

        const target = this.store.get(id)
        if (!target) throw new Error('Addin list failed. No environment found')

        if (target.some((env) => env.title === title)) {
            title += ' (1)'
        }

        const newEnv: Environment = {
            pairs: variables,
            title: title,
            order: Math.max(...target.map((env) => env.order)) + 1,
            disabled: []
        }

        target.push(newEnv)
    }

    removeViaOrder(id: string, order: number) {
        const target = this.store.get(id)
        if (!target) throw new Error('Deleting failed. No environment found')

        const newTarget = target
            .filter(env => env.order !== order)
            .map((item, i) => {
                item.order = i
                return item
            })

        if (!newTarget) return
        this.store.set(id, newTarget)
    }


    edit(id: string, order: number, value: string, key: string, prevKey?: string) {
        if (key.trim().length == 0) return

        const target = this.store.get(id)?.find(list => list.order === order)
        if (!target) throw new Error('Editing failed. No environment found.')

        if (prevKey) {
            delete target.pairs[prevKey]
        }
        target.pairs[key] = value
    }

    remove(id: string, key: string, order: number) {
        const target = this.store.get(id)
        if (!target) throw new Error('Could not remove. No environment found')

        const list = target.find((list) => list.order === order)
        delete list?.pairs[key]
    }


    bake(id: string[]) {

        const reduced: Record<string, string | undefined> = {}

        id.forEach(i => {
            const environment = this.store.get(i)
            if (!environment) return

            environment.sort((a, b) => a.order - b.order).forEach((envSet) => {
                Object.keys(envSet.pairs).forEach((key) => {
                    if (envSet.disabled.includes(key)) return
                    reduced[key] = envSet.pairs[key]
                })
            })
        })

        if (Object.keys(reduced).length === 0) {
            throw new Error('Empty environment is not a possible configuration')
        }

        console.log(reduced)
        return reduced
    }












}









