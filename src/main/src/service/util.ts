import { readFile } from "fs";
import { Cmd, CmdJsonSchema, ENVs, JsonEnv } from "../../../types";


export const readJsonFile = (path: string): Promise<Cmd[]> => {

    return new Promise((res, rej) => {

        readFile(path, 'utf-8', (err, data) => {
            if (err) rej({ message: "could not read json file" })
            try {
                const file = CmdJsonSchema.parse(JSON.parse(data))
                res(file)

            } catch (error) {
                rej(error)
            }

        })
    })
}

export const parseVariables = (cmd: string) => {

    return []
}

export const envFactory = (args: JsonEnv[] | undefined) => {

    const hostEnv: ENVs = {
        title: "OS Environment",
        pairs: process.env as Record<string, string>,
        order: 0,
        disabled: []
    }
    if (!args) return [hostEnv]

    const allenvs = (args.map((obj) => ({ ...obj, disabled: [] })) as ENVs[]).concat(hostEnv)

    return allenvs.sort((a, b) => a.order - b.order)
}


export const mapEnvs = (obj: ENVs[]) => {

    const reduced: Record<string, string | undefined> = {}
    obj.forEach(envSet => {
        Object.keys(envSet.pairs).forEach(key => {
            if (envSet.disabled.includes(key)) return
            reduced[key] = envSet.pairs[key]


        })
    })
    return reduced
}


export const haveThesameElements = <T>(arr1: T[], arr2: T[]) => {
    return arr1.every(e => arr2.includes((e)))
}






