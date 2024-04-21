import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { z } from 'zod'

export const stackSchema = z.array(
    z.object({
        id: z.string().default('gibberish'),
        stackName: z.string().default('First'),
        defaultCwd: z.string().optional(),
        defaultShell: z.string().optional(),
        defaultCommand: z.string().optional(),
        env: z
            .array(
                z.object({
                    pairs: z.record(z.string().min(1), z.string().optional()),
                    title: z.string().min(1).default('Default'),
                    order: z.number().default(1),
                    disabled: z.array(z.string())
                })
            )
            .optional(),
        palette: z
            .array(
                z.object({
                    id: z.string().default('gibberish'),
                    executionOrder: z.number().optional(),
                    title: z.string().default('First command'),
                    metaSettings: z
                        .object({
                            loose: z.boolean().default(false).optional(),
                            rerun: z.boolean().default(false).optional(),
                            ctrlc: z.boolean().default(false).optional(),
                            delay: z.number().optional(),
                            healthCheck: z.string().optional(),
                            halt: z.boolean().default(false).optional(),
                        })
                        .optional(),
                    command: z.object({
                        cmd: z.string().default('Echo Hello'),
                        shell: z.string().optional(),
                        env: z
                            .array(
                                z.object({
                                    pairs: z.record(z.string().min(1), z.string().optional()),
                                    title: z.string().min(1).default('Default'),
                                    order: z.number().default(1),
                                    disabled: z.array(z.string())
                                })
                            )
                            .optional(),
                        cwd: z.string().optional()
                    })
                })
            )
            .optional()
    })
)

export type PaletteStack = z.infer<typeof stackSchema>[0]

export type Cmd = Exclude<PaletteStack['palette'], undefined>[0]
export type Environment = Exclude<Cmd['command']['env'], undefined>[0]
export type CommandMetaSetting = Exclude<Cmd['metaSettings'], undefined>
export type EnginedCmd = Cmd & { engine: TerminalUIEngine }

export enum SelectionEvents {
    START = 'START',
    CONN = 'CONNECT',
    STOP = 'STOP',
    EXPAND = 'EXPAND',
    NEWSTACK = 'NEWSTACK'
}

export enum UtilityEvents {
    STATE = 'state',
    STACKSTATE = 'stackState',
    ENVEDIT = 'environmentEdit',
    ENVMUTE = 'environmentMute',
    ENVLIST = 'environmentList',
    ENVLISTDELETE = 'environmentListDelete',
    ENVDELETE = 'environmentDelete',
    CMDMETASETTINGS = 'commandMetaSetting',
    HEALTHSETTINGS = 'commandHealthSetting',
    STACKDEFAULTS = 'stackDefaults',
    STACKNAME = 'stackName',
    CWD = 'changeCwd',
    CMD = 'changeCommand',
    SHELL = 'changeShell',
    TITLE = 'title',
    INPUT = 'input',
    RESIZE = 'resize',
    REORDER = 'reOrder'
}

export enum ClientEvents {
    DELTERMINAL = 'terminalDelete',
    STACKSTATE = 'stackState',
    TERMINALSTATE = 'terminalState',
    HEARTBEAT = 'heartbeat',
    HALTBEAT = 'haltbeat'
}

export enum GitEvents {
    GETBRANCHES = 'getBranches',
    PULL = 'pull',
    SWITCHBRANCH = 'switchBranch'
}

export type Status = {
    stackId: string
    reserved: boolean
    cmd: Cmd
    isRunning: boolean
    cwd: string | undefined
}

export type StackStatus = {
    stack: string
    isRunning: boolean
    shell: string | undefined
    cwd: string | undefined
    cmd: string | undefined
    isReserved: boolean
    state: {
        running: boolean
        id: string
    }[]
}

export type EnvironmentEditProps = {
    stack: string
    terminal: string
    order: number
    key: string
    previousKey?: string
    value: string
    enabled: boolean
}

export type UtilityProps = {
    stack: string
    terminal: string
    order: number
    value?: string
}
export type Utility2Props = {
    stack: string
    terminal: string
    value: string
}
export type StackDefaultsProps = PickStartsWith<PaletteStack, 'default'>

export type UpdateCwdProps = Pick<EnvironmentEditProps, 'order' | 'value'>
export type RemoveEnvListProps = Pick<EnvironmentEditProps, 'terminal' | 'order'>

export enum Panels {
    Details,
    Terminals
}

export enum HistoryKey {
    CWD,
    CMD,
    SHELL,
    HEALTH
}

export type MkdirError = {
    errno: number
    syscall: string
    code: string
    path: string
}

export type NewCommandPayload = {
    title: string
    command?: string
    shell?: string
    cwd?: string
}

export type MonitorPortsResponse = {
    tcp: Processes,
    udp: Processes
}

export type StoreType = {
    paletteWidths: {
        header: number
        palette: number
    }
    userSettings: {
        global: {
            defaultCwd: string | null
            defaultShell: string | null
            awsPlugin: boolean
        }
    }
    theme: string
}

type PickStartsWith<T extends object, S extends string> = {
    // eslint-disable-next-line
    [K in keyof T as K extends `${S}${infer _R}` ? K : never]: T[K]
}

export type TPorts = {
    process: string
    pid: number
    state: string | null
    localPort: number
    localAddress: string
    protocol: string
    remotePort: number | null
    remoteAddress: string | null
}

export type Processes = {
    process: string
    byPort: {
        number: number,
        ports: TPorts[]
    }[]
}[]

export type HistoryBook = {
    stackz: string[],
    host: string[]
}