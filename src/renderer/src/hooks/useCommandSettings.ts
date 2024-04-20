import { TerminalUIEngine } from "@renderer/service/TerminalUIEngine"
import { Status, UtilityEvents } from "@t"
import { useEffect, useState } from "react"


const useCommandSettings = (engine: TerminalUIEngine) => {

    const [settings, setSettings] = useState<Status>()
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const uxDelayedLoading = () => setTimeout(() => {
        setIsLoading(false)
    }, 350);

    const finishUp = (data: Status) => {
        setSettings(data)
        uxDelayedLoading()
        setIsPending(false)
    }

    const onMetaChange = (e: { target: { name: string, value?: string | boolean | number } }) => {
        setIsLoading(true)
        const { name, value } = e.target

        if (!value) {
            engine.socket.emit(UtilityEvents.CMDMETASETTINGS,
                name, undefined, (data: Status) => {
                    if (!data) return
                    finishUp(data)
                }
            )
        } else {
            engine.socket.emit(UtilityEvents.CMDMETASETTINGS,
                name, value, (data: Status) => {
                    if (!data) return
                    finishUp(data)
                }
            )
        }

    }

    const onChange = (name: 'cwd' | 'cmd' | 'shell' | 'title', value: string) => {
        setIsLoading(true)
        switch (name) {
            case 'cwd':
                engine.socket.emit(UtilityEvents.CWD, value, (data: Status) => {
                    finishUp(data)
                })
                break
            case 'cmd':
                engine.socket.emit(UtilityEvents.CMD, value, (data: Status) => {
                    finishUp(data)
                })
                break
            case 'shell':
                engine.socket.emit(UtilityEvents.SHELL, value, (data: Status) => {
                    finishUp(data)
                })
                break
            case 'title':
                engine.socket.emit(UtilityEvents.TITLE, value, (data: Status) => {
                    finishUp(data)
                })
                break
        }
    }


    useEffect(() => {
        setIsLoading(true)
        engine.socket.emit('retrieve_settings', (data: Status) => {
            if (!data) return
            finishUp(data)
        })

    }, [engine])


    return { settings, onMetaChange, onChange, isLoading, isPending, setIsPending }


}


export default useCommandSettings


