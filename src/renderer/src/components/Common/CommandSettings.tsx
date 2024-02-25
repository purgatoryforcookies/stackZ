import { CheckedState } from '@radix-ui/react-checkbox'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Checkbox } from '@renderer/@/ui/checkbox'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/@/ui/tooltip'
import { useEffect, useState } from 'react'
import { ClientEvents, Cmd, CommandMetaSetting, Status, UtilityEvents } from '@t'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/@/ui/tabs'


type CommandSettingsProps = {
    expanded: boolean
    data: Exclude<Cmd, undefined>
    engine: TerminalUIEngine
}

const CustomToolTip = ({ message }: { message: string }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function CommandSettings({ expanded, engine }: CommandSettingsProps) {
    const [settings, setSettings] = useState<CommandMetaSetting | undefined>()
    const [health, setHealth] = useState<Cmd['health'] | undefined>()
    const [tab, setTab] = useState<string | undefined>('off')


    const handleSettings = (name: string, value: number | string | CheckedState) => {

        const newSettings: CommandMetaSetting = { ...settings }
        newSettings[name] = value

        engine.socket.emit(UtilityEvents.CMDMETASETTINGS, {
            settings: newSettings
        })
        setSettings(newSettings)
    }

    const handleHealthSettings = (name?: string, value?: number | string) => {

        let newHealth: Cmd['health'] = {}

        if (typeof value === 'number' && name) {
            newHealth[name] = Number(value)
        }
        else if (typeof value === 'string' && name) {
            newHealth[name] = String(value)
        }
        else {
            newHealth = undefined
        }
        engine.socket.emit(UtilityEvents.HEALTHSETTINGS, {
            health: newHealth
        })
        setHealth(newHealth)

    }

    useEffect(() => {
        engine.socket.on(ClientEvents.TERMINALSTATE, (d: Status) => {
            setHealth(d.cmd.health)
            setSettings(d.cmd.metaSettings)

            if (d.cmd.health?.delay) setTab('time')
            else if (d.cmd.health?.healthCheck) setTab('health')
            else setTab('off')
        })

        return () => {
            engine.socket.off(ClientEvents.TERMINALSTATE)
        }

    }, [expanded])

    return (
        <div
            className={`h-full w-full rounded-lg flex justify-evenly items-center
        ${expanded ? '' : ' hidden'}`}
        >
            <div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    {tab ? <Tabs value={tab} className='h-full'>
                        <TabsList className='w-[20rem]'>
                            <TabsTrigger value="off" className='w-[100%] flex gap-2' onClick={() => handleHealthSettings()}>Off</TabsTrigger>
                            <TabsTrigger value="time" onClick={() => setTab('time')} className='w-[100%] flex gap-2'>Time delay
                                <CustomToolTip message="Time starts to tick when previous terminal has started" />
                            </TabsTrigger>
                            <TabsTrigger value="health" onClick={() => setTab('health')} className='w-[100%] flex gap-2'>Healthcheck
                                <CustomToolTip message="Command which on returning 0 starts this terminal" />
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="time" className='h-full'>
                            <Input
                                id="delay"
                                name="delay"
                                step={500}
                                min={0}
                                type="number"
                                placeholder='milliseconds'
                                defaultValue={health?.delay}
                                onChange={(e) => handleHealthSettings(e.target.name, Number(e.target.value))}
                            />
                        </TabsContent>
                        <TabsContent value="health">

                            <Input
                                id="healthCheck"
                                name="healthCheck"
                                type="text"
                                autoComplete='off'
                                placeholder='curl --fail https://google.com || exit 1'
                                defaultValue={health?.healthCheck}
                                onChange={(e) => handleHealthSettings(e.target.name, e.target.value)}
                            />

                        </TabsContent>
                    </Tabs>
                        : null}
                </div>
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        name="loose"
                        onCheckedChange={(e) => handleSettings('loose', e)}
                        checked={settings?.loose}
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
                        checked={settings?.rerun}
                    />
                    <Label htmlFor="rerun">Rerun on exit</Label>
                </div>
            </div>
        </div>
    )
}

export default CommandSettings
