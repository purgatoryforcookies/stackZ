import { useEffect } from 'react'
import TerminalUI from './components/TerminalUI/TerminalUI'
import Versions from './components/Versions'


function App(): JSX.Element {



  useEffect(() => {})


  return (
    <div className="container">
      <Versions></Versions>
      <div className='terminalBody'>
        <TerminalUI />
      </div>

    </div>
  )
}

export default App
