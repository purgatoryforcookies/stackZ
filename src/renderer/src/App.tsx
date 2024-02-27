import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Panels, SelectionEvents, StoreType } from '@t'
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
    const [editMode, setEditMode] = useState<boolean>(false)
    const [theme, setTheme] = useState<string | undefined>()
    const [headerVisible, setHeaderVisible] = useState<boolean>(true)
    const [paletteVisible, setPaletteVisible] = useState<boolean>(true)

    const {
        stack,
        terminals,
        loading,
        selectStack,
        selectTerminal,
        addTerminal,
        addStack,
        reOrder,
        selectedStack,
        selectedTerminal
    } = useStack(SOCKET_HOST)

    useEffect(() => {
        const fetchPaletteWidth = async () => {
            const width = await window.store.get('paletteWidths')
            setPaletteWidths(width as StoreType['paletteWidths'])
        }
        fetchPaletteWidth()
    }, [])

    const handleShortCuts = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'x':
                if (!e.altKey) return
                setHeaderVisible(!headerVisible)
                break
            case 'z':
                if (!e.altKey) return
                setPaletteVisible(!paletteVisible)
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
    }, [headerVisible, paletteVisible])

    //TODO: add more options and maybe make a hook or separate file?
    const handleSelection = (
        stackId: string,
        terminalId: string,
        method = SelectionEvents.CONN
    ) => {
        switch (method) {
            case SelectionEvents.CONN:
                selectStack(stackId)
                selectTerminal(terminalId)
                break
            case SelectionEvents.START:
                window.api.startTerminal(stackId, terminalId)
                break
            case SelectionEvents.EXPAND:
                setEditMode(!editMode)
                break
            case SelectionEvents.NEWSTACK:
                setEditMode(!editMode)
                break
            default:
                break
        }
    }

    const handleResize = debounce(async (e: number[], source: Panels) => {
        if (!paletteWidths) return
        terminals?.get(selectedStack)?.get(selectedTerminal)?.resize()
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
                <CommandMenu stack={stack} dispatch={handleSelection} />
                <Settings setTheme={setTheme} />
                <ResizablePanel>
                    <ResizablePanelGroup
                        direction="horizontal"
                        onLayout={(e) => handleResize(e, Panels.Terminals)}
                    >
                        <ResizablePanel>
                            {terminals && stack && !loading ? (
                                <TerminalUI
                                    engine={terminals.get(selectedStack)?.get(selectedTerminal)}
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
                                    {stack ? (
                                        <Palette
                                            data={stack}
                                            engines={terminals?.get(selectedStack)}
                                            onClick={handleSelection}
                                            stackId={selectedStack}
                                            terminalId={selectedTerminal}
                                            onNewTerminal={addTerminal}
                                            onNewStack={addStack}
                                            reOrder={reOrder}
                                        />
                                    ) : (
                                        'Loading...'
                                    )}
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
                            <DetailHeader
                                stackId={selectedStack}
                                terminalId={selectedTerminal}
                                terminal={terminals?.get(selectedStack)?.get(selectedTerminal)}
                            />
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
