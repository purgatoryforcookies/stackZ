import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Cmd, EnginedCmd, ExtendedCmd, Panels, SelectionEvents, StoreType } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'

import Placeholder from './components/Common/Placeholder'
import Settings from './components/Common/Settings'
import { CommandMenu } from './components/Common/CommandMenu'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './@/ui/resizable'




function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd>(new Map<number, EnginedCmd>())
  const [selected, setSelected] = useState<number | null>(null)
  const [paletteWidths, setPaletteWidths] = useState<StoreType['paletteWidths'] | undefined>()
  const [editMode, setEditMode] = useState<boolean>(false)
  const [theme, setTheme] = useState<string | undefined>()
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
    const fetchPaletteWidth = async () => {
      const width = await window.store.get('paletteWidths')
      setPaletteWidths(JSON.parse(width))
    }

    fetchPaletteWidth()
    fetchTerminals()
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
    };

  }, [headerVisible, paletteVisible]);

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

  const handleResize = async (e: number[], source: Panels) => {

    if (selected) terminals?.get(selected)?.engine.resize()
    if (!paletteWidths) return
    const newWidths = { ...paletteWidths }
    if (source === Panels.Terminals) newWidths.palette1 = e[1]
    else newWidths.palette2 = e[1]
    await window.store.set('paletteWidths', JSON.stringify(newWidths))
  }


  return (
    <ResizablePanelGroup
      direction="vertical"
      className="h-full bg-background text-primary-foreground"
      data-theme={theme}
      onLayout={(e) => handleResize(e, Panels.Details)}>
      <CommandMenu terminals={terminals} dispatch={handleSelection} theme={theme} />
      <Settings setTheme={setTheme} theme={theme} />
      <ResizablePanel >
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(e) => handleResize(e, Panels.Terminals)}>
          <ResizablePanel >
            {terminals ? <TerminalUI toAttach={selected} engines={terminals} /> : null}
          </ResizablePanel>
          <ResizableHandle />
          {paletteWidths ? <ResizablePanel
            defaultSize={paletteWidths.palette1}
            hidden={!paletteVisible}
            maxSize={99}
            minSize={5}
            id='palette1'
            className='text-secondary-foreground'>
            <div className='h-10 flex justify-center items-center'>
              <span className='font-semibold text-lg'>
                Terminals
              </span>
            </div>

            <div className="h-full overflow-auto pb-60">
              {terminals ?
                <Palette data={terminals} onClick={handleSelection} selected={selected} onModify={modifyTerminals} />
                : "Loading..."}
            </div>
          </ResizablePanel> : null}
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      {paletteWidths ? <ResizablePanel
        defaultSize={paletteWidths.palette2}
        hidden={!headerVisible}
        maxSize={99}
        minSize={5}>
        {selected ? <DetailHeader engine={terminals.get(selected)!} /> : <Placeholder message='Select from palette to get started' />}
      </ResizablePanel>
        : null}
    </ResizablePanelGroup>
  )
}

export default App
