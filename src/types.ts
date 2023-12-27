import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { Server } from 'socket.io'
import { z } from 'zod'

const jsonVariables = z.object({
    pairs: z.record(z.string().min(1), z.string().optional()),
    title: z.string().min(1),
    order: z.number()
})


export const CmdSchema = z.object({
    id: z.number(),
    command: z.object({
        cmd: z.string(),
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

export enum TerminalInvokes {
    START = "START",
    CONN = "CONNECT",
    STOP = "STOP"
}

export type EnvironmentEditProps = {
    id: number
    key: string | undefined
    value: string
    enabled: boolean
    orderId: number
}

export type EnvironmentMuteProps = Pick<EnvironmentEditProps, 'orderId' | 'key'>