import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@renderer/@/ui/select'
import { ThemeContext } from '@renderer/App'
import { useContext } from 'react'

function KillSignal() {
    const theme = useContext(ThemeContext)

    return (
        <Select defaultValue="SIGINT" disabled>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select kill signal" />
            </SelectTrigger>
            <SelectContent data-theme={theme}>
                <SelectGroup>
                    <SelectItem value="SIGHUP">SIGHUP (1)</SelectItem>
                    <SelectItem value="SIGINT">SIGINT (2)</SelectItem>
                    <SelectItem value="SIGQUIT">SIGQUIT (3)</SelectItem>
                    <SelectItem value="SIGTERM">SIGTERM (15)</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default KillSignal
