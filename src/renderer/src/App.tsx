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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './@/ui/tabs'
import Ports from './components/GlobalMonitor/Ports'

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
                                minSize={0}
                                ref={headerRef}
                                collapsible
                                className="mt-2"
                            >
                                <Tabs
                                    defaultValue="environment"
                                    data-theme={theme}
                                    className="h-full p-4"
                                >
                                    <TabsList>
                                        <TabsTrigger value="environment">Environment</TabsTrigger>
                                        <TabsTrigger value="monitor">Monitor</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="environment" className="pl-4 h-full pb-5">
                                        <p className="text-muted-foreground text-sm">
                                            Terminal specific environment variables
                                        </p>
                                        <DetailHeader stack={stack} />
                                    </TabsContent>
                                    <TabsContent value="monitor" className="pl-4">
                                        <Ports />
                                    </TabsContent>
                                </Tabs>
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
                        className="text-secondary-foreground ml-2"
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
