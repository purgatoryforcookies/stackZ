import { Terminal } from "./Terminal"


type SchedulerArgs = {
    terminals: Map<string, Terminal>
}

type StartJob = {
    timer: null | number
    healthCheck: string
    interval: number
    limit: number
} & SchedulerArgs



export class TerminalScheduler {

    jobs: StartJob[]

    constructor() { }


    add({ terminals }: SchedulerArgs) {
        const tempArray: Terminal[] = []

        terminals.forEach((term) => {
            // this.jobs.push(term)
        })

        tempArray.sort((a, b) => {
            if (a.settings.executionOrder && b.settings.executionOrder) {
                return a.settings.executionOrder - b.settings.executionOrder
            }
            return -1
        })
        // th
    }







}