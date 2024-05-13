import { CircleIcon } from '@radix-ui/react-icons'
import dockerLogo from '../../assets/docker-mark-blue.svg'
import { useEffect, useState } from 'react'
import { DockerContainer } from '@t'
import { baseSocket } from '@renderer/service/socket'

function DockerStrip() {

    const [containers, setContainers] = useState<Map<string, DockerContainer[]>>(new Map())

    useEffect(() => {

        baseSocket.emit('dockerContainers', (data) => {
            setContainers(JSON.parse(data))
        })
    }, [])



    return (
        <div className="w-full absolute justify-end flex items-center px-2 py-1 gap-3">

            {Object.keys(containers).map((key) => {
                const group = containers[key]
                if (!group) return null
                return <div className='flex gap-[0.2rem]'>

                    {group.map((c: DockerContainer) => {
                        return <CircleIcon key={c.Id}
                            className='size-4 text-white/40 relative top-[0.5px]' />
                    })}
                </div>

            })}
            <img src={dockerLogo} className='size-5' />
        </div>
    )
}

export default DockerStrip