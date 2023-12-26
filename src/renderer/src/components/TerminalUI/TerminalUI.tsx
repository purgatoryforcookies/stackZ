import { useEffect, useRef, useState } from 'react'
import styles from './terminalui.module.css'
import { ExtendedCmd } from 'src/types'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'
import { baseSocket } from '@renderer/service/socket'



type TerminalUIProps = {
  engines: ExtendedCmd,
  toAttach: number | null
}


function TerminalUI({ engines, toAttach }: TerminalUIProps) {

  const terminalRef = useRef(null)
  const [term, setTerm] = useState<TerminalUIEngine | null>(null)

  useEffect(() => {

    if (!toAttach) {
      term?.detach()
      return
    }

    if (terminalRef.current) {
      const eng = engines.get(toAttach)?.engine
      if (!eng) return
      setTerm(eng)
      eng.attachTo(terminalRef.current)
    }


  }, [toAttach])


  return (
    <div className={styles.terminal} ref={terminalRef}></div>


  )
}

export default TerminalUI