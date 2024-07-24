import { Checkbox } from '@renderer/@/ui/checkbox'
import { Input } from '@renderer/@/ui/input'
import { Label } from '@renderer/@/ui/label'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@renderer/@/ui/sheet'
import { ThemeContext } from '@renderer/App'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { useContext } from 'react'
import { CustomToolTip } from './CustomTooltip'
import {
    CheckIcon,
    HamburgerMenuIcon,
    InfoCircledIcon,
    LinkBreak2Icon,
    ReloadIcon
} from '@radix-ui/react-icons'
import useCommandSettings from '@renderer/hooks/useCommandSettings'
import InputWithMagic from './InputWithMagic'
import Sequencing from '../Dialogs/Sequencing'

export type CommandSettingsProps = {
    engine: TerminalUIEngine
}

function CommandSettings({ engine }: CommandSettingsProps) {
    const theme = useContext(ThemeContext)

    const tools = useCommandSettings(engine)
    const { settings, onChange, isLoading, isPending, setIsPending, open, setOpen } = tools

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
                <HamburgerMenuIcon
                    className={`h-4 w-4 moveHandle
                            text-secondary-foreground hover:scale-125 hover:cursor-pointer'}`}
                />
            </SheetTrigger>
            <SheetContent
                side={'left'}
                data-theme={theme.theme}
                className="sm:max-w-none w-[50rem]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle className="flex items-center">
                        Terminal Settings
                        <div className="relative left-2 top-[2px] gap-3">
                            {isLoading ? (
                                <ReloadIcon className="h-4 w-4 animate-spin" />
                            ) : isPending ? (
                                <LinkBreak2Icon className="h-4 w-4 text-orange-600" />
                            ) : (
                                <CheckIcon className="h-4 w-4" />
                            )}
                        </div>
                    </SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>
                <div className="h-5"></div>

                <div>
                    <h2 className="text-white/50 m-1 mb-3">General</h2>

                    <InputWithMagic
                        engine={engine}
                        tools={tools}
                        title="Cwd"
                        defaultValue={settings?.cmd.command.cwd || ''}
                        valueKey="cwd"
                        historyKey="CWD"
                        placeholder="/path/to/your/project"
                    />

                    <InputWithMagic
                        engine={engine}
                        tools={tools}
                        title="Command"
                        defaultValue={settings?.cmd.command.cmd || ''}
                        valueKey="cmd"
                        historyKey="CMD"
                    />
                    <div className="flex justify-between gap-3">
                        <div>
                            <Label htmlFor="shell" className="text-right p-1">
                                Shell
                            </Label>
                            <Input
                                id="shell"
                                name="shell"
                                defaultValue={settings?.cmd.command.shell || ''}
                                onChange={() => setIsPending(true)}
                                onBlur={(e) => onChange('shell', e.target.value)}
                            />
                        </div>
                        <div className="w-full">
                            <Label htmlFor="notes" className="text-right p-1">
                                Notes
                            </Label>
                            <Input
                                id="notes"
                                name="title"
                                defaultValue={settings?.cmd.title || ''}
                                onChange={() => setIsPending(true)}
                                onBlur={(e) => onChange('title', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="h-10"></div>
                <div>
                    <h2 className="text-white/50 m-1 mb-3">Stack mode</h2>

                    <div className="flex gap-2">
                        <div>
                            <Label htmlFor="delay" className="text-right p-1">
                                Delay
                            </Label>
                            <Input
                                id="delay"
                                className="w-28"
                                type="number"
                                name="delay"
                                min={0}
                                step={1}
                                value={
                                    settings?.cmd.metaSettings?.delay
                                        ? settings?.cmd.metaSettings?.delay / 1000
                                        : ''
                                }
                                onChange={(e) => onChange('delay', Number(e.target.value) * 1000)}
                                placeholder="seconds"
                            />
                        </div>
                        <div className="w-full">
                            <InputWithMagic
                                engine={engine}
                                tools={tools}
                                title="Healthcheck"
                                defaultValue={settings?.cmd.metaSettings?.healthCheck || ''}
                                valueKey="healthCheck"
                                historyKey="HEALTH"
                            />
                        </div>
                    </div>
                    <div className="h-4"></div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.halt || false}
                            onCheckedChange={(e) => onChange('halt', e)}
                        />
                        <Label htmlFor="halt" className="flex items-center gap-2">
                            Halt until exit
                            <CustomToolTip message="Halts the stack startup from proceeding to next until this one exits">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                    </div>
                </div>
                <div className="h-10"></div>

                <div>
                    <h2 className="text-white/50 m-1 mb-3">Other settings</h2>
                    <div className="h-4"></div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.loose || false}
                            onCheckedChange={(e) => onChange('loose', e)}
                        />
                        <Label htmlFor="loose" className="flex items-center gap-2">
                            Loose terminal
                            <CustomToolTip message="Loose terminal does not listen to exits, and does not stop until stopped">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.rerun || false}
                            onCheckedChange={(e) => onChange('rerun', e)}
                        />
                        <Label htmlFor="rerun" className="flex items-center gap-2">
                            Rerun on exit
                            <CustomToolTip message="Rerun on any exit code until manually stopped">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.ctrlc || false}
                            onCheckedChange={(e) => onChange('ctrlc', e)}
                        />
                        <Label htmlFor="ctrlc" className="flex items-center gap-2">
                            Send CTRL-C on exit
                            <CustomToolTip message="Useful when terminal controls other services, for e.g. docker which does not get terminated with the terminal process">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                    </div>
                </div>
                <div>
                    <div className="h-10"></div>
                </div>

                <div className="h-2"></div>

                <div>
                    <h2 className="text-white/50 m-1 mb-3">Automation</h2>
                    <div className="h-4"></div>

                    <div className="flex items-center space-x-2 relative">
                        <Checkbox
                            id="sequencing"
                            checked={Boolean(settings?.cmd.metaSettings?.sequencing) || false}
                            onCheckedChange={(e) => onChange('sequencing', e ? [] : undefined)}
                        />
                        <Label htmlFor="sequencing" className="flex items-center gap-2">
                            Yes sequencing
                            <Sequencing />
                        </Label>
                        {settings?.cmd.metaSettings?.sequencing &&
                        settings?.cmd.metaSettings?.sequencing.length > 0 ? (
                            <p className="text-sm absolute right-0 top-0">Secret?</p>
                        ) : null}
                    </div>
                    <div className="h-3"></div>
                    <div className="flex flex-col gap-2 relative">
                        {settings?.cmd.metaSettings?.sequencing &&
                            settings.cmd.metaSettings.sequencing.map((seq, i) => (
                                <div key={seq.index} className="flex items-center">
                                    <Input
                                        id={seq.index.toString()}
                                        tabIndex={i}
                                        name={seq.index.toString()}
                                        placeholder={seq.message}
                                        defaultValue={seq.echo || ''}
                                        onChange={() => setIsPending(true)}
                                        onBlur={(e) =>
                                            onChange('sequencing', { ...seq, echo: e.target.value })
                                        }
                                    />
                                    <Label
                                        htmlFor={seq.index.toString()}
                                        className="text-right p-1"
                                    >
                                        :{seq.index}
                                    </Label>
                                    <div className="flex items-center space-x-1 px-3">
                                        <Checkbox
                                            checked={seq.secret || false}
                                            onCheckedChange={() => {
                                                const was = seq.secret
                                                if (!was) {
                                                    onChange('sequencing', { ...seq, secret: true })
                                                } else {
                                                    onChange('sequencing', {
                                                        ...seq,
                                                        secret: false
                                                    })
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default CommandSettings
