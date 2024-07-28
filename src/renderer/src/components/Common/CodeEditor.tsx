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


import { useEffect, useRef } from "react";


type CodeEditorProps = {
    text: string
    setText: (text: string) => void
    placeholder?: string

}


function CodeEditor({ text }: CodeEditorProps) {

    const divRef = useRef<HTMLDivElement>(null);


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
                    EditorState.allowMultipleSelections.of(true),
                    indentOnInput(),
                    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                    bracketMatching(),
                    autocompletion(),
                    tooltips(),
                    highlightActiveLine(),
                    highlightSelectionMatches(),

                    keymap.of([
                        ...closeBracketsKeymap,
                        ...defaultKeymap,
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                        ...lintKeymap,
                    ]),
                    langDotEnv()

                ],
            })

        })

        return () => {
            editor.destroy()
        }

    }, [])



    return (
        <div ref={divRef} className="h-full bg-white/50">
        </div>
    )
}

export default CodeEditor