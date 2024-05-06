import { CheckIcon, ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@renderer/@/ui/select'
import { IUseStack } from '@renderer/hooks/useStack'
import { useContext, useEffect, useState } from 'react'
import { CustomToolTip } from './CustomTooltip'
import { ThemeContext } from '@renderer/App'

function BranchDropdown({ stack }: { stack: IUseStack }) {
    const theme = useContext(ThemeContext)

    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<string[]>([])
    const [selected, setSelected] = useState<string>()
    const [errors, setErrors] = useState<string[]>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        setErrors(undefined)
        setSelected(undefined)

        const socket = stack.stackSocket?.get(stack.selectedStack)
        if (!socket) return
        socket.emit('gitPull', (errors) => {
            if (errors.length > 0) setErrors(errors)
            else setErrors(undefined)
        })
        socket.emit('gitGetBranches', (data) => {
            setOptions(data)
            setSelected(data.find((i) => i.startsWith('*')))
            setTimeout(() => {
                setLoading(false)
            }, 300)
        })
    }, [stack.selectedStack])

    const handleSelect = (branch: string) => {
        const socket = stack.stackSocket?.get(stack.selectedStack)
        if (!socket) return
        setErrors(undefined)
        setLoading(true)

        // For UX reasons
        setTimeout(() => {
            socket.emit('gitSwitchBranch', branch, (errors) => {
                if (errors.length > 0) setErrors(errors)
                else setSelected(branch)
                setLoading(false)
            })
        }, 200)
    }

    const handlePull = () => {
        setErrors(undefined)
        setLoading(true)
        const socket = stack.stackSocket?.get(stack.selectedStack)
        if (!socket) return
        socket.emit('gitPull', (errors) => {
            if (errors.length > 0) setErrors(errors)
            else setErrors(undefined)
        })
        socket.emit('gitGetBranches', (data) => {
            setOptions(data)
            setSelected(data.find((i) => i.startsWith('*')))

            // For UX reasons
            setTimeout(() => {
                setLoading(false)
            }, 300)
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Select
                open={open}
                onOpenChange={setOpen}
                value={selected}
                onValueChange={handleSelect}
            >
                <SelectTrigger className="w-full min-w-[8rem] text-[0.8rem] h-8 p-[0.6rem] border-0 overflow-hidden text-ellipsis">
                    <SelectValue placeholder={'Git brances'} />
                </SelectTrigger>
                <SelectContent data-theme={theme}>
                    <SelectGroup>
                        {!loading && options
                            ? options.map((option) => (
                                <SelectItem
                                    key={option}
                                    value={option}
                                >
                                    {option}
                                </SelectItem>
                            ))
                            : null}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <ReloadIcon
                onClick={handlePull}
                className={`w-4 h-4 hover:cursor-pointer hover:scale-110 hover:text-violet-500 ${loading ? 'animate-spin' : ''}`}
            />
            <CustomToolTip message={`${errors}`} hidden={!errors}>
                {errors ? (
                    <ExclamationTriangleIcon
                        className={`w-4 h-4 text-orange-500 transition-opacity duration-500 ${errors ? 'opacity-100' : 'opacity-0'}`}
                    />
                ) : (
                    <CheckIcon
                        className={`w-4 h-4 text-green-500 transition-opacity duration-500 ${!loading ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}
            </CustomToolTip>
        </div>
    )
}

export default BranchDropdown
