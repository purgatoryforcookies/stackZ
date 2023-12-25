import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { Server } from 'socket.io'
import { z } from 'zod'

export const CmdSchema = z.object({
    id: z.number(),
    command: z.object({
        cmd: z.string(),
        env: z.record(z.string().min(1), z.string()).optional(),
        variables: z.record(z.string().min(1), z.string()).optional()
    })
})

export const CmdJsonSchema = z.array(
    CmdSchema
)


export type Cmd = z.infer<typeof CmdSchema>

export type EnginedCmd = Cmd & { engine: TerminalUIEngine }
export type ExtendedCmd = Map<number, EnginedCmd>

export type SocketServer = Server

export enum TerminalInvokes {
    START = "START",
    CONN = "CONNECT",
    STOP = "STOP"
}