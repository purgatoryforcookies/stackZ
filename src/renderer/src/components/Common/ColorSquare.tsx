
type ColorSquareProps = {
    theme: string
}


function ColorSquare({ theme }: ColorSquareProps) {
    return (
        <div className="flex gap-1 absolute left-[45%]">
            <div
                className="w-4 h-4 bg-background"
                data-theme={theme}
            />
            <div
                className="w-4 h-4 bg-primary"
                data-theme={theme}
            />
            <div
                className="w-4 h-4 bg-popover"
                data-theme={theme}
            />
            <div
                className="w-4 h-4 bg-accent"
                data-theme={theme}
            />
            <div
                className="w-4 h-4 bg-primary-foreground"
                data-theme={theme}
            />
            <div
                className="w-4 h-4 bg-secondary-foreground"
                data-theme={theme}
            />
        </div>



    )
}

export default ColorSquare