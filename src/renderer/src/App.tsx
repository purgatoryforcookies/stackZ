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
import DockerStrip from './components/Common/DockerStrip'
import useDocker from './hooks/useDocker'
import { Cross2Icon, SquareIcon } from '@radix-ui/react-icons'
import { GoHorizontalRule } from 'react-icons/go'

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

    const docker = useDocker()

    useEffect(() => {
        const fetchTheme = async () => {
            const savedTheme = (await window.store.get('theme')) as string
            if (savedTheme) setTheme(savedTheme)
        }
        fetchTheme()
    }, [])

    if (stack.loading) return <p className="text-secondary-foreground">Loading...</p>

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className='h-full w-full bg-gradient overflow-hidden ' data-theme={theme}>

                <div className='flex justify-end pr-4 py-1 items-center gap-5 bg-card'>
                    <GoHorizontalRule onClick={() => window.tools.minimize()} className="size-4 text-primary hover:cursor-pointer hover:scale-105" />
                    <SquareIcon className="size-4 text-primary hover:cursor-pointer hover:scale-105" />
                    <Cross2Icon onClick={() => window.tools.close()} className="size-5 text-primary hover:cursor-pointer hover:scale-105" />
                </div>

                <div className="flex h-full w-full overflow-hidden " >

                    <div className="flex flex-col overflow-hidden size-full relative">
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
                            className="border-t-2 "
                            minHeight={27}
                            onResize={sizeHeader}
                            handleStyles={{
                                right: { display: 'none' },
                                left: { display: 'none' },
                                bottom: { display: 'none' },
                                bottomRight: { display: 'none' },
                                bottomLeft: { display: 'none' },
                                topLeft: { display: 'none' },
                                topRight: { display: 'none' }
                            }}
                        >
                            <DockerStrip docker={docker} />
                            <Tabs
                                defaultValue="environment"
                                data-theme={theme}
                                className="text-primary-foreground h-full px-4 py-8"
                            >
                                <TabsList>
                                    <TabsTrigger value="environment">Environment</TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="environment"
                                    className="pl-6 pt-3 h-[calc(100%-20px)] overflow-x-auto overflow-y-hidden"
                                >
                                    <DetailHeader stack={stack} />
                                </TabsContent>
                            </Tabs>
                        </Resizable>
                    </div>
                    <Resizable
                        size={{ width: w, height: '100%' }}
                        minWidth={'200px'}
                        maxWidth={'100%'}
                        className="border-l-2"
                        onResize={sizePalette}
                        handleStyles={{
                            right: { display: 'none' },
                            top: { display: 'none' },
                            bottom: { display: 'none' },
                            bottomRight: { display: 'none' },
                            bottomLeft: { display: 'none' },
                            topRight: { display: 'none' },
                            topLeft: { display: 'none' }
                        }}
                    >

                        <CommandMenu stack={stack} toggle={toggle} docker={docker} />
                        <Settings stack={stack} />

                        {w ? (
                            <div className="text-secondary-foreground h-[calc(100%-70px)]">
                                <div
                                    className={`p-1 ${w < 450
                                        ? 'flex flex-col-reverse justify-center items-center gap-2'
                                        : 'sm:grid sm:grid-cols-3 sm:grid-rows-1 flex flex-col-reverse justify-center items-center gap-2'
                                        }`}
                                >

                                    <BranchDropdown stack={stack} />
                                    <span className="font-semibold text-lg text-center">Terminals</span>
                                </div>
                                {stack.stack && !stack.loading ? <Palette data={stack} /> : null}
                            </div>
                        ) : null}
                    </Resizable>
                </div>
            </div>
        </ThemeContext.Provider>
    )
}

export default App
