import { exec } from 'child_process'
import { Terminal } from './Terminal'
import { ClientEvents, Cmd } from '../../../types'

type StartJob = {
    t_metasettings: Cmd['metaSettings']
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
 * - Wait halt terminal to exit (assuming it exits) before proceeding to next one
 *
 * Scheduler can be stopped by calling stop(). All timers will be cleared and stack startup
 * aborted.
 *
 * If healthcheck fails to compute (bad command), it will count as a failed healthcheck. 
 * After n retries, it starts the terminal process anyways
 * 
 * For halting terminals, gives the scheduler briefly for the halting terminal instance. 
 * Terminal instance then resets the scheduler state after it exits and stack
 * can continue to proceed. 
 */
export class TerminalScheduler {
    jobs: StartJob[]
    haltActive: boolean = false

    constructor(terminals: Map<string, Terminal>) {
        this.jobs = []

        console.log(Array.from(terminals.values()).map(o => [o.settings.executionOrder, o.settings.command.cmd]))

        Array.from(terminals.values())
            .sort((a, b) => {
                if (a.settings.executionOrder && b.settings.executionOrder) {
                    return a.settings.executionOrder - b.settings.executionOrder
                }
                return -1
            })
            .forEach((term) => {

                this.jobs.push({
                    t_metasettings: term.settings.metaSettings,
                    t_terminal: term,
                    interval: HC_INTERVAL_MS,
                    limit: HC_LIMIT,
                    job_timer: undefined,
                    hasRun: false
                })
            })

        this.set()
    }

    async set() {
        if (this.jobs.length === 0) return
        this.jobs.forEach(j => j.t_terminal.reserve())

        for (let i = 0; i < this.jobs.length; i++) {
            const job = this.jobs[i]
            if (!job.t_metasettings?.delay && !job.t_metasettings?.healthCheck && !job.t_metasettings?.halt) {
                if (!this.haltActive) {
                    this.start(job)
                    continue
                }
            }


            if (this.haltActive) {
                i -= 1
                await new Promise<void>((r) => setTimeout(() => {
                    r()
                }, HC_INTERVAL_MS))

                continue
            }
            if (job.t_metasettings?.halt) {
                job.t_terminal.registerScheduler(this)
                this.haltActive = true
                job.t_terminal.socket.emit(ClientEvents.HALTBEAT, true)
            }

            if (job.t_metasettings?.delay) {
                job.job_timer = setTimeout(() => {
                    if (job.t_metasettings?.healthCheck) {
                        this.startHealtcheck(job)
                    } else {
                        this.start(job)
                    }
                }, job.t_metasettings.delay);
                continue
            }

            if (job.t_metasettings?.healthCheck) {
                this.startHealtcheck(job)
                continue
            }

            this.start(job)

        }
    }

    startHealtcheck(job: StartJob) {

        job.job_timer = setInterval(() => {
            job.limit -= 1
            job.t_terminal.socket.emit(ClientEvents.HEARTBEAT, job.limit)

            if (job.limit === 0) {
                clearInterval(job.job_timer)
                this.start(job)
            }
            if (!job.t_metasettings?.healthCheck) {
                clearInterval(job.job_timer)
                this.start(job)
                return
            }
            exec(job.t_metasettings?.healthCheck, (error) => {
                if (error) {
                    if (job.limit < 10 || job.limit % 10 === 0) {
                        job.t_terminal.sendToClient(
                            `[Warning]: Healthcheck not passing, ${job.limit} attempts left until terminal start\n\r`
                        )
                    }
                } else {
                    this.start(job)
                    clearInterval(job.job_timer)
                }

            })
        }, HC_INTERVAL_MS)
    }

    start(job: StartJob) {

        job.t_terminal.start()
        job.hasRun = true
        job.t_terminal.unReserve()
    }

    stop() {
        this.haltActive = false
        if (this.jobs.length > 0) {
            this.jobs.forEach((j) => {
                if (j.job_timer) {
                    j.t_terminal.socket.emit(ClientEvents.HEARTBEAT, undefined)
                    j.t_terminal.unReserve()
                    clearInterval(j.job_timer)
                    clearTimeout(j.job_timer)
                }
                j.t_terminal.stop()
                j.t_terminal.unReserve()
            })
        }
        this.jobs = []
    }

    unhalt() {
        this.haltActive = false

    }
}
