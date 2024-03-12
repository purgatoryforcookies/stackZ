import { ZodTypeAny } from 'zod'
import { readJsonFile } from '../util/util'
import { writeFileSync } from 'fs'
import { PaletteStack } from '../../../types'

/**
 * DataStores job is to handle saving and loading the settings from a file.
 * Currently this is a json file.
 *
 * DataStore also can sync settings from a Palette, or a Stack.
 * When stacks and palettes are created from the source file,
 * their link breaks. Changes to palettes settings dont reflect to
 * source file without explicit sync.
 */
export class DataStore {
    path: string
    schema: ZodTypeAny

    constructor(path: string, schema: ZodTypeAny) {
        this.path = path
        this.schema = schema
    }

    async load() {
        try {
            const raw = await readJsonFile(this.path, this.schema)
            return raw
        } catch (error) {
            console.log(error)
        }
    }

    save(filepath: string, object: PaletteStack[]) {
        writeFileSync(filepath, JSON.stringify(object), 'utf-8')
    }
}
