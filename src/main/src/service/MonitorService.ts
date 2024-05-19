import { exec } from 'child_process'
import { parsePSTCPMessage, parsePSUDPMessage } from '../util/util'
import { Processes } from '../../../types'

export class MonitorService {
    constructor() {
        this.activePortsUDP()
    }

    async activePortsTCP() {
        if (process.platform !== 'win32') return []
        const command = [
            'Get-NetTCPConnection -state Listen |',
            'select-object',
            'LocalAddress, LocalPort, RemoteAddress, RemotePort, State,',
            'OwningProcess, @{Name="Process";Expression={(Get-Process -Id $_.OwningProcess).ProcessName}} |',
            'ft -auto'
        ]

        try {
            const data: string = await new Promise((res, rej) => {
                exec(command.join(' '), { shell: 'powershell.exe' }, (err, stdout) => {
                    if (err) {
                        rej(err)
                    }
                    res(stdout)
                })
            })

            const groupedProcesses = parsePSTCPMessage(data)
            const processes: Processes = []
            const keys = [...groupedProcesses.keys()]

            keys.forEach((key) => {
                const p = groupedProcesses.get(key)
                if (!p) throw new Error(`${key} does not exist in grouped processes`)

                const tmp_ports: Processes[0]['byPort'] = []

                const innerKeys = [...p.keys()]

                innerKeys.forEach((byPort) => {
                    const innerP = p.get(byPort)
                    if (!innerP)
                        throw new Error(`${byPort} does not exist in inner grouped processes`)

                    tmp_ports.push({
                        number: byPort,
                        ports: innerP
                    })
                })
                processes.push({
                    process: key,
                    byPort: tmp_ports
                })
            })

            processes.sort((a, b) => {
                a.byPort.sort((a, b) => a.number - b.number)
                return a.byPort.length - b.byPort.length
            })

            return processes
        } catch (error) {
            console.log(error)
            return []
        }
    }

    // TODO: combine functions from this and tcp into one.
    async activePortsUDP() {
        if (process.platform !== 'win32') return []
        const command = [
            'Get-NetUDPEndpoint |',
            ' select LocalAddress,LocalPort,OwningProcess,',
            '@{Name="Process";Expression={(Get-Process -Id $_.OwningProcess).ProcessName}} |',
            'ft -auto'
        ]

        try {
            const data: string = await new Promise((res, rej) => {
                exec(command.join(' '), { shell: 'powershell.exe' }, (err, stdout) => {
                    if (err) {
                        rej(err)
                    }
                    res(stdout)
                })
            })

            const groupedProcesses = parsePSUDPMessage(data)
            const processes: Processes = []
            const keys = [...groupedProcesses.keys()]

            keys.forEach((key) => {
                const p = groupedProcesses.get(key)
                if (!p) throw new Error(`${key} does not exist in grouped processes`)

                const tmp_ports: Processes[0]['byPort'] = []

                const innerKeys = [...p.keys()]

                innerKeys.forEach((byPort) => {
                    const innerP = p.get(byPort)
                    if (!innerP)
                        throw new Error(`${byPort} does not exist in inner grouped processes`)

                    tmp_ports.push({
                        number: byPort,
                        ports: innerP
                    })
                })
                processes.push({
                    process: key,
                    byPort: tmp_ports
                })
            })

            processes.sort((a, b) => {
                a.byPort.sort((a, b) => a.number - b.number)
                return a.byPort.length - b.byPort.length
            })

            return processes
        } catch (error) {
            console.log(error)
            return []
        }
    }
}
