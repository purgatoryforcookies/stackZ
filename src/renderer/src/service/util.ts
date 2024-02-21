/**
 *
 * The governor is responsible for orchestrating terminals from
 * different stacks.
 *
 * Check the selectionEvents for more.
 *
 * A callback function can be provided, which will be called
 * after each event.
 *
 *
 */
// export const governor = (stack: number,
//     terminal: number,
//     method = SelectionEvents.CONN, cb?: (...args: any) => void) => {

//         switch (method) {

//             case SelectionEvents.CONN:
//               if (cb) cb()
//               setSelected(id)
//               break
//             case SelectionEvents.START:
//               window.api.startTerminal(id)
//               if (cb) cb()
//               break
//             case SelectionEvents.EXPAND:
//               setEditMode(!editMode)
//               break
//             default:
//               break
//           }

// }

export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}
