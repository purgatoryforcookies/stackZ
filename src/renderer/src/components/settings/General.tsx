import { ArrowUpIcon, ArrowDownIcon, FileTextIcon } from '@radix-ui/react-icons'
import { Button } from '@renderer/@/ui/button'
import ColorSquare from '../Common/ColorSquare'
import KillSignal from '../Common/KillSignal'
import { Label } from '@renderer/@/ui/label'
import { Input } from '@renderer/@/ui/input'
import { RadioGroup, RadioGroupItem } from '@renderer/@/ui/radio-group'
import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '@renderer/App'
import { SettingsProps } from './Settings'
import { StoreType } from '@t'

function General({ setTheme }: Omit<SettingsProps, 'stack'>) {
    const theme = useContext(ThemeContext)

    const [defShell, setDefShell] = useState<string>()
    const [defCwd, setDefCwd] = useState<string>()

    useEffect(() => {
        const fetchStore = async () => {
            const userSettings = (await window.store.get(
                'userSettings'
            )) as StoreType['userSettings']
            if (userSettings.global.defaultCwd) setDefCwd(userSettings.global.defaultCwd)
            if (userSettings.global.defaultShell) setDefShell(userSettings.global.defaultShell)
        }
        fetchStore()
    }, [open])

    return (
        <>
            <div className="py-8">
                <Label className="text-right">General</Label>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4 ">
                        <Label htmlFor="shell" className="text-right">
                            Default terminal
                        </Label>
                        <Input
                            id="shell"
                            defaultValue={defShell}
                            placeholder="path..."
                            spellCheck={false}
                            className="col-span-3 text-secondary-foreground"
                            onChange={(e) => {
                                window.store.set(
                                    'userSettings.global.defaultShell',
                                    e.target.value.length > 0 ? e.target.value : null
                                )
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 ">
                        <Label htmlFor="cwd" className="text-right">
                            Default CWD
                        </Label>
                        <Input
                            id="cwd"
                            placeholder="path..."
                            className="col-span-3 text-secondary-foreground"
                            defaultValue={defCwd}
                            onChange={(e) => {
                                window.store.set(
                                    'userSettings.global.defaultCwd',
                                    e.target.value.length > 0 ? e.target.value : null
                                )
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cwd" className="text-right">
                            Kill signal
                        </Label>
                        <KillSignal />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 py-5 ">
                        <Label htmlFor="theme" className="text-right">
                            Theme
                        </Label>
                        <RadioGroup defaultValue={theme} className="text-secondary-foreground">
                            <div className="flex items-center space-x-2 ">
                                <RadioGroupItem
                                    value="dark"
                                    id="r1"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r1">Dark</Label>
                                <ColorSquare theme="dark" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="aurora"
                                    id="r2"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r2">Aurora</Label>
                                <ColorSquare theme="aurora" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="north"
                                    id="r2"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r2">North</Label>
                                <ColorSquare theme="north" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="morning"
                                    id="r3"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r3">Morning</Label>
                                <ColorSquare theme="morning" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="forrest"
                                    id="r4"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r4">Forrest</Label>
                                <ColorSquare theme="forrest" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="pink"
                                    id="r4"
                                    onClick={(e) => setTheme((e.target as HTMLInputElement).value)}
                                />
                                <Label htmlFor="r4">Pink</Label>
                                <ColorSquare theme="pink" />
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>

            <div className="py-8">
                <div className="flex items-center gap-4">
                    <Label>stacks.json</Label>
                    <Button variant={'outline'} disabled>
                        <ArrowUpIcon className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant={'outline'} disabled>
                        <ArrowDownIcon className="mr-2 h-4 w-4" />
                        Import
                    </Button>
                    <Button variant={'outline'} onClick={window.store.openFileLocation}>
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        Open
                    </Button>
                </div>
            </div>
        </>
    )
}

export default General
