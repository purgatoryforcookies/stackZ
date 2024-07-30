import { syntaxTree } from '@codemirror/language'
import { linter, Diagnostic } from '@codemirror/lint'

// TODO: consider using regex for linting the stream and not with node.names?
export const DotEnvLinter = linter((view) => {
    let diagnostics: Diagnostic[] = []
    syntaxTree(view.state)
        .cursor()
        .iterate((node) => {
            if (node.name === 'keywithspace') {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: 'warning',
                    message: 'Key should not contain spaces. Use underscores instead.'
                })
            }
            if (node.name === 'keywithnumber') {
                diagnostics.push({
                    from: node.from,
                    to: node.to,
                    severity: 'warning',
                    message: 'Key should not start with a number.'
                })
            }
        })
    return diagnostics
})
