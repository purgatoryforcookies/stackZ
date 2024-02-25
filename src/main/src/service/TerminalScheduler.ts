import { execSync } from 'child_process'
import { Terminal } from './Terminal'



type StartJob = {
    t_delay: number | undefined
    t_healthCheck: string | undefined
    t_terminal: Terminal
    interval: number
    limit: number
    job_timer: NodeJS.Timeout | undefined
    hasRun: boolean
}

const HC_INTERVAL_MS = 1000
const HC_LIMIT = 240


/**
 * Terminal scheduler is responsible for starting each terminal in a stack
 * with
 * 
 * - Right order
 * - Delay the start by given time if delay attribute is present
 * - Delay the start with a command if healthCheck attribute is present
 * 
 * Scheduler can be stopped by calling stop(). All timers will be cleared and stack startup
 * aborted.
 * 
 * If healthcheck fails to compute (bad command), the terminal will not be started
 * and a warning message will be emitted to its socket. Scheduler will then discard it 
 * and move on to next one. 
 */
export class TerminalScheduler {
    jobs: StartJob[]


    constructor(terminals: Map<string, Terminal>) {
        this.jobs = []
        Array
            .from(terminals.values())
            .sort((a, b) => {
                if (a.settings.executionOrder && b.settings.executionOrder) {
                    return a.settings.executionOrder - b.settings.executionOrder
                }
                return -1
            })
            .forEach(term => {

                const settings = term.settings

                if (settings.health?.delay && settings.health?.healthCheck) {
                    term.sendToClient(`[Warning]: terminal ${term.settings.id} has both delay and healthcheck present. Scheduler was desinged to have only one of them. The delay will be used and hc ignored \n\r`)
                }

                this.jobs.push({
                    t_delay: settings.health?.delay,
                    t_healthCheck: settings.health?.healthCheck,
                    t_terminal: term,
                    interval: HC_INTERVAL_MS,
                    limit: HC_LIMIT,
                    job_timer: undefined,
                    hasRun: false
                })
            })

        this.start()
    }


    start() {

        if (this.jobs.length === 0) return

        for (let i = 0; i < this.jobs.length; i++) {

            const job = this.jobs[i]
            if (!job.t_delay && !job.t_healthCheck) {
                job.t_terminal.sendToClient("No healthchecks, starting immediately \n\r")
                job.t_terminal.start()
                job.hasRun = true
                continue
            }

            if (job.t_delay) {
                job.job_timer = setTimeout(() => {
                    job.t_terminal.start()
                    job.hasRun = true
                }, job.t_delay);
                continue
            }

            job.job_timer = setInterval(async () => {
                job.limit -= 1
                if (job.limit === 0) {
                    clearInterval(job.job_timer)
                    job.t_terminal.start()
                    job.hasRun = true
                }
                if (!job.t_healthCheck) {
                    clearInterval(job.job_timer)
                    job.t_terminal.start()
                    job.hasRun = true
                    return
                }
                try {
                    execSync(job.t_healthCheck).toString()
                    job.t_terminal.start()
                    job.hasRun = true
                    clearInterval(job.job_timer)
                } catch (error) {
                    if (job.limit < 10) {
                        job.t_terminal.sendToClient(`[Warning]: Healthcheck not passing, ${job.limit} attempts left until terminal start\n\r`)
                    }
                }
            }, HC_INTERVAL_MS)
        }
    }

    stop() {
        if (this.jobs.length > 0) {
            this.jobs.forEach(j => {
                clearInterval(j.job_timer)
                clearTimeout(j.job_timer)
            })
        }
    }

}
