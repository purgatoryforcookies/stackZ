import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import useCommandSettings from "@renderer/hooks/useCommandSettings"
import React, { useEffect, useRef, useState } from "react"
import { CommandSettingsProps } from "./CommandSettings2"
import { useClickWatcher } from "@renderer/hooks/useClickWatcher"


function InputWithMagic({ engine }: CommandSettingsProps) {

    const inpRef = useRef<HTMLInputElement>(null)

    const [searchList, setSearchList] = useState<string[]>([])

    const { settings, onMetaChange } = useCommandSettings(engine)
    const [inputBox, setInputBox] = useState<string | undefined>()

    const handleSubmit = () => {

        if (inputBox !== settings?.cmd.metaSettings?.healthCheck) {
            onMetaChange({ target: { name: 'healthCheck', value: inputBox } })
        }
        setSearchList([])
    }

    useClickWatcher(inpRef, handleSubmit)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setInputBox(e.target.value)

        if (e.target.value === "") {
            setSearchList([])
        }

        engine.socket.emit('history', 'HEALTH',
            { feed: e.target.value },
            (data: string[]) => {
                if (!data || data.length === 0) {
                    setSearchList([])
                    return
                }
                setSearchList(data)

            })
    }

    useEffect(() => {
        setSearchList([])
    }, [settings])

    const handleSelect = (value: string) => {
        setInputBox(value)
        onMetaChange({ target: { name: 'healthCheck', value: value } })
        inpRef.current?.focus()

    }

    return (
        <div className="relative" ref={inpRef}>
            <Label htmlFor="healthcheck" className="text-right p-1">
                Healthcheck
            </Label>
            <Input
                id="healthcheck"
                className="w-full"
                name="healthCheck"
                value={inputBox || settings?.cmd.metaSettings?.healthCheck || ""}
                placeholder="curl --fail https://google.com || exit 1"
                onChange={handleChange}
            />
            {searchList.length > 0 ? <ul className="absolute bg-primary w-full p-1 rounded-sm" >
                {searchList.map((item, index) => (
                    <li
                        key={index}
                        className="hover:cursor-pointer hover:bg-card pl-1"
                        onClick={() => handleSelect(item)}
                    >{item}</li>
                ))}
            </ul> : null}
        </div>
    )
}

export default InputWithMagic