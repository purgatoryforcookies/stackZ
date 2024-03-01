import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Panels, StoreType } from '@t'
import { SOCKET_HOST } from './service/socket'
import Placeholder from './components/Common/Placeholder'
import Settings from './components/Common/Settings'
import { CommandMenu } from './components/Common/CommandMenu'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './@/ui/resizable'
import { useStack } from './hooks/useStack'
import { createContext } from 'react'
import { Toaster } from './@/ui/sonner'
import { debounce } from './service/util'

export const ThemeContext = createContext('aurora')

function App(): JSX.Element {
    const [paletteWidths, setPaletteWidths] = useState<StoreType['paletteWidths'] | undefined>()
    const [theme, setTheme] = useState<string | undefined>()
    const [headerVisible, setHeaderVisible] = useState<boolean>(true)
    const [paletteVisible, setPaletteVisible] = useState<boolean>(true)

    const stack = useStack(SOCKET_HOST)

    const togglePalette = () => {
        setPaletteVisible((prev) => !prev)
    }
    const toggleHeader = () => {
        setHeaderVisible((prev) => !prev)
    }

    useEffect(() => {
        const fetchPaletteWidth = async () => {
            const width = await window.store.get('paletteWidths')
            setPaletteWidths(width as StoreType['paletteWidths'])
        }
        fetchPaletteWidth()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleResize = debounce(async (e: number[], source: Panels) => {
        if (!paletteWidths) return
        stack.terminals?.get(stack.selectedStack)?.get(stack.selectedTerminal)?.resize()
        const newWidths = { ...paletteWidths }
        if (source === Panels.Terminals) newWidths.palette1 = e[1]
        else newWidths.palette2 = e[1]
        await window.store.set('paletteWidths', newWidths)
    }, 40)

    return (
        <ThemeContext.Provider value={theme!}>
            <ResizablePanelGroup
                direction="vertical"
                className="h-full bg-background text-primary-foreground"
                data-theme={theme}
                onLayout={(e) => handleResize(e, Panels.Details)}
            >
                <CommandMenu
                    stack={stack}
                    togglePalette={togglePalette}
                    toggleHeader={toggleHeader}
                />
                <Settings setTheme={setTheme} />
                <ResizablePanel>
                    <ResizablePanelGroup
                        direction="horizontal"
                        onLayout={(e) => handleResize(e, Panels.Terminals)}
                    >
                        <ResizablePanel className="relative">
                            {stack.terminals && !stack.loading ? (
                                <TerminalUI
                                    engine={stack.terminals
                                        .get(stack.selectedStack)
                                        ?.get(stack.selectedTerminal)}
                                />
                            ) : null}
                        </ResizablePanel>
                        <ResizableHandle />
                        {paletteWidths ? (
                            <ResizablePanel
                                defaultSize={paletteWidths.palette1}
                                hidden={!paletteVisible}
                                maxSize={99}
                                minSize={5}
                                id="palette1"
                                className="text-secondary-foreground"
                            >
                                <div className="h-10 flex justify-center items-center">
                                    <span className="font-semibold text-lg">Terminals</span>
                                </div>
                                <div className="overflow-hidden h-full" id="paletteBackground">
                                    {stack.stack ? <Palette data={stack} /> : null}
                                </div>
                            </ResizablePanel>
                        ) : null}
                    </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                {paletteWidths ? (
                    <ResizablePanel
                        defaultSize={paletteWidths.palette2}
                        hidden={!headerVisible}
                        maxSize={99}
                        minSize={5}
                    >
                        {stack ? (
                            <DetailHeader stack={stack} />
                        ) : (
                            <Placeholder message="Select from palette to get started" />
                        )}
                    </ResizablePanel>
                ) : null}
            </ResizablePanelGroup>
            <Toaster data-theme={theme} />
        </ThemeContext.Provider>
    )
}

export default App
