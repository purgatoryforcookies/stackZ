import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { Server } from 'socket.io'
import { z } from 'zod'

const jsonVariables = z.object({
    pairs: z.record(z.string().min(1), z.string().optional()),
    title: z.string().min(1),
    order: z.number(),
    disabled: z.array(z.string())
})


export const CmdSchema = z.object({
    id: z.number(),
    title: z.string(),
    command: z.object({
        cmd: z.string(),
        shell: z.string().optional(),
        env: z.array(jsonVariables).optional(),
        cwd: z.string().optional()
    })
})

export const CmdJsonSchema = z.array(
    CmdSchema
)


export type Cmd = z.infer<typeof CmdSchema>
export type JsonEnv = z.infer<typeof jsonVariables>
export type ENVs = JsonEnv & { disabled: string[] }
export type EnginedCmd = Cmd & { engine: TerminalUIEngine }
export type ExtendedCmd = Map<number, EnginedCmd>

export type SocketServer = Server

export enum SelectionEvents {
    START = "START",
    CONN = "CONNECT",
    STOP = "STOP",
    EXPAND = "EXPAND"

}

export type Status = {
    cmd: Cmd,
    isRunning: boolean,
    cwd: string | undefined
}

export type EnvironmentEditProps = {
    id: number
    key: string
    previousKey: string | undefined
    value: string
    enabled: boolean
    orderId: number
}

export type EnvironmentMuteProps = Pick<EnvironmentEditProps, 'orderId' | 'key'>
export type UpdateCwdProps = Pick<EnvironmentEditProps, 'id' | 'value'>
export type RemoveEnvListProps = Pick<EnvironmentEditProps, 'id' | 'orderId'>
export type AddEnvListProps = { id: number, title: string }


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