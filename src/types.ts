import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { Server } from 'socket.io'
import { z } from 'zod'


// const temp = z.array(z.object({
//     id: z.number().default(1),
//     stackName: z.string().default('First'),
//     env: z.array(z.object({
//         pairs: z.record(z.string().min(1), z.string().optional()),
//         title: z.string().min(1).default('Default'),
//         order: z.number().default(1),
//         disabled: z.array(z.string())
//     })),
//     palette: z.array(z.object({
//         id: z.number().default(1),
//         title: z.string().default('First command'),
//         command: z.object({
//             cmd: z.string().default('Echo Hello'),
//             shell: z.string().optional(),
//             env: z.array(z.object({
//                 pairs: z.record(z.string().min(1), z.string().optional()),
//                 title: z.string().min(1).default('Default'),
//                 order: z.number().default(1),
//                 disabled: z.array(z.string())
//             })).optional(),
//             cwd: z.string().optional()
//         })
//     }))
// }))


const env = z.object({
    pairs: z.record(z.string().min(1), z.string().optional()),
    title: z.string().min(1).default('Default'),
    order: z.number().default(1),
    disabled: z.array(z.string())
})


export const CmdSchema = z.object({
    id: z.number().default(1),
    title: z.string().default('First command'),
    command: z.object({
        cmd: z.string().default('Echo Hello'),
        shell: z.string().optional(),
        env: z.array(env).optional(),
        cwd: z.string().optional()
    })
})


export const CmdJsonSchema = z.array(
    CmdSchema
).optional()

export const StackSchema = z.object({
    id: z.number().default(1),
    stackName: z.string().default('First'),
    env: z.array(env).optional(),
    palette: CmdJsonSchema
})
export const StackJsonSchema = z.array(StackSchema)


export type Cmd = z.infer<typeof CmdSchema>
export type JsonEnv = z.infer<typeof env>
export type PaletteStack = z.infer<typeof StackSchema>
export type ENVs = JsonEnv & { disabled: string[] }
export type EnginedCmd = Cmd & { engine: TerminalUIEngine }
export type ExtendedCmd = Map<number, EnginedCmd> | undefined
export type StackCmd = Map<number, PaletteStack>

export type SocketServer = Server

export enum SelectionEvents {
    START = "START",
    CONN = "CONNECT",
    STOP = "STOP",
    EXPAND = "EXPAND",
    NEWSTACK = "NEWSTACK"

}

export type Status = {
    stackId: number,
    cmd: Cmd,
    isRunning: boolean,
    cwd: string | undefined
}

export type StackStatus = {
    stack: number,
    state: {
        running: boolean
        id: number
    }[]
}

export type EnvironmentEditProps = {
    stack: number
    terminal: number
    order: number
    key: string
    previousKey?: string
    value: string
    enabled: boolean
}

export type UtilityProps = {
    stack: number,
    terminal: number,
    order: number,
    value?: string
}
export type Utility2Props = {
    stack: number,
    terminal: number,
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
    },
    theme: string
}