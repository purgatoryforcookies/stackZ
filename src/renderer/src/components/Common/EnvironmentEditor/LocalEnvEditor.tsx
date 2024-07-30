import { useEffect, useRef, useState } from "react";
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
import { DotEnv } from '@renderer/lang-dotenv'
import { editorTheme, fixedHeightEditor } from "@renderer/lang-dotenv/theme";
import '../../../lang-dotenv/override.css'
import { Button } from "@renderer/@/ui/button";
import { Cmd, CustomClientSocket } from "@t";
import { DotEnvLinter } from "@renderer/lang-dotenv/linter";
import { AcceptWithTabKeymap, DotEnvCompletions } from "@renderer/lang-dotenv/autocomplete";


type LocalEnvEditorProps = {
    data: Exclude<Cmd['command']['env'], undefined>[0]
    socket: CustomClientSocket
    id: string
    setOpen: (open: boolean) => void
}

function LocalEnvEditor({ data, socket, id, setOpen }: LocalEnvEditorProps) {

    const [text, setText] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [hasChanged, setHasChanged] = useState<boolean>(false)
    const [editor, setEditor] = useState<EditorView | null>(null)
    const divRef = useRef<HTMLDivElement>(null);
    const theme = editorTheme()

    useEffect(() => {
        let existingText = ''
        Object.keys(data.pairs).map((key) => {
            existingText += `${key}=${data.pairs[key]}\n`
        })
        existingText = existingText.trimEnd()
        setText(existingText)
    }, [data.pairs])

    const handleSave = () => {

        if (!editor) return
        const newText = editor.state.doc.toString()

        const enc = new TextEncoder()
        const environtAsBuffer = enc.encode(newText)

        socket.emit(
            'environmentListEdit',
            {
                id: id,
                fromFile: environtAsBuffer,
                order: data.order
            },
            (error) => {
                if (error) {
                    setError(error)
                } else {
                    setOpen(false)
                    // Clear text after dialog close animation has ended
                    setTimeout(() => {
                        setText('')
                    }, 300)
                }
            }
        )
    }

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
                    EditorView.updateListener.of(({ state }) => {
                        if (state.doc.toString() !== text) {
                            setHasChanged(true)
                        } else {
                            setHasChanged(false)
                        }
                    }),
                    keymap.of([
                        ...closeBracketsKeymap,
                        ...defaultKeymap,
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                        ...lintKeymap,
                        ...AcceptWithTabKeymap
                    ]),
                    DotEnv(),
                    DotEnvCompletions(id),
                    DotEnvLinter,
                    fixedHeightEditor,
                    theme,

                ],
            })
        })

        setEditor(editor)

        return () => {
            editor.destroy()
            setEditor(null)
        }

    }, [text])

    return (
        <>
            {error ? <p>{error}</p> : null}
            <div ref={divRef} className="h-[calc(100%-150px)]" />
            <Button
                onClick={handleSave}
                className="mt-4 w-full"
                disabled={!hasChanged && !data.remote}
            >
                Save
            </Button>
        </>
    )
}

export default LocalEnvEditor
