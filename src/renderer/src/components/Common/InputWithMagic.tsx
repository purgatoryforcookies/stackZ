import { Input } from '../../@/ui/input'
import { Label } from '../../@/ui/label'
import useCommandSettings from '../../hooks/useCommandSettings'
import React, { useRef, useState } from 'react'
import { TerminalUIEngine } from '../../service/TerminalUIEngine'
import { ScrollArea } from '../../@/ui/scroll-area'
import useListWalker from '../../hooks/useListWalker'
import { HistoryBook, HistoryKey } from '@t'

type InputWithMagicProps = {
    engine: TerminalUIEngine
    tools: ReturnType<typeof useCommandSettings>
    title?: string
    valueKey: 'healthCheck' | 'cmd' | 'cwd' | 'shell'
    historyKey: keyof typeof HistoryKey
    defaultValue: string
}

const LIST_OFFSET = 2

/**
 * Input element with search. Makes a list of search results based on input.
 * The list can be navigated with arrow, pgup, and pgdown keys.
 * Uses the HistoryService.
 *
 */
function InputWithMagic({
    engine,
    tools,
    title,
    valueKey,
    historyKey,
    defaultValue
}: InputWithMagicProps) {
    const inpRef = useRef<HTMLInputElement>(null)
    const { onChange, setIsPending } = tools

    const [searchList, setSearchList] = useState<string[]>([])
    const [inputBox, setInputBox] = useState<string>(defaultValue)

    const handleSubmit = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.relatedTarget?.nodeName === 'LI') return

        if (inputBox !== defaultValue) {
            onChange(valueKey, inputBox)
        } else {
            setIsPending(false)
        }
        // setSearchList([])
    }

    const handleListSelect = () => {
        setInputBox(searchList[infiniteIndex])
        setSearchList([])
        setIsPending(true)
    }
    const { update, infinityList, infiniteIndex, OFFSET } = useListWalker(
        searchList,
        LIST_OFFSET,
        handleListSelect
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputBox(e.target.value.trimStart())
        if (e.target.value === '') {
            setSearchList([])
        }
        setIsPending(true)

        engine.socket.emit('history', historyKey, e.target.value, (data: HistoryBook) => {
            if (data.host.length === 0 && data.stackz.length === 0) {
                setSearchList([])
                return
            }
            setSearchList(data.host.concat(data.stackz))
        })
    }

    const handleSelect = (value: string) => {
        setInputBox(value)
        setSearchList([])
        inpRef.current?.focus()
    }

    return (
        <div className="relative">
            {title ? (
                <Label htmlFor={valueKey} className="text-right p-1">
                    {title}
                </Label>
            ) : null}
            <Input
                id={valueKey}
                data-testid={'magickInput'}
                ref={inpRef}
                className="w-full"
                name={valueKey}
                onBlur={handleSubmit}
                onKeyDown={update}
                onChange={handleChange}
                value={inputBox || ''}
                placeholder="curl --fail https://google.com || exit 1"
            />
            {searchList.length > 0 ? (
                <ul className="absolute p-1 rounded-sm max-h-[30rem] overflow-auto z-10">
                    <ScrollArea
                        test-id={'historyBook'}
                        className="bg-foreground text-muted rounded-sm w-max"
                    >
                        {infinityList().map((item, idx) => {
                            return (
                                <li
                                    tabIndex={1}
                                    role="button"
                                    test-id={'historyItem'}
                                    key={idx}
                                    className={`hover:cursor-pointer hover:outline hover:outline-1 px-2 max-w-[90vw] break-words flex gap-2
                                    ${idx + infiniteIndex - OFFSET === infiniteIndex ? 'bg-primary text-primary-foreground' : ''}`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <p className="text-muted/70 w-8">
                                        {idx - OFFSET + infiniteIndex}
                                    </p>
                                    <p>{item}</p>
                                </li>
                            )
                        })}
                    </ScrollArea>
                </ul>
            ) : null}
        </div>
    )
}

export default InputWithMagic
