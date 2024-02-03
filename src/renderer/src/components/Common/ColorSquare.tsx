type ColorSquareProps = {
  theme: string
}

function ColorSquare({ theme }: ColorSquareProps) {
  return (
    <div className="flex gap-1 absolute left-[45%]" data-theme={theme}>
      <div className="w-4 h-4 bg-background" />
      <div className="w-4 h-4 bg-primary" />
      <div className="w-4 h-4 bg-popover" />
      <div className="w-4 h-4 bg-accent" />
      <div className="w-4 h-4 bg-primary-foreground" />
      <div className="w-4 h-4 bg-secondary-foreground" />
    </div>
  )
}

export default ColorSquare
