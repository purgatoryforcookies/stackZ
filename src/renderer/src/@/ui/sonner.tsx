import { ThemeContext } from '@renderer/App'

import { useContext } from 'react'
import { Toaster as Sonner } from 'sonner'

const Toaster = () => {
  const theme = useContext(ThemeContext)

  return (
    <Sonner
      data-theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
        }
      }}
    />
  )
}

export { Toaster }
