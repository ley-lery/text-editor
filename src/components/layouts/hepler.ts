import { nextTick } from "vue"

export const handleSelection = (editor: HTMLDivElement, isOpen: boolean, toolbarStyle: { left: string; top: string }) => {
    nextTick(() => {
        const selection = window.getSelection()
        if (selection?.rangeCount && editor.contains(selection.anchorNode)) {
            if (!selection.isCollapsed && selection.toString().length > 0) {
                isOpen = true
                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                const editorRect = editor.getBoundingClientRect()
                toolbarStyle = {
                    left: `${rect.left - editorRect.left}px`,
                    top: `${rect.bottom - editorRect.top + 10}px`
                }
            } else {
                isOpen = false
            }
        } else {
            isOpen = false
        }
    })
}