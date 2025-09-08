export function useEditorCommands(editor: any, updateContent: () => void) {
    const exec = (command: string, value?: string) => {
      document.execCommand(command, false, value)
      updateContent()
    }

    const insertKeyword = (keyword: string) => {
      if (!editor.value) return
      
      // Focus the editor first
      editor.value.focus()
      
      // Create the keyword placeholder text
      const keywordText = `{{ ${keyword} }}`
      
      // Get current selection
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        
        // Check if the selection is within the editor
        if (editor.value.contains(range.commonAncestorContainer)) {
          // Delete any selected content
          range.deleteContents()
          
          // Create a text node with the keyword
          const textNode = document.createTextNode(keywordText)
          
          // Insert the text node
          range.insertNode(textNode)
          
          // Move cursor to after the inserted text
          range.setStartAfter(textNode)
          range.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          // If no selection or selection is outside editor, append to end
          const textNode = document.createTextNode(keywordText)
          editor.value.appendChild(textNode)
          
          // Set cursor after the inserted text
          const newRange = document.createRange()
          newRange.setStartAfter(textNode)
          newRange.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      } else {
        // No selection, append to end of editor
        const textNode = document.createTextNode(keywordText)
        editor.value.appendChild(textNode)
        
        // Set cursor after the inserted text
        const newRange = document.createRange()
        const selection = window.getSelection()
        newRange.setStartAfter(textNode)
        newRange.setEndAfter(textNode)
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
      
      // Update content
      updateContent()
    }

    return { exec, insertKeyword }
}
  