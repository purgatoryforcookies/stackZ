import { Cross2Icon, DotsHorizontalIcon, QuestionMarkIcon, SquareIcon } from '@radix-ui/react-icons'
import { IUseStack } from '@renderer/hooks/useStack'
import { GoHorizontalRule } from 'react-icons/go'
import Settings from '../settings/Settings'
import { useState } from 'react'

type ButtonWrapperProps = {
    children: React.ReactNode
    className?: React.ComponentProps<'div'>['className']
    onClick?: React.ComponentProps<'div'>['onClick']
}

const ButtonWrapper = ({ children, className, onClick }: ButtonWrapperProps) => {
    return (
        <div
            onClick={onClick}
            className={`h-full flex justify-center items-center w-10
    hover:bg-accent hover:cursor-pointer ${className || ''}`}
        >
            {children}
        </div>
    )
}

function NavBar({ stack }: { stack: IUseStack }) {
    const platform = window.process.platform
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false)

    return (
        <div className="flex border-b-[1px] h-8 justify-end">
            <div className="navbarDragArea flex-grow"></div>
            <ButtonWrapper
                onClick={() =>
                    window.open('https://purgatoryforcookies.github.io/stackZ/docs/intro')
                }
            >
                <QuestionMarkIcon className="size-4 text-primary" />
            </ButtonWrapper>
            <ButtonWrapper onClick={() => setSettingsOpen(true)}>
                <DotsHorizontalIcon className="size-5 text-primary relative top-[1px]" />
            </ButtonWrapper>
            {platform === 'win32' ? (
                <>
                    <ButtonWrapper onClick={() => window.tools.minimize()}>
                        <GoHorizontalRule className="size-4 mx-2 text-primary " />
                    </ButtonWrapper>
                    <ButtonWrapper onClick={() => window.tools.maximize()}>
                        <SquareIcon className="size-4 mx-2 text-primary" />
                    </ButtonWrapper>
                    <ButtonWrapper onClick={() => window.tools.close()}>
                        <Cross2Icon className="size-5 mx-2 text-primary" />
                    </ButtonWrapper>
                </>
            ) : null}
            <div className="navbarDragArea w-5 h-full"></div>
            <Settings stack={stack} open={settingsOpen} setOpen={setSettingsOpen} />
        </div>
    )
}

export default NavBar
