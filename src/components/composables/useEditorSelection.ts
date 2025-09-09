import { nextTick } from 'vue'

export function useEditorSelection(editor: any, isOpen: any, toolbarStyle: any, content: any, editorStore?: any) {
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
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    try {
      // Check if we're inside an existing background color span
      const commonAncestor = range.commonAncestorContainer
      let existingSpan: HTMLElement | null = null
      
      // Walk up the DOM to find existing background color span
      let node = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentElement : commonAncestor as HTMLElement
      while (node && node !== editor.value) {
        if (node.tagName === 'SPAN' && node.style.backgroundColor) {
          existingSpan = node
          break
        }
        node = node.parentElement
      }

      let newSpan: HTMLElement

      if (existingSpan) {
        // Update existing span's background color
        if (color && color !== 'transparent') {
          existingSpan.style.backgroundColor = color
        } else {
          // Remove background color by removing the style
          existingSpan.style.backgroundColor = ''
          // If the span has no other styles, unwrap it
          if (!existingSpan.style.cssText.trim()) {
            const parent = existingSpan.parentNode
            if (parent) {
              while (existingSpan.firstChild) {
                parent.insertBefore(existingSpan.firstChild, existingSpan)
              }
              parent.removeChild(existingSpan)
            }
            content.value = editor.value.innerHTML
            return
          }
        }
        newSpan = existingSpan
      } else {
        if (color && color !== 'transparent') {
          // Create new span with background color
          const span = document.createElement('span')
          span.style.backgroundColor = color
          
          // Extract and wrap content
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
          newSpan = span
        } else {
          // No need to create span for transparent color
          content.value = editor.value.innerHTML
          return
        }
      }
      
      // Recreate selection on the styled text
      const newRange = document.createRange()
      try {
        if (existingSpan) {
          // Select the entire existing span
          newRange.selectNodeContents(newSpan)
        } else {
          // Select the content of the new span
          if (newSpan.firstChild) {
            newRange.setStart(newSpan.firstChild, 0)
            newRange.setEnd(newSpan.lastChild || newSpan.firstChild, (newSpan.lastChild || newSpan.firstChild).textContent?.length || 0)
          }
        }
        
        selection.removeAllRanges()
        selection.addRange(newRange)
      } catch (rangeError) {
        // If reselection fails, just clear selection
        selection.removeAllRanges()
      }
      
      // Update the store value
      if (editorStore?.setBackgroundTextColor) {
        editorStore.setBackgroundTextColor(color || '')
      }
      
      // Update content
      content.value = editor.value.innerHTML
      
      // Keep the toolbar open by triggering handleSelection
      setTimeout(() => {
        handleSelection()
      }, 10)
      
    } catch (error) {
      console.error('Error applying background color:', error)
    }
  }

  function removeBackgroundColor() {
    applyBackgroundColor('transparent')
  }
  
  function applyTextColor(color: string) {
    if (!editor.value) return
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    if (color && color !== 'transparent') {
      document.execCommand('foreColor', false, color)
      // Update the store value
      if (editorStore?.setTextColor) {
        editorStore.setTextColor(color)
      }
    } else {
      // Clear text color
      document.execCommand('foreColor', false, 'inherit')
      if (editorStore?.setTextColor) {
        editorStore.setTextColor('')
      }
    }
    content.value = editor.value.innerHTML
  }

  function removeTextColor() {
    if (!editor.value) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand('foreColor', false, 'inherit')
    if (editorStore?.setTextColor) {
      editorStore.setTextColor('')
    }
    content.value = editor.value.innerHTML
  }

  return { handleSelection, applyBackgroundColor, removeBackgroundColor, applyTextColor, removeTextColor }
}
