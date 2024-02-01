import { Button } from "@renderer/@/ui/button"
import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import { RadioGroup, RadioGroupItem } from "@renderer/@/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@renderer/@/ui/sheet"
import ColorSquare from "./ColorSquare"
import { useContext, useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import KillSignal from "./KillSignal"
import { ThemeContext } from "@renderer/App"

type SettingsProps = {
    setTheme: (name: string) => void,
}

function Settings({ setTheme }: SettingsProps) {

    const [open, setOpen] = useState<boolean>(false)
    const theme = useContext(ThemeContext);


    const handleShortCuts = (e: KeyboardEvent) => {

        switch (e.key) {
            case 'Home':
                setOpen(!open)
                break
            default:
                break
        }
    }

    useEffect(() => {

        window.addEventListener('keydown', handleShortCuts, true)
        return () => {
            window.removeEventListener('keydown', handleShortCuts, true)
        };

    }, [open]);


    useEffect(() => {
        if (!theme) return
        window.store.set('theme', theme)
    }, [theme])
    useEffect(() => {
        window.store.get('theme').then((t) => {
            setTheme(t)
        })
    })


    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetContent className="w-[30vw] sm:max-w-none " data-theme={theme} >
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                </SheetHeader>
                <div className="py-8">
                    <h1>General</h1>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shell" className="text-right">
                                Default terminal
                            </Label>
                            <Input id="shell" defaultValue="path..." className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cwd" className="text-right">
                                Default CWD
                            </Label>
                            <Input id="cwd" placeholder="path..." className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cwd" className="text-right">
                                Kill signal
                            </Label>
                            <KillSignal />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 py-5">
                            <Label htmlFor="theme" className="text-right">
                                Theme
                            </Label>
                            <RadioGroup defaultValue={theme}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dark" id="r1" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r1">Dark</Label>
                                    <ColorSquare theme="dark" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="aurora" id="r2" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r2">Aurora</Label>
                                    <ColorSquare theme="aurora" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="north" id="r2" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r2">North</Label>
                                    <ColorSquare theme="north" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="morning" id="r3" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r3">Morning</Label>
                                    <ColorSquare theme="morning" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="forrest" id="r4" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r4">Forrest</Label>
                                    <ColorSquare theme="forrest" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pink" id="r4" onClick={(e) => setTheme((e.target as HTMLInputElement).value)} />
                                    <Label htmlFor="r4">Pink</Label>
                                    <ColorSquare theme="pink" />
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                <div className="py-8">
                    <div className="flex items-center gap-4">
                        <h1>Commands.json</h1>
                        <Button variant={'outline'} disabled>
                            <ArrowUpIcon className="mr-2 h-4 w-4" />
                            Export</Button>
                        <Button variant={'outline'} disabled>
                            <ArrowDownIcon className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit" disabled>Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default Settings