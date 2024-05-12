import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { SOCKET_HOST } from './service/socket'
import Settings from './components/settings/Settings'
import { CommandMenu } from './components/Common/CommandMenu'
import { useStack } from './hooks/useStack'
import { createContext } from 'react'
import { useResizable } from './hooks/useResizable'
import BranchDropdown from './components/Common/BranchDropdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './@/ui/tabs'
import { Resizable } from 're-resizable'

type ThemeContextType = {
    theme?: string
    setTheme: (name: string) => void

}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'aurora',
    setTheme: () => { }

})

function App(): JSX.Element {
    const stack = useStack(SOCKET_HOST)
    const { sizeHeader, sizePalette, toggle, w, h } = useResizable()

    const [theme, setTheme] = useState<string>()


    useEffect(() => {
        const fetchTheme = async () => {
            const savedTheme = await window.store.get('theme') as string
            if (savedTheme) setTheme(savedTheme)
        }
        fetchTheme()

    }, [])

    if (stack.loading) return <p className='text-secondary-foreground'>Loading...</p>


    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>

            <div className='flex h-full w-full overflow-hidden bg-gradient' data-theme={theme}>
                <div className='flex flex-col overflow-hidden size-full relative'>
                    {stack.terminals && !stack.loading ? (
                        <TerminalUI
                            engine={stack.terminals
                                .get(stack.selectedStack)
                                ?.get(stack.selectedTerminal)}
                        />
                    ) : null}

                    <Resizable
                        size={{ width: '100%', height: h }}
                        maxHeight={'100%'}
                        className='border-t-2 '
                        minHeight={25}
                        onResize={sizeHeader}
                        handleStyles={
                            {
                                right: { display: 'none' },
                                left: { display: 'none' },
                                bottom: { display: 'none' }
                            }
                        }>

                        <Tabs
                            defaultValue="environment"
                            data-theme={theme}
                            className="text-primary-foreground h-full px-4 py-8"
                        >
                            <TabsList>
                                <TabsTrigger value="environment">Environment</TabsTrigger>
                                <TabsTrigger value="monitor">Monitor</TabsTrigger>
                            </TabsList>
                            <TabsContent value="environment" className="pl-4 pt-5 h-[calc(100%-20px)] overflow-x-auto overflow-y-hidden" >
                                <DetailHeader stack={stack} />
                            </TabsContent>
                            <TabsContent value="monitor" className="pl-4">
                                {/* <Ports /> */}
                                <p className='text-secondary-foreground'>Not available</p>
                            </TabsContent>
                        </Tabs>

                    </Resizable>
                </div>
                <Resizable
                    size={{ width: w, height: '100%' }}
                    minWidth={'200px'}
                    maxWidth={'100%'}
                    className='border-l-2'
                    onResize={sizePalette}
                    handleStyles={
                        {
                            right: { display: 'none' },
                            top: { display: 'none' },
                            bottom: { display: 'none' }
                        }
                    }
                >
                    <CommandMenu stack={stack} toggle={toggle} />
                    <Settings stack={stack} />

                    {w ?
                        <div className="text-secondary-foreground">
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
                        </div>
                        : null}
                </Resizable>
            </div>
        </ThemeContext.Provider >
    )
}

export default App

