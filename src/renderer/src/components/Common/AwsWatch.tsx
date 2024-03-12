import { CheckIcon, Cross1Icon, PersonIcon } from '@radix-ui/react-icons'
import { IUseStack } from '@renderer/hooks/useStack'
import { baseSocket } from '@renderer/service/socket'
import { AwsEvents } from '@t'
import { useEffect, useState } from 'react'
import { CustomToolTip } from './CustomTooltip'

function AwsWatch({ stack }: { stack: IUseStack }) {
    const [minutes, setMinutes] = useState(0)

    useEffect(() => {
        baseSocket.emit(AwsEvents.SSOSTATUS, (data: string) => {
            if (!data) return
            const millies = Math.abs(new Date().getTime() - new Date(data).getTime())
            setMinutes(Math.round(millies / 60000))
        })
    }, [stack.selectedStack])

    return (
        <CustomToolTip
            message={minutes > 0 ? `Your login will expire in ${minutes} min` : 'Login expired'}
        >
            <div className="relative">
                <div className="flex flex-col items-center justify-center">
                    <PersonIcon className="h-4 w-4" />
                    <span className="text-white/70 text-[0.6rem]">aws</span>
                </div>
                {minutes > 0 ? (
                    <CheckIcon className="w-4 h-4 absolute top-0 right-3" />
                ) : (
                    <Cross1Icon className="w-3 h-3 absolute top-0 right-3 text-red-500" />
                )}
            </div>
        </CustomToolTip>
    )
}

export default AwsWatch
