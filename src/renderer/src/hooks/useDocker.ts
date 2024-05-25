import { baseSocket } from '@renderer/service/socket'
import { DockerContainer } from '@t'
import { useEffect, useState } from 'react'

const FAULTSTATE_ERROR_CODE = 'ERRFAULT'

export interface IUseDocker {
    containers: Record<string, DockerContainer[]>
    error: string | null
    loading: boolean
    get: (userInitted: boolean) => void
    toggle: (id: string, running: boolean) => void
    remove: (id: string) => void
    stopAll: () => void
    deleteAll: () => void
}

export const useDocker = (): IUseDocker => {
    const [containers, setContainers] = useState<Record<string, DockerContainer[]>>({})
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (error === FAULTSTATE_ERROR_CODE) return
        const interval = setInterval(get, 2000)
        return () => clearInterval(interval)
    }, [error])

    const get = async (userInitted: boolean = false) => {
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

    const toggle = (id: string, running: boolean) => {
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

    const remove = (id: string) => {
        setError(null)
        setLoading(true)
        baseSocket.emit('dockerRemove', id, (data, err) => {
            setLoading(false)
            if (err) setError(err)
            setContainers(JSON.parse(data))
        })
    }

    const stopAll = () => {
        Object.values(containers).forEach((project) => {
            project.forEach((container) => {
                baseSocket.emit('dockerStop', container.Id, (data) => {
                    setContainers(JSON.parse(data))
                })
            })
        })
    }

    const deleteAll = () => {
        Object.values(containers).forEach((project) => {
            project.forEach((container) => {
                baseSocket.emit('dockerRemove', container.Id, (data) => {
                    setContainers(JSON.parse(data))
                })
            })
        })
    }

    return {
        containers,
        loading,
        error,
        get,
        toggle,
        remove,
        stopAll,
        deleteAll
    }
}

export default useDocker
