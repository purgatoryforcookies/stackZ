import { CheckedState } from '@radix-ui/react-checkbox'
import { Checkbox } from '@renderer/@/ui/checkbox'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import { useEffect, useRef, useState } from 'react'
import { ClientEvents, Cmd, CommandMetaSetting, Status, UtilityEvents } from '@t'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/@/ui/tabs'
import { useTaalasmaa } from '@renderer/hooks/useTaalasmaa'
import { CustomToolTip } from './CustomTooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'

type CommandSettingsProps = {
    expanded: boolean
    data: Status
    engine: TerminalUIEngine
}

function CommandSettings({ expanded, engine, data }: CommandSettingsProps) {
    const [settings, setSettings] = useState<CommandMetaSetting | undefined>(data.cmd.metaSettings)
    const [health, setHealth] = useState<Cmd['metaSettings'] | undefined>(data.cmd.metaSettings)
    const [tab, setTab] = useState<string | undefined>('off')
    const commandRef = useRef<HTMLDivElement>(null)
    const { w } = useTaalasmaa(commandRef)

    const handleSettings = (name: string, value: number | string | CheckedState) => {
        const newSettings: CommandMetaSetting = { ...settings }
        newSettings[name] = value

        engine.socket.emit(UtilityEvents.CMDMETASETTINGS, {
            settings: newSettings
        })
        setSettings(newSettings)
    }

    const handleHealthSettings = (name?: string, value?: number | string) => {
        let newHealth: Cmd['metaSettings'] = {}

        if (typeof value === 'number' && name) {
            newHealth[name] = Number(value)
        } else if (typeof value === 'string' && name) {
            newHealth[name] = String(value)
        } else {
            newHealth = undefined
        }
        setHealth(newHealth)
        engine.socket.emit(UtilityEvents.HEALTHSETTINGS, {
            health: newHealth
        })
    }

    useEffect(() => {
        engine.socket.on(ClientEvents.TERMINALSTATE, (d: Status) => {
            setHealth(d.cmd.metaSettings)
            setSettings(d.cmd.metaSettings)

            if (d.cmd.metaSettings?.delay) setTab('time')
            else if (d.cmd.metaSettings?.healthCheck) setTab('health')
            else setTab('off')
        })

        // Do not remove the socket listener here.
        // This components parent is handling that in case it needs to.
    }, [])

    const isCompact = w && w < 350

    return (
        <div
            className={`transition-opacity duration-500 ease-in-out flex items-center gap-3 justify-center w-full h-full
            ${isCompact ? 'flex-col-reverse gap-0 ' : 'flex-row'}
        ${expanded ? 'opacity-100 py-4' : 'opacity-0'}`}
            ref={commandRef}
        >
            {expanded ? (
                <>
                    <div className={``}>
                        {tab ? (
                            <Tabs value={tab} className="">
                                <TabsList className="w-full">
                                    <TabsTrigger
                                        value="off"
                                        className=" flex gap-2"
                                        onClick={() => {
                                            handleHealthSettings(), setTab('off')
                                        }}
                                        disabled={data.reserved || data.isRunning}
                                    >
                                        Off
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="time"
                                        onClick={() => setTab('time')}
                                        className=" flex gap-2"
                                        disabled={data.reserved || data.isRunning}
                                    >
                                        Time delay
                                        <CustomToolTip message="Time starts to tick when stack is started">
                                            <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                                        </CustomToolTip>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="health"
                                        onClick={() => setTab('health')}
                                        className="flex gap-2"
                                        disabled={data.reserved || data.isRunning}
                                    >
                                        Healthcheck
                                        <CustomToolTip message="Command which on returning 0 starts this terminal">
                                            <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                                        </CustomToolTip>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="time" className="h-full">
                                    <Input
                                        id="delay"
                                        name="delay"
                                        step={500}
                                        min={0}
                                        type="number"
                                        placeholder="milliseconds"
                                        disabled={data.reserved || data.isRunning}
                                        defaultValue={health?.delay}
                                        onChange={(e) =>
                                            handleHealthSettings(
                                                e.target.name,
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </TabsContent>
                                <TabsContent value="health">
                                    <Input
                                        id="healthCheck"
                                        name="healthCheck"
                                        type="text"
                                        disabled={data.reserved || data.isRunning}
                                        autoComplete="off"
                                        placeholder="curl --fail https://google.com || exit 1"
                                        defaultValue={health?.healthCheck}
                                        onChange={(e) =>
                                            handleHealthSettings(e.target.name, e.target.value)
                                        }
                                    />
                                </TabsContent>
                            </Tabs>
                        ) : null}
                    </div>
                    <div className={`flex  gap-5 ${isCompact ? 'flex-row gap-1 p-2' : 'flex-col'}`}>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                name="loose"
                                onCheckedChange={(e) => handleSettings('loose', e)}
                                checked={settings?.loose}
                                disabled={data.reserved || data.isRunning}
                            />
                            <Label htmlFor="interactivity" className="flex items-center gap-2">
                                Loose terminal
                                <CustomToolTip message="Loose terminal does not listen to exits, and does not stop until stopped">
                                    <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                                </CustomToolTip>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                name="rerun"
                                onCheckedChange={(e) => handleSettings('rerun', e)}
                                checked={settings?.rerun}
                                disabled={data.reserved}
                            />
                            <Label htmlFor="rerun">Rerun on exit</Label>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}

export default CommandSettings
