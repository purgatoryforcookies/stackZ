import { DockerContainer } from "src/types"
import http from "http"
import { httpNativeRequest } from "../util/util"
import { DockerError } from "../util/error"





export class DockerService {

    baseUrl: string = 'http://localhost:2375'

    constructor() {
        this.getContainers()
    }


    async getContainers() {

        const resp: DockerContainer[] = []

        const options: http.RequestOptions = {
            socketPath: process.platform !== 'win32' ? '/var/run/docker.sock' : 'localhost',
            path: '/containers/json?all=true',
            timeout: 1
        }


        const byProject: Map<string, DockerContainer[]> = new Map()
        const data = await httpNativeRequest<DockerContainer[]>(options)
        if (!data) {
            return byProject
        }

        resp.push(...data)

        if (resp.length === 0) return byProject



        resp.forEach(i => {

            const label = i.Labels?.['com.docker.compose.project'] ?? 'noProject'

            if (!byProject.has(label)) byProject.set(label, [])

            const prev = byProject.get(label)
            if (!prev) throw new Error('TS Array not found')
            byProject.set(label, [...prev, i])

        })


        return byProject
    }

    async stopContainer(id: string) {

        const options: http.RequestOptions = {
            socketPath: process.platform !== 'win32' ? '/var/run/docker.sock' : 'localhost',
            path: `/containers/${id}/stop`,
            timeout: 10,
            method: 'POST'
        }

        try {
            await httpNativeRequest(options)
            return
        } catch (error) {
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown stop container error'
        }

    }
    async startContainer(id: string) {

        const options: http.RequestOptions = {
            socketPath: process.platform !== 'win32' ? '/var/run/docker.sock' : 'localhost',
            path: `/containers/${id}/start`,
            timeout: 10,
            method: 'POST'
        }

        try {
            await httpNativeRequest(options)
            return

        } catch (error) {
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown start container error'
        }
    }
    async removeContainer(id: string) {

        const options: http.RequestOptions = {
            socketPath: process.platform !== 'win32' ? '/var/run/docker.sock' : 'localhost',
            path: `/containers/${id}?v=true&force=true`,
            timeout: 5,
            method: 'DELETE'
        }

        try {
            await httpNativeRequest(options)
            return

        } catch (error) {
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown remove container error'
        }

    }

}