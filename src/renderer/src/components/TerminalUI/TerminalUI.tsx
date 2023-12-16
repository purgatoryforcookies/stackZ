import { useEffect, useRef, useState } from 'react'
import styles from './terminalui.module.css'
import { TerminalEngine } from '@renderer/service/TerminalEngine'

function TerminalUI() {

  const terminalRef = useRef(null)
  const [ terminal ] = useState<TerminalEngine>(new TerminalEngine())


  useEffect(() => {
    if (terminalRef.current) {
      terminal.attachTo(terminalRef.current)
      terminal.startListening()
    }

    return () => {
      terminal.detach()
    }

  }, [])

  return (
    <div className={styles.main} >
      <div className='terminal' ref={terminalRef}></div>
    </div>
  )
}

export default TerminalUI