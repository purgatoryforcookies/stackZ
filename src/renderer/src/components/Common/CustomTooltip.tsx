import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/@/ui/tooltip'

export const CustomToolTip = ({
    children,
    message,
    hidden,
    className
}: {
    children: React.ReactNode
    message: string
    hidden?: boolean
    className?: React.ComponentProps<'div'>['className']
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>{children}</TooltipTrigger>
                {!hidden ? (
                    <TooltipContent className={`${className || ''}`}>
                        <p className="font-semibold text-[0.8rem]">{message}</p>
                    </TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    )
}
