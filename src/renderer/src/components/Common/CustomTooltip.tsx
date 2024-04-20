import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/@/ui/tooltip'

export const CustomToolTip = ({
    children,
    message,
    hidden
}: {
    children: JSX.Element
    message: string
    hidden?: boolean
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                {!hidden ? (
                    <TooltipContent>
                        <p className='text-bold text-[1rem]'>{message}</p>
                    </TooltipContent>
                ) : null}
            </Tooltip>
        </TooltipProvider>
    )
}
