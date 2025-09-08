import { nextTick } from 'vue'

export function useEditorSelection(editor: any, isOpen: any, toolbarStyle: any, content: any) {
  function handleSelection() {
    nextTick(() => {
      const selection = window.getSelection()
      if (selection?.rangeCount && editor.value?.contains(selection.anchorNode)) {
        if (!selection.isCollapsed && selection.toString().length > 0) {
          isOpen.value = true
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const editorRect = editor.value.getBoundingClientRect()
          toolbarStyle.value = {
            left: `${rect.left - editorRect.left}px`,
            top: `${rect.bottom - editorRect.top + 10}px`,
          }
        } else {
          isOpen.value = false
        }
      } else {
        isOpen.value = false
      }
    })
  }

  function applyBackgroundColor(color: string) {
    if (!editor.value) return
    if (!color) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand('hiliteColor', false, color)
    content.value = editor.value.innerHTML
  }

  function removeBackgroundColor() {
    if (!editor.value) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand('hiliteColor', false, 'transparent')
    content.value = editor.value.innerHTML
  }
  function applyTextColor(color: string) {
    if (!editor.value) return
    if (!color) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand('foreColor', false, color)
    content.value = editor.value.innerHTML
  }

  function removeTextColor() {
    if (!editor.value) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand('foreColor', false, 'transparent')
    content.value = editor.value.innerHTML
  }

  return { handleSelection, applyBackgroundColor, removeBackgroundColor, applyTextColor, removeTextColor }
}
