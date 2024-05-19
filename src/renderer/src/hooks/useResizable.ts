import { StoreType } from '@t'
import { useEffect, useState } from 'react'
import { ResizeCallback } from 're-resizable'

export const useResizable = () => {
    const [w, setW] = useState(0)
    const [h, setH] = useState(0)

    useEffect(() => {
        const fetchPaletteWidth = async () => {
            const size = (await window.store.get('paletteWidths')) as StoreType['paletteWidths']
            setW(size.palette)
            setH(size.header)
        }
        fetchPaletteWidth()
    }, [])

    const sizeHeader: ResizeCallback = (_e, _direction, ref, _d) => {
        setH(ref.clientHeight)
        const newWidths = { header: ref.clientHeight, palette: w }
        window.store.set('paletteWidths', newWidths)
    }
    const sizePalette: ResizeCallback = (_e, _direction, ref, _d) => {
        setW(ref.clientWidth)
        const newWidths = { header: h, palette: ref.clientWidth }
        window.store.set('paletteWidths', newWidths)
    }

    const togglePalette = () => {
        //TODO:
        // if (!paletteRef.current) return
        // if (paletteRef.current.isCollapsed()) {
        //     paletteRef.current.expand()
        // } else {
        //     paletteRef.current.collapse()
        // }
    }
    const toggleHeader = () => {
        // if (!headerRef.current) return
        // if (headerRef.current.isCollapsed()) {
        //     headerRef.current.expand()
        // } else {
        //     headerRef.current.collapse()
        // }
    }

    return {
        sizeHeader,
        sizePalette,
        w,
        h,
        toggle: {
            header: toggleHeader,
            palette: togglePalette
        }
    }
}
