import { ZodTypeAny } from 'zod'
import { readJsonFile } from '../util/util'
import { writeFileSync } from 'fs'
import { PaletteStack } from '../../../types'

/**
 * DataStores job is to handle saving and loading the settings from a file.
 * Currently this is a json file.
 *
 */
export class DataStore {
    constructor() {}

    async load(path: string, schema: ZodTypeAny) {
        try {
            const raw = await readJsonFile(path, schema)
            return raw
        } catch (error) {
            console.log(error)
        }
    }

    save(filepath: string, object: PaletteStack[]) {
        writeFileSync(filepath, JSON.stringify(object), 'utf-8')
    }
}
