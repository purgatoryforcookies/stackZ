import { CheckIcon, FileIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import dockerLogo from '../../assets/docker-mark-blue.svg'
import { useEffect, useState } from 'react'
import { DockerContainer } from '@t'
import { baseSocket } from '@renderer/service/socket'
import { HoverCardTrigger, HoverCard, HoverCardContent } from '@renderer/@/ui/hover-card'
import { CustomToolTip } from './CustomTooltip'


type DockerStripProps = {
    containers: Record<string, DockerContainer[]>
    setContainers: (containers: Record<string, DockerContainer[]>) => void
}

const FAULTSTATE_ERROR_CODE = 'ERRFAULT'

function DockerStrip({ containers, setContainers }: DockerStripProps) {

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [clipBoardLoad, setClipBoardLoad] = useState(false)

    const fetchContainers = async (userInitted: boolean = false) => {

        if (userInitted) setLoading(true)
        baseSocket.emit('dockerContainers', (data, err) => {
            setLoading(false)
            if (err) {
                setError(err)
                return
            }
            setContainers(JSON.parse(data))
            setError(null)
        })
    }

    const handleClipBoardCopy = (file: string | undefined) => {
        if (file) {
            setClipBoardLoad(true)
            navigator.clipboard.writeText(file)
            setTimeout(() => {
                setClipBoardLoad(false)
            }, 1800)
        }
    }

    useEffect(() => {
        if (error === FAULTSTATE_ERROR_CODE) return
        const interval = setInterval(fetchContainers, 2000)
        return () => clearInterval(interval)
    }, [error])

    const toggleContainer = (id: string, running: boolean) => {
        setError(null)
        setLoading(true)
        if (running) {
            baseSocket.emit('dockerStop', id, (data, err) => {
                setLoading(false)
                if (err) setError(err)
                setContainers(JSON.parse(data))
            })
        } else {
            baseSocket.emit('dockerStart', id, (data, err) => {
                setLoading(false)
                if (err) setError(err)
                setContainers(JSON.parse(data))
            })
        }
    }

    const removeContainer = (id: string) => {
        setError(null)
        setLoading(true)
        baseSocket.emit('dockerRemove', id, (data, err) => {
            setLoading(false)
            if (err) setError(err)
            setContainers(JSON.parse(data))
        })
    }

    const makeFriendlyName = (name: string[]) => {
        const firstname = name[0]
        const parts = firstname.split('-')

        if (parts.length === 1) {
            return parts[0].slice(0, 4) + parts[0].slice(-1)
        }
        if (parts.length <= 2) {
            return parts[0].slice(0, 2) + parts[1].slice(0, 2)
        }
        const firstPart = parts[0].slice(0, 2)
        const secondPart = parts.slice(-2)[0].slice(0, 3)
        return firstPart + secondPart
    }

    return (
        <div className="w-full absolute justify-end flex items-center px-2 py-1 gap-5">
            {error ? <p className="text-sm text-white/40">{error}</p> : null}
            {loading ? <ReloadIcon className="animate-spin size-4" /> : null}
            {Object.keys(containers).map((key) => {
                const group = containers[key]
                if (!group) return null
                return (
                    <div key={key} className="flex gap-[0.3rem]">
                        {group.map((c: DockerContainer) => {
                            const composeFile =
                                c.Labels?.['com.docker.compose.project.config_files']
                            const composeDir = c.Labels?.['com.docker.compose.project.working_dir']
                            return (
                                <HoverCard key={c.Id} openDelay={200} closeDelay={300}>
                                    <HoverCardTrigger
                                        className="hover:cursor-pointer"
                                        onClick={() => toggleContainer(c.Id, c.State === 'running')}
                                        onContextMenu={() =>
                                            window.store.openFileLocation(composeFile)
                                        }
                                    >
                                        <div
                                            className={` text-sm
										${c.State === 'running' ? 'underline' : 'text-white/50'}`}
                                        >
                                            {makeFriendlyName(c.Names)}
                                        </div>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="min-w-[480px] w-fit">
                                        <div className="flex items-center relative">
                                            <div className="relative bottom-2">
                                                <h1>{c?.Names ? c?.Names.join('-') : 'No name'}</h1>
                                                <p className="text-sm text-white/50 pr-20">
                                                    {c.Image}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 absolute right-0 top-0">
                                                {!clipBoardLoad ? (
                                                    <FileIcon
                                                        className={`${composeFile ? 'hover:cursor-pointer' : 'text-white/20'}`}
                                                        onContextMenu={() =>
                                                            handleClipBoardCopy(composeFile)
                                                        }
                                                        onClick={() =>
                                                            composeDir &&
                                                            window.store.openFileLocation(
                                                                composeDir
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <CheckIcon />
                                                )}
                                                <CustomToolTip message="Kills and removes the container and anonymous volumes associated with it.">
                                                    <TrashIcon
                                                        onClick={() => removeContainer(c.Id)}
                                                    />
                                                </CustomToolTip>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 pt-2">
                                            <div>
                                                <p className="text-base text-white/50">
                                                    Entrypoint:
                                                </p>
                                                <p
                                                    className="bg-white/80 w-fit text-black px-2 rounded-sm
                                        font-code tracking-widest leading-5"
                                                >
                                                    {c.Command}
                                                </p>
                                            </div>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-base leading-5 text-white/50">
                                                        Network mode:
                                                    </p>
                                                    <p className="text-[1.2rem] leading-4">
                                                        {c.HostConfig.NetworkMode}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-base leading-5 text-white/50">
                                                        Depends on:
                                                    </p>
                                                    <p>
                                                        {
                                                            c.Labels[
                                                            'com.docker.compose.depends_on'
                                                            ]
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex justify-between'>

                                                <div className="pb-10">
                                                    <p className="text-base text-white/50">
                                                        Compose project:
                                                    </p>
                                                    <p className="text-[1.2rem] leading-4">
                                                        {c.Labels?.['com.docker.compose.project'] ??
                                                            '-'}
                                                    </p>
                                                </div>
                                                <div className="pb-10">
                                                    <p className="text-base text-white/50">
                                                        Ports:
                                                    </p>
                                                    {c.Ports.map((p) => (
                                                        <p className="text-[1.2rem] leading-4">
                                                            {p.PrivatePort}:{p.PublicPort}
                                                        </p>))}

                                                </div>
                                            </div>
                                            <p className="text-white/50 self-center absolute bottom-2">
                                                {c.Status}
                                            </p>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            )
                        })}
                    </div>
                )
            })}
            <img
                src={dockerLogo}
                className="size-5 hover:cursor-pointer"
                onClick={() => fetchContainers(true)}
            />
        </div>
    )
}

export default DockerStrip
