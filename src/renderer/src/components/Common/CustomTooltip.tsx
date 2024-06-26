import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/@/ui/tooltip'

export const CustomToolTip = ({
    children,
    message,
    hidden
}: {
    children: React.ReactNode
    message: string
    hidden?: boolean
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>{children}</TooltipTrigger>
                {!hidden ? (
                    <TooltipContent>
                        <p className="font-semibold text-[0.8rem]">{message}</p>
                    </TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    )
}
