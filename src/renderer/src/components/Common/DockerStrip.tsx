import { FileIcon, TrashIcon } from '@radix-ui/react-icons'
import dockerLogo from '../../assets/docker-mark-blue.svg'
import { useEffect, useState } from 'react'
import { DockerContainer } from '@t'
import { baseSocket } from '@renderer/service/socket'
import { HoverCardTrigger, HoverCard, HoverCardContent } from '@renderer/@/ui/hover-card'
import { CustomToolTip } from './CustomTooltip'




function DockerStrip() {

    const [containers, setContainers] = useState<Map<string, DockerContainer[]>>(new Map())

    const fetchContainers = async () => {
        baseSocket.emit('dockerContainers', (data) => {
            setContainers(JSON.parse(data))
        })
    }

    useEffect(() => {
        fetchContainers()
    }, [])


    const toggleContainer = (id: string, running: boolean) => {
        if (running) {
            baseSocket.emit('dockerStop', id, (data) => {
                setContainers(JSON.parse(data))
            })
        } else {
            baseSocket.emit('dockerStart', id, (data) => {
                setContainers(JSON.parse(data))
            })
        }
    }

    const removeContainer = (id: string) => {
        baseSocket.emit('dockerRemove', id, (data) => {
            setContainers(JSON.parse(data))
        })
    }

    return (
        <div className="w-full absolute justify-end flex items-center px-2 py-1 gap-3">

            {Object.keys(containers).map((key) => {
                const group = containers[key]
                if (!group) return null
                return <div key={key} className='flex gap-[0.2rem]'>

                    {group.map((c: DockerContainer) => {
                        const composeFile = c.Labels['com.docker.compose.project.config_files']
                        const composeDir = c.Labels['com.docker.compose.project.working_dir']
                        return <HoverCard key={c.Id} openDelay={200} closeDelay={300}>
                            <HoverCardTrigger
                                className='hover:cursor-pointer'
                                onClick={() => toggleContainer(c.Id, c.State === 'running')}
                                onContextMenu={() => window.store.openFileLocation(composeFile)}>
                                <div key={c.Id}
                                    className={`size-4 text-white/40 relative top-[0.5px]
                                     rounded-full
                                     ${c.State === 'running' ? 'bg-green-900' : 'bg-red-900'}
                                     `} />
                            </HoverCardTrigger>
                            <HoverCardContent className='w-[480px] min-h-[250px]'>
                                <div className='flex items-center relative'>
                                    <div className='relative bottom-2'>
                                        <h1>{c.Names.join("-")}</h1>
                                        <p className='text-sm text-white/50'>{c.Image}</p>
                                    </div>
                                    <div className='flex gap-3 absolute right-0 top-0'>
                                        <FileIcon className={`${composeFile ? 'hover:cursor-pointer' : 'text-white/20'}`}
                                            onContextMenu={() => navigator.clipboard.writeText(composeFile)}
                                            onClick={() => window.store.openFileLocation(composeDir)} />
                                        <CustomToolTip message='Kills and removes the container and anonymous volumes associated with it.'>
                                            <TrashIcon onClick={() => removeContainer(c.Id)} />
                                        </CustomToolTip>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 pt-2'>

                                    <div>
                                        <p className='text-base text-white/50'>Entrypoint:</p>
                                        <p
                                            className='bg-white/80 w-fit text-black px-2 rounded-sm
                                        font-code tracking-widest leading-5'>
                                            {c.Command}
                                        </p>
                                    </div>
                                    <div className='flex justify-between'>
                                        <div>
                                            <p className='text-base leading-5 text-white/50'>Network mode:</p>
                                            <p className='text-[1.2rem] leading-4'>
                                                {c.HostConfig.NetworkMode}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-base leading-5 text-white/50'>Depends on:</p>
                                            <p>
                                                {c.Labels['com.docker.compose.depends_on']?.split(':')[0]}
                                            </p>
                                            <p>
                                                {c.Labels['com.docker.compose.depends_on']?.split(':')[1]}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-base text-white/50'>Compose project:</p>
                                        <p className='text-[1.2rem] leading-4'>
                                            {c.Labels['com.docker.compose.project'] ?? "-"}
                                        </p>
                                    </div>
                                    <p className='text-white/50 self-center absolute bottom-2'>{c.Status}</p>
                                </div>
                            </HoverCardContent>

                        </HoverCard>

                    })}
                </div>

            })}
            <img src={dockerLogo} className='size-5 hover:cursor-pointer' onClick={fetchContainers} />
        </div>
    )
}

export default DockerStrip