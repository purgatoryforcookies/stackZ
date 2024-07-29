import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

type ParserState = {
    key: boolean
}

const DotnEnvLanguage = StreamLanguage.define({
    name: 'dotenv',
    startState: () => {
        return {}
    },
    token: (stream, state: ParserState) => {
        if (stream.string.startsWith('#')) {
            stream.next()
            return 'comment'
        }

        if (!state.key && stream.sol()) {
            const key = stream.string.split('=')[0]

            if (key.indexOf(' ') >= 0 || !Number.isNaN(Number(key[0]))) {
                stream.pos = key.length
                state.key = true
                return 'faulKey'
            } else {
                stream.pos = key.length
                state.key = true
                return 'key'
            }
        }

        if (stream.match('=')) {
            state.key = false
            return 'separator'
        }

        const value = stream.string.split('=')[1]

        if (!Number.isNaN(Number(value))) {
            stream.pos += value.length
            stream.next()
            return 'number'
        }

        stream.pos += value.length
        stream.next()
        return 'value'
    },
    languageData: {
        commentTokens: { line: '#' }
    },
    tokenTable: {
        key: t.meta,
        separator: t.separator,
        value: t.atom,
        lineComment: t.comment,
        faulKey: t.strikethrough
    }
})

export function DotEnv() {
    return new LanguageSupport(DotnEnvLanguage)
}
