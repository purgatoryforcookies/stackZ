import { exec } from 'child_process';



export class GitService {

    constructor() {
    }


    async getBranches() {
        try {
            const data: string = await new Promise((res, rej) => {
                exec('git branch -a', (err, stdout) => {
                    if (err) {
                        rej(err)
                    }
                    res(stdout)
                })
            })
            return data.split('\n').map(i => i.trim()).filter(i => i.length > 0)
        } catch (error) {
            console.log(error)
            return ['Error with branches', 'Unkown error']
        }
    }

    async switchBranch(branch: string): Promise<string[]> {
        try {
            const data = await new Promise<string[]>((res) => {
                exec(`git checkout ${branch}`, (err) => {
                    if (err) {
                        res(err.message.split('\n').slice(0, 2))
                    }
                    res([])
                })
            })
            return data
        } catch (error) {
            console.log(error)
            return ['Error with checkout', 'Unkown error']
        }
    }

    /**
     * 
     * @returns An array, its empty if there were no errors.
     */
    async pull(): Promise<string[]> {
        try {
            const data = await new Promise<string[]>((res) => {
                exec('git pull', (err) => {
                    if (err) {
                        res(err.message.split('\n').slice(0, 2))
                    }
                    res([])
                })
            })
            return data
        } catch (error) {
            console.log(error)
            return ['Error with pull', 'Unknown error']
        }

    }

}



