import { Checkbox } from "@renderer/@/ui/checkbox"
import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@renderer/@/ui/sheet"
import { ThemeContext } from "@renderer/App"
import { TerminalUIEngine } from "@renderer/service/TerminalUIEngine"
import { useContext } from "react"
import { CustomToolTip } from "./CustomTooltip"
import { CheckIcon, HamburgerMenuIcon, InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import useCommandSettings from "@renderer/hooks/useCommandSettings"

type CommandSettingsProps = {
    engine: TerminalUIEngine
}


function CommandSettings2({ engine }: CommandSettingsProps) {
    const theme = useContext(ThemeContext)

    const { settings, onMetaChange, onChange, isLoading } = useCommandSettings(engine)


    return (
        <Sheet>
            <SheetTrigger>
                <HamburgerMenuIcon className={`h-4 w-4 moveHandle
                            text-secondary-foreground hover:scale-125 hover:cursor-pointer'}`} />
            </SheetTrigger>
            <SheetContent side={'left'} data-theme={theme} className="sm:max-w-none w-[40rem]"
                onOpenAutoFocus={(e) => e.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Terminal Settings</SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                </SheetHeader>
                <div className="h-5"></div>
                <div>
                    <h2 className="text-white/50 m-1 mb-3">General</h2>

                    <Label htmlFor="cwd" className="text-right p-1">
                        Cwd
                    </Label>
                    <Input
                        id="cwd"
                        name="cwd"
                        className="col-span-3"
                        defaultValue={settings?.cwd}
                        onBlur={(e) => onChange('cwd', e.target.value)}
                    />
                    <Label htmlFor="command" className="text-right p-1">
                        Command
                    </Label>
                    <Input
                        id="command"
                        name="command"
                        className="col-span-3"
                        defaultValue={settings?.cmd.command.cmd}
                        onBlur={(e) => onChange('cmd', e.target.value)}
                    />
                    <div className="flex justify-between gap-3">
                        <div>
                            <Label htmlFor="shell" className="text-right p-1">
                                Shell
                            </Label>
                            <Input
                                id="shell"
                                name="shell"
                                defaultValue={settings?.cmd.command.shell}
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
                                defaultValue={settings?.cmd.title}
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
                                Delay s
                            </Label>
                            <Input
                                id="delay"
                                className="w-28"
                                type="number"
                                name="delay"
                                min={0}
                                step={1}
                                value={settings?.cmd.metaSettings?.delay ? settings?.cmd.metaSettings?.delay / 1000 : undefined}
                                onChange={(e) => onMetaChange({
                                    target: {
                                        name: 'delay',
                                        value: Number(e.target.value) * 1000
                                    }
                                })}
                                placeholder="seconds"
                            />
                        </div>
                        <div className="w-full">

                            <Label htmlFor="healthcheck" className="text-right p-1">
                                Healthcheck
                            </Label>
                            <Input
                                id="healthcheck"
                                className="w-full"
                                name="healthCheck"
                                placeholder="curl --fail https://google.com || exit 1"
                                defaultValue={settings?.cmd.metaSettings?.healthCheck}
                                onBlur={onMetaChange}
                            />
                        </div>
                    </div>
                    <div className="h-4"></div>


                    <div className="flex items-center space-x-2">

                        <Checkbox
                            checked={settings?.cmd.metaSettings?.halt}
                            onCheckedChange={(e) => onMetaChange({
                                target: {
                                    name: 'halt',
                                    value: e
                                }
                            })}

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
                            checked={settings?.cmd.metaSettings?.loose}
                            onCheckedChange={(e) => onMetaChange({
                                target: {
                                    name: 'loose',
                                    value: e
                                }
                            })}
                        />
                        <Label htmlFor="loose" className="flex items-center gap-2">
                            Loose terminal
                            <CustomToolTip message="Loose terminal does not listen to exits, and does not stop until stopped">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.rerun}
                            onCheckedChange={(e) => onMetaChange({
                                target: {
                                    name: 'rerun',
                                    value: e
                                }
                            })}
                        />
                        <Label htmlFor="rerun" className="flex items-center gap-2">
                            Rerun on exit
                            <CustomToolTip message="Rerun on any exit code until manually stopped">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                        <Checkbox
                            checked={settings?.cmd.metaSettings?.ctrlc}
                            onCheckedChange={(e) => onMetaChange({
                                target: {
                                    name: 'ctrlc',
                                    value: e
                                }
                            })}
                        />
                        <Label htmlFor="ctrlc" className="flex items-center gap-2">
                            Send CTRL-C on exit
                            <CustomToolTip message="Useful when terminal controls other services, for e.g. docker which does not get terminated with the terminal process">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                    </div>

                    <div>
                        <div className="h-10"></div>
                        <div className="flex justify-end gap-3">
                            {isLoading ? <ReloadIcon className="h-4 w-4 animate-spin" />
                                : <CheckIcon className="h-4 w-4" />}
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet >
    )
}

export default CommandSettings2