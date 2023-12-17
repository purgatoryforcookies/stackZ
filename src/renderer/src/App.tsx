import TerminalUI from './components/TerminalUI/TerminalUI'
import Sidebar from './components/Sidebar/Sidebar'
import DetailHeader from './components/DetailHeader/DetailHeader'
import { useEffect, useState } from 'react'
import { ExtendedCmd, TerminalInvokes } from '../../types'
import { TerminalUIEngine } from './service/TerminalUIEngine'
import { SOCKET_HOST } from './service/socket'



function App(): JSX.Element {

  const [terminals, setTerminals] = useState<ExtendedCmd | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

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
    <div className="container">
      {terminals ?
        <Sidebar data={terminals} onClick={handleSelection} />
        : "Loading..."}

      <DetailHeader />
      {terminals ? <TerminalUI toAttach={selected} engines={terminals} /> : "Loading..."}


    </div>
  )
}

export default App
