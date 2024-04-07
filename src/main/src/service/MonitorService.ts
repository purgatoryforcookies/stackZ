import { exec } from 'child_process'
import { parsePowershellTCPMessage } from '../util/util'
import { Processes } from 'src/types'


export class MonitorService {
    constructor() {
    }

    async activePortsTCP() {
        try {
            const data: string = await new Promise((res, rej) => {
                exec('Get-NetTCPConnection -state Listen | select-object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,CreationTime,OwningProcess, @{Name="Process";Expression={(Get-Process -Id $_.OwningProcess).ProcessName}} | ft -auto', { shell: 'powershell.exe' }, (err, stdout) => {
                    if (err) {
                        rej(err)
                    }
                    res(stdout)
                })
            })
            const groupedProcesses = parsePowershellTCPMessage(data)

            const processes: Processes = []
            const keys = [...groupedProcesses.keys()]
            keys.forEach(key => {

                const p = groupedProcesses.get(key)
                if (!p) throw new Error(`${key} does not exist in grouped processes`)

                processes.push({
                    process: key,
                    ports: p
                })
            })

            return processes

        } catch (error) {
            console.log(error)
            return []
        }
    }

    activePortsUDP() {

    }






}