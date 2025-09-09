import type { Ref } from 'vue'

// Hook for applying text alignment to selected text
export function useSelectionTextAlignment(
  editor: Ref<HTMLElement | null>,
  editorStore: any,
  content: Ref<string>,
  handleSelection: () => void
) {
  const applyTextAlignment = (alignment: string) => {
    if (!editor.value) return

    const selection = window.getSelection()
    
    // If no selection, apply globally through store
    if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      editorStore.setTextAlign(alignment as any)
      return
    }

    const range = selection.getRangeAt(0)

    try {
      // Check if we're inside an existing alignment span
      const commonAncestor = range.commonAncestorContainer
      let existingSpan: HTMLElement | null = null
      
      // Walk up the DOM to find existing alignment span
      let node = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentElement : commonAncestor as HTMLElement
      while (node && node !== editor.value) {
        if (node.tagName === 'SPAN' && node.style.textAlign) {
          existingSpan = node
          break
        }
        node = node.parentElement
      }

      let newSpan: HTMLElement

      if (existingSpan) {
        // Update existing span's text alignment
        existingSpan.style.textAlign = alignment
        newSpan = existingSpan
      } else {
        // Create new span with text alignment
        const span = document.createElement('span')
        span.style.textAlign = alignment
        span.style.display = 'block' // Make it block to apply text-align
        
        // Extract and wrap content
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
        newSpan = span
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
      
      // Update content
      content.value = editor.value.innerHTML
      
      // Keep the toolbar open by triggering handleSelection
      setTimeout(() => {
        handleSelection()
      }, 10)
      
    } catch (error) {
      console.error('Error applying text alignment:', error)
    }
  }

  return { applyTextAlignment }
}

// Hook for applying line height to selected text
export function useSelectionLineHeight(
  editor: Ref<HTMLElement | null>,
  editorStore: any,
  content: Ref<string>,
  handleSelection: () => void
) {
  const applyLineHeight = (event: Event) => {
    const target = event.target as HTMLSelectElement
    const lineHeightValue = target.value
    
    if (!editor.value || !lineHeightValue) return

    const selection = window.getSelection()
    
    // If no selection, apply globally through store
    if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      editorStore.setLineHeight(lineHeightValue as any)
      target.value = '' // Reset dropdown
      return
    }

    const range = selection.getRangeAt(0)

    try {
      // Check if we're inside an existing line height span
      const commonAncestor = range.commonAncestorContainer
      let existingSpan: HTMLElement | null = null
      
      // Walk up the DOM to find existing line height span
      let node = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentElement : commonAncestor as HTMLElement
      while (node && node !== editor.value) {
        if (node.tagName === 'SPAN' && node.style.lineHeight) {
          existingSpan = node
          break
        }
        node = node.parentElement
      }

      // Convert named values to numeric values for inline styles
      const getNumericLineHeight = (value: string) => {
        const map: Record<string, string> = {
          'normal': 'normal',
          'tight': '1.25',
          'snug': '1.375',
          'relaxed': '1.625',
          'loose': '2'
        }
        return map[value] || value
      }

      const numericValue = getNumericLineHeight(lineHeightValue)
      let newSpan: HTMLElement

      if (existingSpan) {
        // Update existing span's line height
        existingSpan.style.lineHeight = numericValue
        newSpan = existingSpan
      } else {
        // Create new span with line height
        const span = document.createElement('span')
        span.style.lineHeight = numericValue
        
        // Extract and wrap content
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
        newSpan = span
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
      
      // Update content
      content.value = editor.value.innerHTML
      
      // Keep the toolbar open by triggering handleSelection
      setTimeout(() => {
        handleSelection()
      }, 10)
      
    } catch (error) {
      console.error('Error applying line height:', error)
    }
    
    // Reset the dropdown
    target.value = ''
  }

  return { applyLineHeight }
}
