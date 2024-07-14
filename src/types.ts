import { ITerminalDimensions } from 'xterm-addon-fit'
import { TerminalUIEngine } from './renderer/src/service/TerminalUIEngine'
import { z } from 'zod'
import { Server, Socket } from 'socket.io'
import { Socket as ClientSocket } from 'socket.io-client'

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
                            sequencing: z
                                .array(
                                    z.object({
                                        index: z.number(),
                                        echo: z.string().optional(),
                                        message: z.string().optional()
                                    })
                                )
                                .optional()
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
                                    disabled: z.array(z.string()),
                                    visualState: z.enum(['0', '1', '2']).optional()
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

export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
}

export enum SelectionEvents {
    START = 'START',
    CONN = 'CONNECT',
    STOP = 'STOP',
    EXPAND = 'EXPAND',
    NEWSTACK = 'NEWSTACK'
}

export interface ServerToClientEvents {
    hello: () => void
    stackState: (state: StackStatus) => void
    badgeHeartBeat: (state: StackStatus) => void
    haltBeat: (beat: boolean) => void
    heartBeat: (beat: number | undefined) => void
    terminalState: (state: Status) => void
    output: (data: string) => void
    terminalDelete: (args: { stack: string; terminal: string }) => void
    error: (err: string) => void
}

export type MetaSettingPayload =
    | string
    | boolean
    | number
    | []
    | Exclude<CommandMetaSetting['sequencing'], undefined>[0]
    | undefined

type ChangeSettingEvent = (arg: string, callback: (state: Status) => void) => void
type ChangeMetaSettingEvent = (
    name: string,
    value: MetaSettingPayload,
    callback: (state: Status) => void
) => void

export interface ClientToServerEvents {
    state: () => void
    stackState: () => void
    stackDefaults: (arg: StackDefaultsProps) => void
    stackName: (arg: { name: string }) => void
    retrieveSettings: (callback: (state: Status) => void) => void
    history: (
        key: keyof typeof HistoryKey,
        feed: string,
        callback: (data: HistoryBook) => void
    ) => void

    environmentEditSingle: (args: EnvironmentEditProps) => void
    environmentListEdit: (args: {
        value: string
        fromFile: ArrayBuffer | null
        id?: string | null
        order: number
    }) => void
    environmentNewList: (args: {
        value: string
        fromFile: ArrayBuffer | null
        id?: string | null
    }) => void
    environmentMute: (arg: UtilityProps) => void
    environmentListDelete: (args: UtilityProps) => void
    environmentDelete: (args: UtilityProps) => void
    environmentVisualState: (args: UtilityProps) => void

    commandMetaSetting: ChangeMetaSettingEvent
    commandHealthSetting: () => void
    changeCwd: ChangeSettingEvent
    changeCommand: ChangeSettingEvent
    changeShell: ChangeSettingEvent
    changeTitle: ChangeSettingEvent
    input: (args: { data: string }) => void
    resize: (args: { value: ITerminalDimensions }) => void
    reOrder: (arg: { terminalId: string; newOrder: number }) => void
    gitPull: (callback: (errors: string[]) => void) => void
    gitGetBranches: (callback: (branches: string[]) => void) => void
    gitSwitchBranch: (branch: string, callback: (errors: string[]) => void) => void

    clearHistory: (callback: () => void) => void
    copyToClipboard: (callback: (cmd: string) => void) => void

    dockerContainers: (callback: (data: string, err?: string) => void) => void
    dockerStop: (id: string, callback: (data: string, err?: string) => void) => void
    dockerStart: (id: string, callback: (data: string, err?: string) => void) => void
    dockerRemove: (id: string, callback: (data: string, err?: string) => void) => void
}

export type CustomServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>
export type CustomClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>
export type CustomServer = Server<ClientToServerEvents, ServerToClientEvents>

export type Status = {
    stackId: string
    stackEnv: Environment[] | undefined
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
    order: number
    key: string
    previousKey?: string
    value: string
    enabled: boolean
    id?: string | null
}

export type UtilityProps = {
    order: number
    value?: string
    id?: string | null
}
export type Utility2Props = {
    stack: string
    terminal: string
    value: string
}
export type StackDefaultsProps = PickStartsWith<PaletteStack, 'default'>

export type UpdateCwdProps = Pick<EnvironmentEditProps, 'order' | 'value'>
export type RemoveEnvListProps = {
    terminal: string
    order: number
}

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
    tcp: Processes
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
        number: number
        ports: TPorts[]
    }[]
}[]

export type HistoryBook = {
    stackz: string[]
    host: string[]
}

export type DockerNetwork = {
    IPAMConfig: string | null
    Links: string | null
    Aliases: string[] | null
    NetworkID: string
    EndpointID: string
    Gateway: string
    IPAddress: string
    IPPrefixLen: number
    IPv6Gateway: string
    GlobalIPv6Address: string
    GlobalIPv6PrefixLen: number
    MacAddress: string
    DriverOpts: string | null
}

export type DockerMount = {
    Destination: string
    Driver: string
    Mode: string
    Name: string
    Propagation: string
    RW: boolean
    source: string
    Type: string
}

export type DockerPort = {
    IP: string
    PrivatePort: number
    PublicPort: number
    type: 'tcp' | 'udp'
}

export type DockerContainer = {
    Id: string
    Names: string[]
    Image: string
    ImageID: string
    Command: string
    Created: number
    Ports: DockerPort[]
    Labels: { [key: string]: string | undefined }
    State: string
    Status: string
    HostConfig: { [key: string]: string }
    NetworkSettings: { [key: string]: { [key: string]: DockerNetwork } }
    Mounts: DockerMount[]
}
