import { DockerContainer } from "src/types"



export class DockerService {

    baseUrl: string = 'http://localhost:2375'

    constructor() {
        this.getContainers()
    }


    async getContainers() {

        const resp: DockerContainer[] = await fetch(this.baseUrl + '/containers/json?all=true')
            .then(d => {
                if (d.status !== 200) {
                    throw new Error('Unable to connect. Is the docker api enabled?')
                }
                return d
            })
            .then(d => d.json())

        if (resp.length === 0) return new Map<string, DockerContainer[]>()

        const byProject: Map<string, DockerContainer[]> = new Map()

        resp.forEach(i => {

            const label = i.Labels['com.docker.compose.project'] ?? 'noProject'

            if (!byProject.has(label)) byProject.set(label, [])

            const prev = byProject.get(label)
            if (!prev) throw new Error('Array not found')
            byProject.set(label, [...prev, i])

        })

        return byProject
    }

    async stopContainer(id: string) {
        await fetch(this.baseUrl + `/containers/${id}/stop`, { method: 'POST' })
    }
    async startContainer(id: string) {
        await fetch(this.baseUrl + `/containers/${id}/start`, { method: 'POST' })
    }
    async removeContainer(id: string) {
        await fetch(this.baseUrl + `/containers/${id}?v=true&force=true`, { method: 'DELETE' })
    }

}