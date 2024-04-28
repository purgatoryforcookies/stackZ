import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Button } from "@renderer/@/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@renderer/@/ui/dialog"
import { CustomToolTip } from "../Common/CustomTooltip"
import { useContext } from "react"
import { ThemeContext } from "@renderer/App"

function Sequencing() {

    const theme = useContext(ThemeContext)

    return (
        <Dialog>
            <CustomToolTip message="Similar to linux yes(1).">
                <DialogTrigger asChild>

                    <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                </DialogTrigger>
            </CustomToolTip>
            <DialogContent data-theme={theme}>
                <DialogHeader>
                    <DialogTitle className='flex items-center'>Yes sequencing - Kinda like
                        <Button variant={'link'} className='text-md 
                                                text-secondary-foreground 
                                                flex flex-col
                                                relative top-[1px] right-3
                                                '>
                            <p>linux(1)</p>
                        </Button>
                    </DialogTitle>
                    <DialogDescription>
                        This is how you use it:
                        <div className='text-[0.8rem] flex flex-col p-1'>
                            {['Enable it from the checkbox.',
                                'Run the command and do the dance manually.',
                                'Come back here and fill in the dance steps.'
                            ].map((step, i) => (
                                <span key={i} className="flex gap-1 items-center">
                                    <span>{i + 1}.</span>
                                    <span>{step}</span>
                                </span>
                            ))}
                        </div>
                        <p className=''>
                            After setup, these steps are then given to the terminal on next runs.
                        </p>
                        <div className=' my-3'>
                            Tip:
                            <p className=''>
                                You can provide either a string or, a command returning a string, into the steps.
                            </p>
                            <p className=''>
                                This is useful for passwords and secrets stored in external services (for e.g. Aws Secrets Manager)
                            </p>
                        </div>
                    </DialogDescription>

                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}

export default Sequencing