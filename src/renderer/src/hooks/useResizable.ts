import { StoreType } from "@t"
import { RefObject, useEffect, useLayoutEffect, useState } from "react"
import { ImperativePanelHandle } from "react-resizable-panels"

const MIN_PALETTE_WIDTH = 230

type RefT = RefObject<ImperativePanelHandle>

export const useResizable = (paletteRef: RefT, headerRef: RefT) => {

    const [storedWidth, setStoredWidth] = useState<StoreType['paletteWidths'] | undefined>()

    useEffect(() => {
        const fetchPaletteWidth = async () => {
            const width = await window.store.get('paletteWidths')
            setStoredWidth(width as StoreType['paletteWidths'])
        }
        fetchPaletteWidth()
        // window.addEventListener('resize', handleResize)
        // return () => window.removeEventListener('resize', handleResize)
    }, [])

    useLayoutEffect(() => {
        const panel = document.querySelector('[data-panel-id="palette"]')

        if (!panel) return

        const observer = new ResizeObserver(() => {
            const screenW = window.innerWidth

            if (!paletteRef.current) return
            if (panel.clientWidth < MIN_PALETTE_WIDTH) {
                const newFlexValue = (MIN_PALETTE_WIDTH / screenW) * 100
                paletteRef.current.resize(newFlexValue)
            }
        })

        observer.observe(panel)

        return () => observer.disconnect()
    })

    const sizeHeader = async (val: number) => {
        const newWidths = { ...storedWidth }
        newWidths.header = val
        await window.store.set('paletteWidths', newWidths)
    }
    const sizePalette = async (val: number) => {
        const newWidths = { ...storedWidth }
        newWidths.palette = val
        await window.store.set('paletteWidths', newWidths)
    }

    const togglePalette = () => {

        if (!paletteRef.current) return
        if (paletteRef.current.isCollapsed()) {
            paletteRef.current.expand()
        }
        else {
            paletteRef.current.collapse()
        }
    }
    const toggleHeader = () => {
        if (!headerRef.current) return
        if (headerRef.current.isCollapsed()) {
            headerRef.current.expand()
        }
        else {
            headerRef.current.collapse()
        }
    }

    return {
        storedWidth,
        sizeHeader,
        sizePalette,
        toggle: {
            header: toggleHeader,
            palette: togglePalette
        }
    }
}