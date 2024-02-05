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

// const env = z.object({
//     pairs: z.record(z.string().min(1), z.string().optional()),
//     title: z.string().min(1).default('Default'),
//     order: z.number().default(1),
//     disabled: z.array(z.string())
// })

// export const CmdSchema = z.object({
//     id: z.number(),
//     title: z.string().default('First command'),
//     command: z.object({
//         cmd: z.string().default('Echo Hello'),
//         shell: z.string().optional(),
//         env: z.array(env).optional(),
//         cwd: z.string().optional()
//     })
// })

// export const CmdJsonSchema = z.array(
//     CmdSchema
// ).optional()

// export const StackSchema = z.object({
//     id: z.number().default(1),
//     stackName: z.string().default('First'),
//     env: z.array(env).optional(),
//     palette: CmdJsonSchema
// })
// export const StackJsonSchema = z.array(StackSchema)

// export type Cmd2 = z.infer<typeof CmdSchema>
// export type JsonEnv = z.infer<typeof env>
// export type PaletteStack2 = z.infer<typeof StackSchema>
// export type ENVs = JsonEnv & { disabled: string[] }
// export type EnginedCmd2 = Cmd2 & { engine: TerminalUIEngine }
// export type ExtendedCmd = Map<number, EnginedCmd> | undefined
// export type StackCmd = Map<number, PaletteStack>

// export type SocketServer = Server

export enum SelectionEvents {
    START = 'START',
    CONN = 'CONNECT',
    STOP = 'STOP',
    EXPAND = 'EXPAND',
    NEWSTACK = 'NEWSTACK'
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

