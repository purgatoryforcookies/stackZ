import { createTheme } from 'thememirror'
import { tags as t } from '@lezer/highlight'
import { EditorView } from '@codemirror/view'

export const editorTheme = () => {
    return createTheme({
        variant: 'dark',

        settings: {
            background: 'transparent',
            foreground: '#E6E1C4',
            caret: '#8a8886',
            selection: 'transparent', // Overriden in css
            gutterBackground: 'transparent',
            gutterForeground: '#E6E1C490',
            lineHighlight: 'rgba(1, 1, 0, 0.34)'
        },
        styles: [
            {
                tag: t.meta,
                color: '#7DAF9C'
            },
            {
                tag: t.atom,
                color: '#EFAC32'
            },
            {
                tag: t.separator,
                color: '#4b8fd2',
                paddingRight: '2px',
                paddingLeft: '2px'
            },
            {
                tag: t.comment,
                color: '#f4f1f1'
            },
            {
                tag: t.number,
                color: '#50fa7b',
                fontWeight: 'bold',
                letterSpacing: '0.6px'
            },
            {
                tag: t.strikethrough,
                color: '#8f2e2e',
                fontWeight: 'bold',
                letterSpacing: '0.6px',
                textDecoration: 'line-through'
            }
        ]
    })
}

export const fixedHeightEditor = EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto' }
})
