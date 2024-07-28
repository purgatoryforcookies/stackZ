import { useEffect, useRef } from "react";
import { autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
    bracketMatching, defaultHighlightStyle, foldGutter,
    foldKeymap, indentOnInput, syntaxHighlighting
} from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import {
    drawSelection, dropCursor,
    EditorView, highlightActiveLine,
    highlightActiveLineGutter, highlightSpecialChars,

    keymap, lineNumbers,
    tooltips
} from '@codemirror/view'
import { langDotEnv } from '@renderer/lang-dotenv'
import { editorTheme, fixedHeightEditor } from "@renderer/lang-dotenv/theme";
import '../../lang-dotenv/override.css'

type CodeEditorProps = {
    text: string
    setText: (text: string) => void
    placeholder?: string

}

function CodeEditor({ text }: CodeEditorProps) {

    const divRef = useRef<HTMLDivElement>(null);
    const theme = editorTheme()

    useEffect(() => {

        if (!divRef.current) return


        const editor = new EditorView({
            parent: divRef.current,

            state: EditorState.create({
                doc: text,

                extensions: [
                    lineNumbers(),
                    highlightActiveLineGutter(),
                    highlightSpecialChars(),
                    history(),
                    foldGutter(),
                    drawSelection(),
                    dropCursor(),
                    EditorView.lineWrapping,
                    indentOnInput(),
                    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                    bracketMatching(),

                    autocompletion(),
                    tooltips(),
                    highlightActiveLine(),
                    highlightSelectionMatches({ minSelectionLength: 3 }),

                    keymap.of([
                        ...closeBracketsKeymap,
                        ...defaultKeymap,
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                        ...lintKeymap,
                    ]),
                    langDotEnv(),
                    fixedHeightEditor,
                    theme,

                ],
            })
        })

        return () => {
            editor.destroy()
        }

    }, [text])

    return (
        <div ref={divRef} className="h-[75%]">
        </div>
    )
}

export default CodeEditor