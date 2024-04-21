//  eslint-disable-next-line
export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    // eslint-disable-next-line
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

export function selectColor(number: number) {
    const hue = number * 25
    return `hsl(${hue},50%,40%)`
}
