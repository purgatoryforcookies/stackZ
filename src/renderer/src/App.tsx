import TerminalUI from './components/TerminalUI/TerminalUI'
import Palette from './components/Palette/Palette'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { ExtendedCmd, TerminalInvokes } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'
import Nav from './components/Nav/Nav'
import { Resizable } from 're-resizable'


function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd | null>(null)
  const [selected, setSelected] = useState<number | null>(1)
  const [paletteWidth, setPaletteWidth] = useState<string>()

  useEffect(() => {

    const fetchTerminals = async () => {
      const data = await window.api.getCommands().then((data) => data)
      const newTerminals: ExtendedCmd = new Map()

      data.forEach((cmd) => {
        const engine = new TerminalUIEngine(cmd.id, SOCKET_HOST)
        engine.startListening()
        newTerminals.set(cmd.id, {
          ...cmd,
          engine: engine
        })
      })
      setTerminals(newTerminals)
    }
    fetchTerminals()

    const fetchPaletteWidth = async () => {
      const width = await window.store.get('paletteWidth')
      if (!width) setPaletteWidth('300px')
      else setPaletteWidth(width)

    }
    fetchPaletteWidth()


  }, [])

  const handleSelection = (id: number, method = TerminalInvokes.CONN) => {

    switch (method) {

      case TerminalInvokes.CONN:
        setSelected(id)
        break
      case TerminalInvokes.START:
        window.api.startTerminal(id)
        break
      default:
        break
    }
  }

  return (
    <div className='app'>
      <Nav />

      {paletteWidth ? <div className="content">

        <Resizable
          defaultSize={{
            width: paletteWidth,
            height: '100%',
          }}
          className='sidebar'
          enable={{ right: true }}
          minWidth={300}
          maxWidth={900}
          onResize={() => {
            if (!terminals || !selected) return
            terminals?.get(selected)?.engine.resize()
          }}
          onResizeStop={(__, _, ref) => window.store
            .set('paletteWidth', ref.style.width)}>
          {terminals ?
            <Palette data={terminals} onClick={handleSelection} selected={selected} />
            : "Loading..."}
        </Resizable>


        <div className="container">
          {selected ? <DetailHeader selected={selected} engines={terminals} /> : "Loading..."}

          {terminals ? <TerminalUI toAttach={selected} engines={terminals} /> : "Loading..."}
        </div>

      </div>
        : "Loading..."}
    </div>
  )
}

export default App
