import { CheckedState } from '@radix-ui/react-checkbox'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Checkbox } from '@renderer/@/ui/checkbox'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/@/ui/tooltip'
import { baseSocket } from '@renderer/service/socket'
import { useState } from 'react'
import { Cmd, CommandMetaSetting } from '@t'

type CommandSettingsProps = {
    expanded: boolean
    data: Exclude<Cmd, undefined>
    stackId: string
}

const CustomToolTip = (props: { message: string }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{props.message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function CommandSettings({ expanded, data, stackId }: CommandSettingsProps) {
    const [settings, setSettings] = useState<CommandMetaSetting>(
        data.metaSettings ?? {
            delay: 0,
            loose: false,
            rerun: false
        }
    )

    const handleSettings = (name: string, value: number | CheckedState) => {
        if (!name) return

        const newSettings = { ...settings }
        newSettings[name] = value

        baseSocket.emit('commandMetaSetting', {
            stack: stackId,
            terminal: data.id,
            settings: newSettings
        })
        setSettings(newSettings)
    }

    return (
        <div className={`h-full w-full rounded-lg flex justify-evenly items-center
        ${expanded ? '' : ' hidden'}`}
        >
            <div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="delay" className="flex items-center gap-2">
                        Start delay ms
                        <CustomToolTip
                            message="For delaying terminal when starting the stack"
                        />
                    </Label>
                    <Input
                        id="delay"
                        name="delay"
                        className="w-32"
                        type="number"
                        defaultValue={settings.delay}
                        onChange={(e) => handleSettings(e.target.name, Number(e.target.value))}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center space-x-2">
                    <Checkbox

                        name="loose"
                        onCheckedChange={(e) => handleSettings('loose', e)}
                        checked={settings.loose}
                    />
                    <Label htmlFor="interactivity" className="flex items-center gap-2">
                        Loose terminal
                        <CustomToolTip message="Loose terminal does not listen to exits, and does not stop until stopped" />
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox

                        name="rerun"
                        onCheckedChange={(e) => handleSettings('rerun', e)}
                        checked={settings.rerun}
                    />
                    <Label htmlFor="rerun">Rerun on exit</Label>
                </div>
            </div>
        </div>
    )
}

export default CommandSettings
