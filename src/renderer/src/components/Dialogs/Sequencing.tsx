import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@renderer/@/ui/dialog"
import { CustomToolTip } from "../Common/CustomTooltip"
import { useContext } from "react"
import { ThemeContext } from "@renderer/App"

function Sequencing() {

    const theme = useContext(ThemeContext)

    return (
        <Dialog>
            <CustomToolTip message="Sequence your inputs for automated terminal jobs. Click to read more...">
                <DialogTrigger asChild>

                    <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                </DialogTrigger>
            </CustomToolTip>
            <DialogContent data-theme={theme}>
                <DialogHeader>
                    <DialogTitle className='flex items-center pb-3'>Yes sequencing
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

                        <div className='my-3 text-white'>
                            <p className=''>
                                After setup, these steps are then given to the terminal on next runs.
                            </p>
                            <p className=''>
                                Each step is a command which should output a string when run in a shell specified by your terminal.
                            </p>
                            <p className='text-red-500 pt-5'>
                                Keep in mind, values you fill in to the steps will be stored plaintext in stacks.json file.
                            </p>
                        </div>

                    </DialogDescription>

                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}

export default Sequencing