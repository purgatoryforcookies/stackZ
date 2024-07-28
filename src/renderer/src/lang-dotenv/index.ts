import { parser } from '../lang-dotenv/syntax.grammar'
import { LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'

export const dotenv = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Key: t.meta,
                Value: t.atom,
                Separator: t.separator,
                LineComment: t.comment,
                Number: t.number
            })
        ]
    }),
    languageData: {
        commentTokens: { line: '#' }
    }
})

export function langDotEnv() {
    return new LanguageSupport(dotenv)
}
