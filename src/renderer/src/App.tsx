import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Cmd, EnginedCmd, ExtendedCmd, SelectionEvents } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './@/ui/resizable'
import Placeholder from './components/Common/Placeholder'
import Settings from './components/Common/Settings'
import { CommandMenu } from './components/Common/CommandMenu'




function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd>(new Map<number, EnginedCmd>())
  const [selected, setSelected] = useState<number | null>(null)
  const [paletteWidth, setPaletteWidth] = useState<string>()
  const [editMode, setEditMode] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>('forrest')
  const [headerVisible, setHeaderVisible] = useState<boolean>(true)
  const [paletteVisible, setPaletteVisible] = useState<boolean>(true)

  useEffect(() => {

    const fetchTerminals = async () => {
      const data = await window.api.getCommands()

      data.forEach((cmd) => {
        const engine = new TerminalUIEngine(cmd.id, SOCKET_HOST)
        engine.startListening()

        terminals.set(cmd.id, {
          ...cmd,
          engine: engine
        })
      })
      setTerminals(terminals)
      setSelected(1)
    }

    fetchTerminals()

    const fetchPaletteWidth = async () => {
      const width = await window.store.get('paletteWidth')
      if (!width) setPaletteWidth('300px')
      else setPaletteWidth(width)

    }
    fetchPaletteWidth()

  }, [])


  const handleResize = () => {
    if (selected) {
      terminals?.get(selected)?.engine.resize()
    }
  }
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

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleShortCuts, true)
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleShortCuts, true)
    };

  }, [selected, headerVisible, paletteVisible]);

  //TODO: add more options and maybe make a hook or separate file?
  const handleSelection = (id: number, method = SelectionEvents.CONN, cb?: (...args: any) => void) => {

    switch (method) {

      case SelectionEvents.CONN:
        if (cb) cb()
        setSelected(id)
        break
      case SelectionEvents.START:
        window.api.startTerminal(id)
        if (cb) cb()
        break
      case SelectionEvents.EXPAND:
        setEditMode(!editMode)
        break
      default:
        break
    }
  }


  const modifyTerminals = async (cmd: Cmd) => {
    if (terminals?.has(cmd.id)) return
    const engine = new TerminalUIEngine(cmd.id, SOCKET_HOST)
    engine.startListening()

    const newTerminals = new Map(terminals)

    newTerminals.set(cmd.id, {
      ...cmd,
      engine: engine
    })
    setTerminals(newTerminals)
  }

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="h-full bg-background text-primary-foreground"
      data-theme={theme}
      onLayout={handleResize}
    >
      <CommandMenu terminals={terminals} dispatch={handleSelection} />
      <ResizablePanel >
        <ResizablePanelGroup direction="horizontal" onLayout={handleResize} >
          <ResizablePanel >
            <div className="w-full h-full">
              {terminals ? <TerminalUI toAttach={selected} engines={terminals} /> : null}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={20} maxSize={50} minSize={1} hidden={!paletteVisible} className='text-secondary-foreground'>
            <div className='h-10 flex justify-center items-center'>
              <span className='font-semibold text-lg'>Terminals</span>
              <div className='absolute right-5'>
                <Settings setTheme={setTheme} theme={theme} />
              </div>
            </div>

            <div className="h-full overflow-auto pb-60 ">
              {terminals ?
                <Palette data={terminals} onClick={handleSelection} selected={selected} onModify={modifyTerminals} />
                : "Loading..."}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup >
      </ResizablePanel>
      <ResizableHandle dir='ltr' />
      <ResizablePanel defaultSize={20} minSize={5} maxSize={45} hidden={!headerVisible}>
        <div className="h-full pl-6">
          {selected ? <DetailHeader engine={terminals.get(selected)!} /> : <Placeholder message='Select from palette to get started' />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>

  )
}

export default App
