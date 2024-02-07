import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { z } from 'zod'

export const stackSchema = z.array(
    z.object({
        id: z.string().default('gibberish'),
        stackName: z.string().default('First'),
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
                    metaSettings: z.object({
                        loose: z.boolean().default(false),
                        rerun: z.boolean().default(false),
                        delay: z.number().default(0)
                    }).optional(),
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
    BIGSTATE = 'bigState',
    ENVEDIT = 'environmentEdit',
    ENVMUTE = 'environmentMute',
    ENVLIST = 'environmentList',
    ENVDELETE = 'environmentDelete',
    CMDMETASETTINGS = 'commandMetaSetting'
}

export enum TerminalEvents {
    CWD = 'changeCwd',
    CMD = 'changeCommand',
    SHELL = 'changeShell',
    INPUT = 'input',
    RESIZE = 'resize',
}

export enum ClientEvents {
    DELTERMINAL = 'terminalDelete',
    STACKSTATE = 'stackState',
    TERMINALSTATE = 'terminalState',

}



export type Status = {
    stackId: string
    cmd: Cmd
    isRunning: boolean
    cwd: string | undefined
}

export type StackStatus = {
    stack: string
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

export type UpdateCwdProps = Pick<EnvironmentEditProps, 'order' | 'value'>
export type RemoveEnvListProps = Pick<EnvironmentEditProps, 'terminal' | 'order'>

export enum Panels {
    Details,
    Terminals
}

export type StoreType = {
    paletteWidths: {
        palette1: number
        palette2: number
    }
    theme: string
}

