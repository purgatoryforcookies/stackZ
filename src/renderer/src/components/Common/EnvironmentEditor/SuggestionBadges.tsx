import { ReloadIcon } from '@radix-ui/react-icons'
import { Badge } from '@renderer/@/ui/badge'
import { CustomClientSocket, EnvironmentSuggestions } from '@t'
import { useEffect, useState } from 'react'

type SuggestionBadgesProps = {
    socket: CustomClientSocket
    onClick: (path: string, run?: boolean) => void
}

/**
 * Suggestion badges fetches file and service suggestions from the server
 * and displays them as arrays of badges. Right clicking a file badge opens the file.
 */
function SuggestionBadges({ socket, onClick }: SuggestionBadgesProps) {
    const [suggestions, setSuggestions] = useState<EnvironmentSuggestions>()
    const [loading, setLoading] = useState<boolean>(false)

    const getFiles = () => {
        setLoading(true)
        socket.emit('environmentSuggestions', (files) => {
            setSuggestions(files)
            setTimeout(() => {
                setLoading(false)
            }, 900)
        })
    }

    useEffect(() => {
        getFiles()
    }, [])

    return (
        <div className="mt-5">
            <h2>File suggestions:</h2>
            <div className="flex gap-2 p-2 flex-wrap">
                {suggestions && suggestions.files.length > 0 ? (
                    suggestions.files.map((suggestion, i) => (
                        <Badge
                            key={i}
                            className="mt-1 hover:cursor-pointer"
                            onClick={() => onClick(suggestion, true)}
                            onContextMenu={() => window.store.openFileLocation(suggestion)}
                        >
                            {suggestion.split('\\').slice(-2).join('\\')}
                        </Badge>
                    ))
                ) : (
                    <p className="text-xs">No files found</p>
                )}
                <div className="flex items-center relative top-[2px]">
                    <ReloadIcon
                        onClick={getFiles}
                        className={`size-4 
                            hover:cursor-pointer
                            hover:text-violet-500  ${loading ? 'animate-spin' : ''}`}
                    />
                </div>
            </div>
            <h2>Service suggestions:</h2>
            <div className="flex gap-2 p-2 flex-wrap">
                <Badge
                    onClick={() =>
                        onClick(
                            'aws secretsmanager get-secret-value --secret-id testSecret --query SecretString --output text'
                        )
                    }
                    className="mt-1 hover:cursor-pointer"
                >
                    AWS Secrets manager
                </Badge>
            </div>
        </div>
    )
}

export default SuggestionBadges
