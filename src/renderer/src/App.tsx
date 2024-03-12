import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useRef, useState } from 'react'
import { SOCKET_HOST } from './service/socket'
import Settings from './components/settings/Settings'
import { CommandMenu } from './components/Common/CommandMenu'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './@/ui/resizable'
import { useStack } from './hooks/useStack'
import { createContext } from 'react'
import { useResizable } from './hooks/useResizable'
import { ImperativePanelHandle } from 'react-resizable-panels'
import BranchDropdown from './components/Common/BranchDropdown'


export const ThemeContext = createContext('aurora')

function App(): JSX.Element {
    const [theme, setTheme] = useState<string>()
    const paletteRef = useRef<ImperativePanelHandle>(null)
    const headerRef = useRef<ImperativePanelHandle>(null)

    const stack = useStack(SOCKET_HOST)
    const { storedWidth, sizeHeader, sizePalette, toggle, minW, w } = useResizable(
        paletteRef,
        headerRef
    )
    return (
        <ThemeContext.Provider value={theme!}>
            {storedWidth ? (
                <ResizablePanelGroup
                    direction="horizontal"
                    className="bg-gradient text-primary-foreground"
                    data-theme={theme}
                >
                    <CommandMenu stack={stack} toggle={toggle} />
                    <Settings setTheme={setTheme} stack={stack} />
                    <ResizablePanel>
                        <ResizablePanelGroup direction="vertical">
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
                            <ResizablePanel
                                defaultSize={storedWidth?.header}
                                onResize={sizeHeader}
                                ref={headerRef}
                                collapsible
                            >
                                <DetailHeader stack={stack} />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel
                        defaultSize={storedWidth?.palette}
                        onResize={sizePalette}
                        ref={paletteRef}
                        collapsible
                        minSize={minW}
                        maxSize={95}
                        id="palette"
                        className="text-secondary-foreground"
                    >
                        <div
                            className={`p-1 ${w < 450
                                    ? 'flex flex-col-reverse justify-center items-center gap-2'
                                    : 'grid grid-cols-3 grid-rows-1'
                                }`}
                        >
                            <BranchDropdown stack={stack} />
                            <span className="font-semibold text-lg text-center">Terminals</span>
                        </div>
                        {stack.stack && !stack.loading ? <Palette data={stack} /> : null}
                    </ResizablePanel>
                </ResizablePanelGroup>
            ) : null}
        </ThemeContext.Provider>
    )
}

export default App
