import { readFile } from "fs";
import { Cmd, CmdJsonSchema } from "../../../types";


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








