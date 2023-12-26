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


//TODO: this logic does not work as it is supposed to
// problem with keys from differrent order sets having
// same name. They get removed all is even one of them is 
// in the disabled list. 
export const mapEnvs = (obj: ENVs[]) => {

    console.log(obj)

    const all = obj.map(item => item.pairs)
    const disabled = obj.map(item => item.disabled).flat()

    const reduced = {}

    all.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (disabled.includes(key)) return
            reduced[key] = obj[key]
        })
    })

    return reduced
}


export const haveThesameElements = <T>(arr1: T[], arr2: T[]) => {
    return arr1.every(e => arr2.includes((e)))
}






