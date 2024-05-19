import { DockerContainer } from "../../../types"
import http from "http"
import { httpNativeRequest } from "../util/util"
import { DockerError, DockerFaultState } from "../util/error"


export class DockerService {

    private port: number = 2375
    private winHost: string = '127.0.0.1'
    private macHost: string = '/var/run/docker.sock'
    errorCount: number = 0
    errorLimit: number = 10

    constructor() {
        this.getContainers()
    }

    isTooMuch() {
        return this.errorCount > this.errorLimit
    }

    async getContainers() {


        const byProject: Map<string, DockerContainer[]> = new Map()

        if (this.isTooMuch()) {
            throw new DockerFaultState('Docker service in fault state')
        }


        const resp: DockerContainer[] = []

        const options: http.RequestOptions = {
            path: '/containers/json?all=true',
            timeout: 3
        }
        if (process.platform === 'win32') {
            options.host = this.winHost
            options.port = this.port
        } else {
            options.socketPath = this.macHost
        }


        try {
            const data = await httpNativeRequest<DockerContainer[]>(options)
            if (!data) {
                return byProject
            }
            resp.push(...data)

        } catch (error) {
            this.errorCount += 1
            throw error

        }

        if (resp.length === 0) return byProject

        resp.forEach(i => {

            const label = i.Labels?.['com.docker.compose.project'] ?? 'noProject'

            if (!byProject.has(label)) byProject.set(label, [])

            const prev = byProject.get(label)
            if (!prev) throw new Error('TS Array not found')
            byProject.set(label, [...prev, i])

        })
        this.errorCount = 0
        return byProject
    }

    async stopContainer(id: string) {
        if (this.isTooMuch()) {
            throw new DockerFaultState('Docker service in fault state')
        }

        const options: http.RequestOptions = {
            path: `/containers/${id}/stop`,
            timeout: 10,
            method: 'POST'
        }
        if (process.platform === 'win32') {
            options.host = this.winHost
            options.port = this.port
        } else {
            options.socketPath = this.macHost
        }

        try {
            await httpNativeRequest(options)
            this.errorCount = 0
            return
        } catch (error) {
            this.errorCount += 1
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown stop container error'
        }

    }
    async startContainer(id: string) {
        if (this.isTooMuch()) {
            throw new DockerFaultState('Docker service in fault state')
        }

        const options: http.RequestOptions = {
            path: `/containers/${id}/start`,
            timeout: 10,
            method: 'POST'
        }
        if (process.platform === 'win32') {
            options.host = this.winHost
            options.port = this.port
        } else {
            options.socketPath = this.macHost
        }

        try {
            await httpNativeRequest(options)
            this.errorCount = 0
            return

        } catch (error) {
            this.errorCount += 1
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown start container error'
        }
    }
    async removeContainer(id: string) {
        if (this.isTooMuch()) {
            throw new DockerFaultState('Docker service in fault state')
        }

        const options: http.RequestOptions = {
            path: `/containers/${id}?v=true&force=true`,
            timeout: 10,
            method: 'DELETE'
        }
        if (process.platform === 'win32') {
            options.host = this.winHost
            options.port = this.port
        } else {
            options.socketPath = this.macHost
        }

        try {
            await httpNativeRequest(options)
            this.errorCount = 0
            return

        } catch (error) {
            this.errorCount += 1
            console.log(error)
            if (error instanceof DockerError) {
                return error.message
            }
            return 'Unknown remove container error'
        }

    }

}