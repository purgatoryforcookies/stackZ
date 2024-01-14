import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { Cmd, EnginedCmd, ExtendedCmd, SelectionEvents } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'
import Nav from './components/Nav/Nav'
import { Resizable } from 're-resizable'
import Placeholder from './components/Common/Placeholder'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './@/ui/resizable'




function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd>(new Map<number, EnginedCmd>())
  const [selected, setSelected] = useState<number | null>(1)
  const [paletteWidth, setPaletteWidth] = useState<string>()
  const [editMode, setEditMode] = useState<boolean>(false)




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
    }

    fetchTerminals()

    const fetchPaletteWidth = async () => {
      const width = await window.store.get('paletteWidth')
      if (!width) setPaletteWidth('300px')
      else setPaletteWidth(width)

    }
    fetchPaletteWidth()

  }, [])

  useEffect(() => {

    const handleResize = () => {
      if (selected) {
        terminals?.get(selected)?.engine.resize()
      }
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [selected]);


  const handleSelection = (id: number, method = SelectionEvents.CONN) => {

    switch (method) {

      case SelectionEvents.CONN:
        if (selected === id) {
          setSelected(null)
          return
        }
        setSelected(id)
        break
      case SelectionEvents.START:
        window.api.startTerminal(id)
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
    <div className='bg-violet-900'>



      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] max-w-md rounded-lg border bg-violet-900"
      >
        <ResizablePanel defaultSize={25}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Sidebar</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

    </div>
  )
}

export default App
