import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Cmd, EnginedCmd, ExtendedCmd, PaletteStack, Panels, SelectionEvents, StoreType } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'

import Placeholder from './components/Common/Placeholder'
import Settings from './components/Common/Settings'
import { CommandMenu } from './components/Common/CommandMenu'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './@/ui/resizable'




function App(): JSX.Element {

  const [stack, setStack] = useState<Map<number, PaletteStack>>()
  const [terminals, setTerminals] = useState<Map<number, Map<number, TerminalUIEngine>>>()
  const [selectedStack, setSelectedStack] = useState<number>(1)
  const [selectedTerminal, setSelectedTerminal] = useState<number>(1)
  const [paletteWidths, setPaletteWidths] = useState<StoreType['paletteWidths'] | undefined>()
  const [editMode, setEditMode] = useState<boolean>(false)
  const [theme, setTheme] = useState<string | undefined>()
  const [headerVisible, setHeaderVisible] = useState<boolean>(true)
  const [paletteVisible, setPaletteVisible] = useState<boolean>(true)


  useEffect(() => {

    const fetchTerminals = async () => {
      const data: PaletteStack[] = await window.api.getStack()
      const newStack = new Map<number, PaletteStack>()
      data.forEach((stack) => {
        newStack.set(stack.id, stack)
      })
      setStack(newStack)


      const newTerminals = new Map<number, Map<number, TerminalUIEngine>>()

      data.forEach((stack) => {
        if (!stack.palette) return
        newTerminals.set(stack.id, new Map<number, TerminalUIEngine>())
        stack.palette.forEach((cmd) => {
          if (!cmd) return
          const s = newTerminals.get(stack.id)
          if (!s) return
          const engine = new TerminalUIEngine(stack.id, cmd.id, SOCKET_HOST)
          engine.startListening()
          s.set(cmd.id, engine)
        })
      })
      setTerminals(newTerminals)
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
  const handleSelection = (stackId: number, terminalId: number, method = SelectionEvents.CONN, cb?: (...args: any) => void) => {

    switch (method) {

      case SelectionEvents.CONN:
        setSelectedStack(stackId)
        setSelectedTerminal(terminalId)
        if (cb) cb()
        break
      case SelectionEvents.START:
        window.api.startTerminal(stackId, terminalId)
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
    // if (terminals?.has(cmd.id)) return
    // const engine = new TerminalUIEngine(cmd.id, SOCKET_HOST)
    // engine.startListening()

    // const newTerminals = new Map(terminals)

    // newTerminals.set(cmd.id, {
    //   ...cmd,
    //   engine: engine
    // })
    // setTerminals(newTerminals)
  }

  const handleResize = async (e: number[], source: Panels) => {

    // if (selected) terminals?.get(selected)?.engine.resize()
    // if (!paletteWidths) return
    // const newWidths = { ...paletteWidths }
    // if (source === Panels.Terminals) newWidths.palette1 = e[1]
    // else newWidths.palette2 = e[1]
    // await window.store.set('paletteWidths', JSON.stringify(newWidths))
  }


  return (
    <ResizablePanelGroup
      direction="vertical"
      className="h-full bg-background text-primary-foreground"
      data-theme={theme}
      onLayout={(e) => handleResize(e, Panels.Details)}>
      {/* <CommandMenu terminals={terminals} dispatch={handleSelection} theme={theme} /> */}
      <Settings setTheme={setTheme} theme={theme} />
      <ResizablePanel >
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(e) => handleResize(e, Panels.Terminals)}>
          <ResizablePanel >
            {terminals ? <TerminalUI engine={terminals.get(selectedStack)?.get(selectedTerminal)} /> : null}
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
              {stack ?
                <Palette data={stack} onClick={handleSelection} terminalId={selectedTerminal} onModify={modifyTerminals} />
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
        {stack ? <DetailHeader stackId={selectedStack} terminalId={selectedTerminal} /> : <Placeholder message='Select from palette to get started' />}
      </ResizablePanel>
        : null}
    </ResizablePanelGroup>
  )
}

export default App
