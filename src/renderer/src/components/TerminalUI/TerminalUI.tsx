import { useEffect, useRef, useState } from 'react'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'


type TerminalUIProps = {
  engine: TerminalUIEngine | undefined,
}


function TerminalUI({ engine }: TerminalUIProps) {

  const terminalRef = useRef(null)
  const [term, setTerm] = useState<TerminalUIEngine | null>(null)

  useEffect(() => {

    if (!engine) {
      term?.detach()
      return
    }

    if (terminalRef.current) {
      if (!engine) return
      setTerm(engine)
      engine.attachTo(terminalRef.current)?.ping()
    }


  }, [engine])


  return (
    <div ref={terminalRef} className='h-full' />
  )
}

export default TerminalUI