import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
    SheetTrigger
} from '@renderer/@/ui/sheet'
import { useContext, useEffect, useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ThemeContext } from '@renderer/App'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/@/ui/tabs'
import General from './General'
import Stack from './Stack'
import { IUseStack } from '@renderer/hooks/useStack'

export type SettingsProps = {
    setTheme: (name: string) => void
    stack: IUseStack
}

function Settings({ setTheme, stack }: SettingsProps) {
    const [open, setOpen] = useState<boolean>(false)

    const theme = useContext(ThemeContext)

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
        }
    }, [open])

    useEffect(() => {
        if (!theme) return
        window.store.set('theme', theme)
    }, [theme])

    useEffect(() => {
        const fetchStore = async () => {
            await window.store.get('theme').then((t) => {
                setTheme(t as string)
            })
        }
        fetchStore()
    }, [open])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <DotsHorizontalIcon className="w-5 h-5 absolute right-3 top-2 text-primary/90 hover:scale-110 hover:text-primary hover:cursor-pointer" />
            </SheetTrigger>
            <SheetContent
                className="w-[32vw] min-w-[36rem] sm:max-w-none overflow-auto"
                data-theme={theme}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                    <SheetDescription></SheetDescription>
                    <Tabs defaultValue="stack" data-theme={theme}>
                        <TabsList>
                            <TabsTrigger value="stack">Stack</TabsTrigger>
                            <TabsTrigger value="general">General</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stack">
                            Change settings for the selected stack.
                            <p className="text-muted-foreground text-sm">
                                These will override the general defaults for this stack
                            </p>
                            <Stack stack={stack} close={() => setOpen(false)} />
                        </TabsContent>
                        <TabsContent value="general">
                            General settings
                            <General setTheme={setTheme} />
                        </TabsContent>
                    </Tabs>
                </SheetHeader>
                <SheetFooter>
                    <SheetClose asChild></SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default Settings
