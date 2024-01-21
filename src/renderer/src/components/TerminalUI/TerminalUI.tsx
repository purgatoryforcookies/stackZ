import { useEffect, useRef, useState } from 'react'
import { ExtendedCmd } from 'src/types'
import { TerminalUIEngine } from '@renderer/service/TerminalUIEngine'



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
    <div ref={terminalRef} className='h-full' />
  )
}

export default TerminalUI