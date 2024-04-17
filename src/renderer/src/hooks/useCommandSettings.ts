import { TerminalUIEngine } from "@renderer/service/TerminalUIEngine"
import { Status, UtilityEvents } from "@t"
import { useEffect, useState } from "react"


const useCommandSettings = (engine: TerminalUIEngine) => {

    const [settings, setSettings] = useState<Status>()
    const [isLoading, setIsLoading] = useState(false)



    const onMetaChange = (e: { target: { name: string, value: string | boolean | number } }) => {
        setIsLoading(true)
        const { name, value } = e.target

        engine.socket.emit(UtilityEvents.CMDMETASETTINGS,
            name, value, (data: Status) => {
                setSettings(data)

                setIsLoading(false)
            }
        )

    }

    const onChange = (name: 'cwd' | 'cmd' | 'shell' | 'title', value: string) => {
        setIsLoading(true)
        switch (name) {
            case 'cwd':
                engine.socket.emit(UtilityEvents.CWD, value, (data: Status) => {
                    setSettings(data)
                    setIsLoading(false)
                })
                break
            case 'cmd':
                engine.socket.emit(UtilityEvents.CMD, value, (data: Status) => {
                    setSettings(data)
                    setIsLoading(false)
                })
                break
            case 'shell':
                engine.socket.emit(UtilityEvents.SHELL, value, (data: Status) => {
                    setSettings(data)
                    setIsLoading(false)
                })
                break
            case 'title':
                engine.socket.emit(UtilityEvents.TITLE, value, (data: Status) => {
                    setSettings(data)
                    setIsLoading(false)
                })
                break
        }

    }


    useEffect(() => {

        engine.socket.emit('retrieve_settings', (data: Status) => {
            setSettings(data)
        })

    }, [engine])


    return { settings, onMetaChange, onChange, isLoading }


}


export default useCommandSettings


