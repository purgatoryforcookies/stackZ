import { Input } from "@renderer/@/ui/input"
import { Label } from "@renderer/@/ui/label"
import useCommandSettings from "@renderer/hooks/useCommandSettings"
import React, { useEffect, useRef, useState } from "react"
import { useClickWatcher } from "@renderer/hooks/useClickWatcher"
import useListWalker from "@renderer/hooks/useListWalker"
import { TerminalUIEngine } from "@renderer/service/TerminalUIEngine"


type InputWithMagicProps = {
    engine: TerminalUIEngine
    tools: ReturnType<typeof useCommandSettings>
}


/**
 * Input element with search. Makes a list of search results.
 */
function InputWithMagic({ engine, tools }: InputWithMagicProps) {

    const inpRef = useRef<HTMLInputElement>(null)
    const { settings, onMetaChange, setIsPending } = tools

    const [searchList, setSearchList] = useState<string[]>([])
    const [inputBox, setInputBox] = useState<string>('')


    const handleSubmit = () => {
        if (inputBox !== settings?.cmd.metaSettings?.healthCheck && inputBox) {
            onMetaChange({ target: { name: 'healthCheck', value: inputBox } })
        } else {
            setIsPending(false)
        }

        setSearchList([])
    }
    useClickWatcher(inpRef, handleSubmit)


    const handleListSelect = () => {
        if (searchList[index] === undefined) return
        setInputBox(searchList[index])
        setSearchList([])
        setIsPending(true)
    }
    const { index } = useListWalker(handleListSelect)



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setInputBox(e.target.value)
        if (e.target.value === "") {
            setSearchList([])
            onMetaChange({ target: { name: 'healthCheck', value: "" } })
        }
        setIsPending(true)

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

    useEffect(() => {
        setInputBox(settings?.cmd.metaSettings?.healthCheck || '')
    }, [])

    const handleSelect = (value: string) => {
        setInputBox(value)
        setSearchList([])
        inpRef.current?.focus()
    }

    return (
        <div className="relative" >
            <Label htmlFor="healthcheck" className="text-right p-1">
                Healthcheck
            </Label>
            <Input
                id="healthcheck"
                ref={inpRef}
                className="w-full"
                name="healthCheck"
                value={inputBox}
                placeholder="curl --fail https://google.com || exit 1"
                onChange={handleChange}
            />
            {searchList.length > 0 ? <ul className="absolute bg-primary w-full p-1 rounded-sm" >
                {searchList.map((item, idx) => (
                    <li
                        key={idx}
                        className={`hover:cursor-pointer hover:bg-card pl-1 ${idx === index ? 'bg-primary text-background' : ''}`}
                        onClick={() => handleSelect(item)}
                    >{item}</li>
                ))}
            </ul> : null}
        </div>
    )
}

export default InputWithMagic