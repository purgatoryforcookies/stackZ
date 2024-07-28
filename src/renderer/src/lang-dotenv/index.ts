import { parser } from '../lang-dotenv/syntax.grammar'
import { LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'

export const dotenv = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Key: t.unit,
                Value: t.atom,
                Separator: t.blockComment,
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
