import { app } from 'electron'
import { join } from 'path'
import { autocompleteSchema, EditorAutocomplete, MkdirError, PaletteStack } from '../../../types'
import { mkdirSync } from 'fs'
import { preloadedCompletes } from '../stores/autocomplete'

const autocompletePath = join(app?.getPath('userData') || '', './autocomplete')

export class AutocompleteService {
    completions: EditorAutocomplete[] = []

    constructor() {
        try {
            mkdirSync(autocompletePath)
        } catch (error) {
            if ((error as MkdirError).code === 'EEXIST') {
                //swallow
            } else {
                console.log(error)
            }
        }
        this.loadLocal()
    }

    async loadLocal() {
        try {
            const raw = autocompleteSchema.parse(preloadedCompletes)
            this.completions = raw
        } catch (error) {
            console.log(error)
        }
        const OScompletions: EditorAutocomplete[] = []
        Object.keys(process.env).forEach((k) => {
            OScompletions.push({
                label: k,
                type: 'keyword',
                section: 'OS environment',
                source: 'Process',
                boost: -30
            })
        })

        this.completions.push(...OScompletions)
    }

    async loadFromStacks(stacks: PaletteStack[]) {
        const completions: EditorAutocomplete[] = []
        stacks.forEach((stack) => {
            stack.env?.forEach((e) => {
                Object.keys(e.pairs).forEach((key) => {
                    completions.push({
                        label: key,
                        type: 'keyword',
                        section: 'stack',
                        detail: `${stack.stackName}/${e.title}`,
                        source: e.title,
                        boost: 10
                    })
                })
            })
            stack.palette?.forEach((palette) => {
                palette.command.env?.forEach((e) => {
                    Object.keys(e.pairs).forEach((key) => {
                        completions.push({
                            label: key,
                            type: 'keyword',
                            section: 'terminal',
                            detail: `${palette.title}/${e.title}`,
                            source: e.title,
                            boost: 20
                        })
                    })
                })
            })
        })

        this.completions.push(...completions)
    }
}
