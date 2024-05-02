import { TerminalUIEngine } from '../service/TerminalUIEngine'
import { CommandMetaSetting, Status } from '@t'
import { useEffect, useState } from 'react'

type CommandBaseSettings = 'cwd' | 'cmd' | 'shell' | 'title'
type OnChangeType = keyof CommandMetaSetting | CommandBaseSettings

const useCommandSettings = (engine: TerminalUIEngine) => {
    const [settings, setSettings] = useState<Status>()
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [open, setOpen] = useState(false)

    const uxDelayedLoading = () =>
        setTimeout(() => {
            setIsLoading(false)
        }, 350)

    const finishUp = (data: Status) => {
        setSettings(data)
        uxDelayedLoading()
        setIsPending(false)
    }

    const onChange = (name: OnChangeType, value?: string |
        Exclude<CommandMetaSetting['sequencing'], undefined>[0] | [] | boolean | number) => {
        setIsLoading(true)

        switch (name) {
            case 'cwd':
                engine.socket.emit('changeCwd', value as string, (data) => {
                    finishUp(data)
                })
                break
            case 'cmd':
                engine.socket.emit('changeCommand', value as string, (data) => {
                    finishUp(data)
                })
                break
            case 'shell':
                engine.socket.emit('changeShell', value as string, (data) => {
                    finishUp(data)
                })
                break
            case 'title':
                engine.socket.emit('changeTitle', value as string, (data) => {
                    finishUp(data)
                })
                break
            default:
                engine.socket.emit('commandMetaSetting', name, value, (data) => {
                    if (!data) return
                    finishUp(data)
                })

        }
    }


    useEffect(() => {
        setIsLoading(true)
        engine.socket.emit('retrieveSettings', (data) => {
            if (!data) return
            finishUp(data)
        })
    }, [engine, open])

    return { settings, onChange, isLoading, isPending, setIsPending, open, setOpen }
}

export default useCommandSettings
