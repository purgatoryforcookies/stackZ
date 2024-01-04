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


function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd>(new Map<number, EnginedCmd>())
  const [selected, setSelected] = useState<number | null>(null)
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


  const modifyTerminals = async (cmd: Cmd, remove = false) => {
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
    <div className='app'>
      <Nav />

      {paletteWidth ? <div className="main">

        <Resizable
          defaultSize={{
            width: paletteWidth,
            height: '100%'
          }}
          className='sidebar'
          enable={{ right: editMode ? false : true }}
          minWidth={editMode ? 600 : 190}
          maxWidth={900}
          onResize={() => {
            if (!terminals || !selected || editMode) return
            terminals?.get(selected)?.engine.resize()
          }}
          onResizeStop={(__, _, ref) => {
            if (editMode) return
            window.store.set('paletteWidth', ref.style.width)
          }}>
          {terminals ?
            <Palette data={terminals} onClick={handleSelection} selected={selected} onModify={modifyTerminals} />
            : "Loading..."}
        </Resizable>


        <div className="container">
          {selected ? <DetailHeader engine={terminals.get(selected)!} /> : <Placeholder message='Select from palette to get started' />}

          {terminals ? <TerminalUI toAttach={selected} engines={terminals} /> : null}
        </div>

      </div>
        : "Loading..."}
    </div>
  )
}

export default App
