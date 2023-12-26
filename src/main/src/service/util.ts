import { readFile } from "fs";
import { Cmd, CmdJsonSchema, ENVs } from "../../../types";


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

export const envFactory = (args: ENVs[] | undefined) => {

    const hostEnv: ENVs = {
        title: "OS Environment",
        pairs: process.env as Record<string, string>,
        order: 0
    }
    if (!args) return [hostEnv]

    const allenvs = args.concat(hostEnv)

    return allenvs.sort((a, b) => a.order - b.order)
}








