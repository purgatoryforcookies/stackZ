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

  useEffect(() => {
    if (!toAttach) return

    const handleResize = () => {
      if (terminalRef.current) {
        const eng = engines.get(toAttach)?.engine
        if (!eng) return

        eng.resize()
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [toAttach]);

  return (
    <div className={styles.terminal} ref={terminalRef}></div>


  )
}

export default TerminalUI