import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut
} from '@renderer/@/ui/command'
import { useContext, useEffect, useState } from 'react'
import { ButtonIcon, GlobeIcon, LayersIcon } from '@radix-ui/react-icons'
import { BsKey } from "react-icons/bs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@renderer/@/ui/tooltip'
import { Separator } from '@renderer/@/ui/separator'
import { ThemeContext } from '@renderer/App'
import { IUseStack } from '@renderer/hooks/useStack'
import { DockerContainer } from '@t'
import dockerLogo from '../../assets/docker-mark-white.svg'
import { IUseDocker } from '@renderer/hooks/useDocker'
import { NAME_FOR_OS_ENV_SET } from './EnvironmentEditor/EnvEditor';

type CommandMenuProps = {
    stack: IUseStack
    docker: IUseDocker
    toggle: {
        header: () => void
        palette: () => void
    }
}

export function CommandMenu({ stack, toggle, docker }: CommandMenuProps) {
    const theme = useContext(ThemeContext)

    const [open, setOpen] = useState(false)

    const handleShortCuts = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'k':
                if (!e.metaKey && !e.ctrlKey) break
                setOpen(!open)
                break
            case 'x':
                if (!e.altKey && !e.metaKey) break
                toggle.header()
                break
            case 'z':
                if (!e.altKey && !e.metaKey) break
                toggle.palette()
                break
            case 'Enter':
                // TODO:
                // if (open) break
                // window.api.startTerminal(stack.selectedStack, stack.selectedTerminal)
                break
            case 'ArrowUp':
                // TODO: These are clashing with terminal shortcuts, find another way to do this
                // if (open) break
                // stack.selectTerminal((prev) => {
                //     const s = stack.stack?.get(stack.selectedStack)
                //     if (!s) return prev
                //     const oldOrder = s.palette?.find((p) => p.id === prev)?.executionOrder
                //     if (!oldOrder || oldOrder - 1 <= 0) return prev
                //     const newId = s.palette?.find((p) => p.executionOrder === oldOrder - 1)?.id
                //     if (!newId) return prev
                //     return newId
                // })
                break
            case 'ArrowDown':
                // if (open) break
                // stack.selectTerminal((prev) => {
                //     const s = stack.stack?.get(stack.selectedStack)
                //     if (!s) return prev
                //     const oldOrder = s.palette?.find((p) => p.id === prev)?.executionOrder
                //     if (!oldOrder || oldOrder + 1 > (s.palette?.length || 0)) return prev
                //     const newId = s.palette?.find((p) => p.executionOrder === oldOrder + 1)?.id
                //     if (!newId) return prev
                //     return newId
                // })
                break
            case 'ArrowRight':
                // if (open) break
                // stack.selectStack((prev) => {
                //     const s = stack.stack
                //     if (!s) return prev
                //     const key = Array.from(s.keys()).findIndex((k) => k === prev)
                //     if (key === -1) return prev
                //     return Array.from(s.keys())[key + 1] || prev
                // })
                break
            case 'ArrowLeft':
                // if (open) break
                // stack.selectStack((prev) => {
                //     const s = stack.stack
                //     if (!s) return prev
                //     const key = Array.from(s.keys()).findIndex((k) => k === prev)
                //     if (key === -1) return prev
                //     return Array.from(s.keys())[key - 1] || prev
                // })
                break
            default:
                break
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleShortCuts, true)
        return () => window.removeEventListener('keydown', handleShortCuts, true)
    }, [stack, open])

    const st = stack.stack
    if (!st) return null

    return (
        <CommandDialog open={open} onOpenChange={setOpen} data-theme={theme.theme}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem
                        onSelect={() =>
                            window.api.startTerminal(stack.selectedStack, stack.selectedTerminal)
                        }
                    >
                        Start active terminal
                        <CommandShortcut>CTRL+ENTER</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <Separator />
                <CommandGroup heading="Stacks" >
                    {stack
                        ? [...st.values()].map((s) => {
                            return (
                                <CommandItem
                                    key={s.id}
                                    className="flex gap-5"
                                    value={s.stackName}
                                    onSelect={() => {
                                        stack.selectStack(s.id)
                                        stack.selectTerminal(s.palette?.[0].id || 'gibberish')
                                        setOpen(false)
                                    }}

                                >
                                    <div className="flex w-20 justify-between pl-1">
                                        <span>{s.palette?.length ?? 0}x</span>
                                        <LayersIcon className="mr-2 h-4 w-4" />
                                    </div>
                                    <div className="flex justify-between w-full">
                                        <div className="flex flex-col">
                                            <span>{s.stackName}</span>
                                            <span className="text-white/20 text-[0.7rem]">
                                                #{s.id}
                                            </span>
                                        </div>

                                        {s.env?.length && s.env.length > 0 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <GlobeIcon />
                                                    </TooltipTrigger>
                                                    <TooltipContent side={'left'}>
                                                        <p>Has stack environments</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : null}
                                    </div>
                                </CommandItem>
                            )
                        })
                        : null}
                </CommandGroup>
                <Separator />
                <CommandGroup heading="Terminals">
                    {st
                        ? [...st.values()].map((s) => {
                            if (!s.palette) return null
                            return s.palette.map((cmd) => {
                                return (
                                    <CommandItem
                                        key={cmd.id}
                                        className="flex gap-5"
                                        value={
                                            cmd.title +
                                            cmd.command.cmd.toString() + s.stackName
                                        }

                                        onSelect={() => {
                                            stack.selectStack(s.id)
                                            stack.selectTerminal(cmd.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className='pl-1'>
                                            <ButtonIcon className="mr-2 h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{cmd.title}</span>
                                            <div className="flex flex-col">
                                                <span>{cmd.command.cmd}</span>
                                                <span>@{cmd.command.cwd}</span>
                                                <span>stack: {s.stackName}</span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                )
                            })
                        })
                        : null}
                </CommandGroup>
                <Separator />
                <CommandGroup heading="Containers">
                    {docker.containers
                        ? Object.keys(docker.containers).map((key) => {
                            const conts: DockerContainer[] = docker.containers[key]
                            if (!conts) return null

                            return conts.map((c) => {
                                const ports = c.Ports.map(
                                    (p) => `${p.PrivatePort}:${p.PublicPort}`
                                ).join('-')
                                return (
                                    <CommandItem
                                        key={c.Id}
                                        className="flex gap-5 h-30"
                                        value={
                                            c.Command +
                                            c.Image +
                                            c.Names.join('') +
                                            c.Labels?.['com.docker.compose.project'] || 'noProject'
                                        }
                                    >
                                        <div className='pl-1'>
                                            <img
                                                src={dockerLogo}
                                                className="size-5 hover:cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <span>{c.Names.join('-')}</span>
                                            <span className="text-white/50">{c.Image}</span>
                                            <div className="flex flex-col pt-2">
                                                <span>{c.Command}</span>
                                                <span>
                                                    Project:{' '}
                                                    {c.Labels?.['com.docker.compose.project']}
                                                </span>
                                            </div>
                                            {ports ? (
                                                <span className="self-end">Ports: {ports}</span>
                                            ) : null}
                                        </div>
                                        <p className="text-[0.8rem] absolute right-1 top-0 text-white/40">
                                            {c.Status}
                                        </p>
                                    </CommandItem>
                                )
                            })
                        })
                        : null}
                </CommandGroup>
                <Separator />
                <CommandGroup heading="Environments">
                    {st
                        ? [...st.values()].map((s) => {
                            if (!s.palette) return null
                            return s.palette.map((cmd) => {
                                if (!cmd.command.env) return null
                                return cmd.command.env.map((env) => {
                                    if (env.title === NAME_FOR_OS_ENV_SET) return null
                                    return Object.keys(env.pairs).map((key) => {
                                        return (
                                            <CommandItem
                                                key={cmd.id + env.order + key}
                                                className="flex gap-5"
                                                value={
                                                    "env " + key + cmd.id + env.order
                                                }
                                                onSelect={() => {
                                                    stack.selectStack(s.id)
                                                    stack.selectTerminal(cmd.id)
                                                    setOpen(false)
                                                }}
                                            >
                                                <div className='pl-1'>
                                                    <BsKey className="mr-2 h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{cmd.title}{"/"}{env.title}</span>
                                                    <div className="flex flex-col">
                                                        <span>{key}</span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        )
                                    })
                                })
                            })
                        })
                        : null}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
