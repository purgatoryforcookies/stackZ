type ColorSquareProps = {
    theme: string
}

function ColorSquare({ theme }: ColorSquareProps) {
    return (
        <div className="flex gap-1 absolute left-[45%]" data-theme={theme}>
            <div className="w-4 h-4 bg-primary" title="primary" />
            <div className="w-4 h-4 bg-gradient" title="background" />
            <div className="w-4 h-4 bg-popover" title="popover" />
            <div className="w-4 h-4 bg-accent" title="accent" />
            <div className="w-4 h-4 bg-border" title="border" />
            <div className="w-4 h-4 bg-card" title="card" />
            <div className="w-4 h-4 bg-primary-foreground" title="primary-foreground" />
            <div className="w-4 h-4 bg-secondary-foreground" title="secondary-foreground" />
        </div>
    )
}

export default ColorSquare
