import { useEffect, useRef } from 'react'
import styles from './terminalui.module.css'
import { ExtendedCmd } from 'src/types'




type TerminalUIProps = {
  engines: ExtendedCmd,
  toAttach: number | null
}


function TerminalUI({ engines, toAttach }: TerminalUIProps) {

  const terminalRef = useRef(null)

  useEffect(() => {

    if (!toAttach) return


    if (terminalRef.current) {
      const eng = engines.get(toAttach)?.engine
      if (!eng) return
      eng.attachTo(terminalRef.current)
    }

  }, [toAttach])

  return (
    <div className={styles.main} >
      <div className='terminal' ref={terminalRef}></div>
    </div>
  )
}

export default TerminalUI