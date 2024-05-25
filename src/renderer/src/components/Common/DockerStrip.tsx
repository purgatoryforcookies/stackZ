import { CheckIcon, FileIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import dockerLogo from '../../assets/docker-mark-blue.svg'
import { useContext, useState } from 'react'
import { DockerContainer } from '@t'
import { HoverCardTrigger, HoverCard, HoverCardContent } from '@renderer/@/ui/hover-card'
import { CustomToolTip } from './CustomTooltip'
import { IUseDocker } from '@renderer/hooks/useDocker'
import {
    ContextMenuTrigger,
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem
} from '@renderer/@/ui/context-menu'
import { ThemeContext } from '@renderer/App'

type DockerStripProps = {
    docker: IUseDocker
}

function DockerStrip({ docker }: DockerStripProps) {
    const [clipBoardLoad, setClipBoardLoad] = useState(false)
    const theme = useContext(ThemeContext)

    const { loading, error, containers, toggle, remove, get, stopAll, deleteAll } = docker

    const handleClipBoardCopy = (file: string | undefined) => {
        if (file) {
            setClipBoardLoad(true)
            navigator.clipboard.writeText(file)
            setTimeout(() => {
                setClipBoardLoad(false)
            }, 1800)
        }
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
                                        onClick={() => toggle(c.Id, c.State === 'running')}
                                        onContextMenu={() =>
                                            composeDir && window.store.openFileLocation(composeFile)
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
                                                    <TrashIcon onClick={() => remove(c.Id)} />
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
                                                        {c.Labels['com.docker.compose.depends_on']}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
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
                                                    <div className="flex flex-col gap-1">
                                                        {c.Ports.map((p) => (
                                                            <p
                                                                key={p.IP}
                                                                className="text-[1.2rem] leading-4"
                                                            >
                                                                {p.PublicPort} : {p.PrivatePort}
                                                            </p>
                                                        ))}
                                                    </div>
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
            <ContextMenu>
                <ContextMenuTrigger>
                    <img
                        src={dockerLogo}
                        className="size-5 hover:cursor-pointer"
                        onClick={() => get(true)}
                    />
                </ContextMenuTrigger>
                <ContextMenuContent data-theme={theme.theme} className="w-36">
                    <ContextMenuItem inset onClick={stopAll}>
                        Stop all
                    </ContextMenuItem>
                    <ContextMenuItem inset onClick={deleteAll}>
                        Delete all
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
    )
}

export default DockerStrip
