import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Checkbox } from "@renderer/@/ui/checkbox"
import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@renderer/@/ui/tooltip"
import { useState } from "react"
import { Cmd } from "src/types"

type CommandSettingsProps = {
    expanded: boolean
    data: Exclude<Cmd, undefined>
}

const CustomToolTip = (props: { message: string }) => {
    return <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
                <p>{props.message}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
}



function CommandSettings({ expanded, data }: CommandSettingsProps) {

    const [settings, setSettings] = useState({})





    return (
        <div className={`p-2 h-full w-full rounded-lg flex justify-evenly items-center
        transition-opacity duration-500 ease-in-out
        ${expanded ? "opacity-100" : "opacity-0"}
        `}>

            <div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="delay" className="flex items-center gap-2">
                        Start delay ms <CustomToolTip message='Delays take effect only when the whole stack is started' />
                    </Label>
                    <Input id="delay" className="w-32" type="number" defaultValue={0} />
                </div>

            </div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center space-x-2">
                    <Checkbox id="interactivity" />
                    <Label htmlFor="interactivity" className="flex items-center gap-2">
                        Loose terminal
                        <CustomToolTip message='Loose terminal does not listen to exits, and does not stop until stopped' />
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="rerun" />
                    <Label htmlFor="rerun">Rerun on exit</Label>
                </div>
            </div>


        </div>
    )
}

export default CommandSettings