import { exec } from 'child_process'

export class GitService {
    private cwd: string | undefined

    constructor(cwd: string | undefined) {
        this.cwd = cwd
    }

    setCwd(cwd: string) {
        this.cwd = cwd
    }
    clearCwd() {
        this.cwd = undefined
    }

    async getBranches() {
        if (!this.cwd) return ['Error', 'Stack default CWD is not set']
        try {
            const data: string = await new Promise((res, rej) => {
                exec('git branch -a', { cwd: this.cwd }, (err, stdout) => {
                    if (err) {
                        rej(err)
                    }
                    res(stdout)
                })
            })
            return data
                .split('\n')
                .map((i) => i.trim())
                .filter((i) => i.length > 0)
        } catch (error) {
            console.log(error)
            return ['Error with branches', 'Unkown error']
        }
    }

    async switchBranch(branch: string): Promise<string[]> {
        if (!this.cwd) return ['Error', 'Stack default CWD is not set']
        try {
            const data = await new Promise<string[]>((res) => {
                exec(`git checkout ${branch.replace("* ", "")}`, { cwd: this.cwd }, (err) => {
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

    async pull(): Promise<string[]> {
        if (!this.cwd) return ['Error', 'Stack default CWD is not set']
        try {
            const data = await new Promise<string[]>((res) => {
                exec('git pull', { cwd: this.cwd }, (err) => {
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
