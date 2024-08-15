import { Input } from '@renderer/@/ui/input'
import SuggestionBadges from './SuggestionBadges'
import { Button } from '@renderer/@/ui/button'
import { Checkbox } from '@renderer/@/ui/checkbox'
import { Label } from '@renderer/@/ui/label'
import { CustomToolTip } from '../CustomTooltip'
import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Separator } from '@renderer/@/ui/separator'
import { Textarea } from '@renderer/@/ui/textarea'
import { Cmd, CustomClientSocket } from '@t'
import { useState } from 'react'

type RemoteEnvEditorProps = {
    socket: CustomClientSocket
    data: Exclude<Cmd['command']['env'], undefined>[0]
    id: string
    setOpen: (open: boolean) => void
}

function RemoteEnvEditor({ socket, data, id, setOpen }: RemoteEnvEditorProps) {
    const [previewText, setPreviewText] = useState<string>('')
    const [unparsedText, setUnparsedText] = useState<string>('')
    const [input, setInput] = useState<string>(data.remote?.source || '')
    const [synced, setSynced] = useState<boolean>(data.remote?.autoFresh || false)
    const [offlineMode, setOfflineMode] = useState<boolean>(data.remote?.keep || false)
    const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const getPreview = (path: string, run?: boolean) => {
        setInput(path)
        setPreviewText('')
        setUnparsedText('')
        if (!run) return
        setLoadingPreview(true)
        socket.emit('environmentPreview', { from: path }, (data, error) => {
            const pairs = data.pairs
            if (error) {
                setPreviewText(error)
            } else if (!pairs || Object.keys(pairs).length === 0) {
                setUnparsedText(data.unparsed || 'No content found')
                setPreviewText('No content found')
            } else {
                let existingText = ''
                Object.keys(pairs).map((key) => {
                    if (key.startsWith('#')) {
                        existingText += `${key}\n`
                    } else {
                        existingText += `${key}=${pairs[key]}\n`
                    }
                })
                existingText = existingText.trimEnd()
                setPreviewText(existingText)
                setUnparsedText(data.unparsed || 'No content found')
            }
            setLoadingPreview(false)
        })
    }

    const handleSave = () => {
        setLoading(true)
        socket.emit(
            'environmentListEditRemote',
            {
                order: data.order,
                id: id,
                source: input,
                autoFresh: synced,
                keep: offlineMode
            },
            (error) => {
                setLoading(false)
                if (error) {
                    setPreviewText(error)
                } else {
                    setOpen(false)
                }
            }
        )
    }

    return (
        <>
            <div
                className="h-full md:grid 
            flex flex-col 
            grid-cols-[45%_auto_50%] 
            grid-rows-[25%_25%_20%_auto] 
            p-2 mb-3 gap-y-5"
            >
                <div className="col-start-1 row-span-2 row-start-1 mt-5 overflow-auto max-h-[300px]">
                    <p>Remote environment variables are hosted somewhere else than stackZ.</p>
                    <p>This can be a service or a file.</p>
                    <SuggestionBadges socket={socket} onClick={getPreview} />
                </div>
                <div className="col-start-1 row-start-3 pr-5">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            getPreview(input, true)
                        }}
                    >
                        <Input
                            placeholder="File path | command"
                            className="text-ellipsis"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button
                            onClick={() => getPreview(input, true)}
                            type="submit"
                            className="mt-4 float-right mr-2 w-20"
                            disabled={input.length === 0 || loading}
                        >
                            {!loadingPreview ? (
                                'Preview'
                            ) : (
                                <ReloadIcon className={`size-4 animate-spin`} />
                            )}
                        </Button>
                    </form>
                </div>
                <div className="col-start-1 row-start-4 flex justify-end items-end gap-5 pr-5">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={synced}
                            onCheckedChange={() => setSynced(!synced)}
                            id="sync"
                        />
                        <Label htmlFor="sync" className="flex items-center gap-2">
                            Keep in sync
                            <CustomToolTip message="Refreshes variables before terminal run. Otherwise refreshed only on stackZ startup">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={offlineMode}
                            onCheckedChange={() => setOfflineMode(!offlineMode)}
                            id="refresh"
                        />
                        <Label htmlFor="refresh" className="flex items-center gap-2">
                            Offline
                            <CustomToolTip message="Keeps a local copy of the variables as a backup, in case the source becomes unavailable. [Warning] Will be stored plaintext in stacks.json-file">
                                <InfoCircledIcon className="h-4 w-4 hover:cursor-pointer" />
                            </CustomToolTip>
                        </Label>
                    </div>
                </div>

                <div className="row-span-4 col-start-2 row-start-1 pl-4">
                    <Separator orientation="vertical" className="hidden md:block " />
                    <Separator orientation="horizontal" className="md:hidden block" />
                </div>

                <div
                    className="row-span-2 col-start-3 row-start-1
                        my-2
                        flex-col md:flex-row 
                        h-[600px] md:h-auto"
                >
                    <Label htmlFor="remote-preview">Preview</Label>
                    <Textarea
                        id="remote-preview"
                        disabled
                        className="w-full h-full resize-none"
                        value={previewText}
                        spellCheck={false}
                    />
                </div>
                <div
                    className="row-span-2 col-start-3 row-start-3
                        my-2 mb-4
                        flex-col md:flex-row 
                        h-[600px] md:h-auto"
                >
                    <Label htmlFor="remote-preview">Raw unparsed</Label>
                    <Textarea
                        id="remote-preview"
                        disabled
                        className="w-full h-full resize-none"
                        value={unparsedText}
                        spellCheck={false}
                    />
                </div>
            </div>

            <Button
                onClick={handleSave}
                className="mt-4 w-full"
                disabled={
                    loadingPreview ||
                    input.length === 0 ||
                    (input === data.remote?.source &&
                        synced === data.remote?.autoFresh &&
                        offlineMode === data.remote?.keep)
                }
            >
                {!loading ? (
                    'Save'
                ) : (
                    <div>
                        <ReloadIcon className={`size-4 h-5 animate-spin`} />
                    </div>
                )}
            </Button>
        </>
    )
}

export default RemoteEnvEditor
