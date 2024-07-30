import { acceptCompletion, autocompletion, completionStatus } from '@codemirror/autocomplete'
import { indentLess, indentMore } from '@codemirror/commands'
import { baseSocket } from '@renderer/service/socket'

export const DotEnvCompletions = (id: string) => {
    return autocompletion({
        override: [
            async (context) => {
                return await new Promise((res) => {
                    const word = context.matchBefore(/.*/)
                    if (!word) return res(null)
                    baseSocket.emit('editorAutocompletes', id, (data, _error) => {
                        res({
                            from: word.from,
                            options: data
                        })
                    })
                })
            }
        ]
    })
}

export const AcceptWithTabKeymap = [
    {
        key: 'Tab',
        preventDefault: true,
        shift: indentLess,
        run: (e) => {
            if (!completionStatus(e.state)) return indentMore(e)
            return acceptCompletion(e)
        }
    }
]
