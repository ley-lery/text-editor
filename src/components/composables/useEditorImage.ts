import type { Ref } from 'vue'
import { ref, onUnmounted } from 'vue'

// Global registry to map editorId to image upload triggers
const editorImageUploadRegistry = new Map<string, { openFile: Ref<boolean> }>()

export function useEditorImage(editor: Ref<HTMLElement | null>, updateContent: () => void) {
  const showImageInput = ref(false)
  const imageUrl = ref('')
  
  // Store the current resizing state
  const isResizing = ref(false)
  const currentImg = ref<HTMLElement | null>(null)
  let startX = 0
  let startY = 0
  let startWidth = 0
  let startHeight = 0
  let startLeft = 0
  let startTop = 0
  let currentHandle = ''

  const triggerImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string
        if (imageDataUrl) {
          insertImage(imageDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  const createResizeHandle = (position: string) => {
    const handle = document.createElement('div')
    handle.className = `resize-handle ${position}`
    handle.dataset.position = position
    handle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: #007bff;
      border: 1px solid #fff;
      border-radius: 50%;
      cursor: ${position.includes('top') && position.includes('left') ? 'nw-resize' :
                position.includes('top') && position.includes('right') ? 'ne-resize' :
                position.includes('bottom') && position.includes('left') ? 'sw-resize' :
                'se-resize'};
      z-index: 10;
    `
    
    // Position the handles
    if (position.includes('top')) handle.style.top = '-4px'
    if (position.includes('bottom')) handle.style.bottom = '-4px'
    if (position.includes('left')) handle.style.left = '-4px'
    if (position.includes('right')) handle.style.right = '-4px'
    
    handle.addEventListener('mousedown', startResize)
    return handle
  }

  const startResize = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const handle = e.target as HTMLElement
    const container = handle.parentElement as HTMLElement
    const img = container.querySelector('img') as HTMLElement
    
    if (!img) return
    
    isResizing.value = true
    currentImg.value = container
    currentHandle = handle.dataset.position || ''
    
    const rect = img.getBoundingClientRect()
    startX = e.clientX
    startY = e.clientY
    startWidth = rect.width
    startHeight = rect.height
    startLeft = rect.left
    startTop = rect.top
    
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
  }

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.value || !currentImg.value) return
    
    const img = currentImg.value.querySelector('img') as HTMLElement
    if (!img) return
    
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    
    let newWidth = startWidth
    let newHeight = startHeight
    
    // Calculate new dimensions based on which handle is being dragged
    switch (currentHandle) {
      case 'bottom-right':
        newWidth = Math.max(50, startWidth + dx)
        newHeight = Math.max(50, startHeight + dy)
        break
      case 'bottom-left':
        newWidth = Math.max(50, startWidth - dx)
        newHeight = Math.max(50, startHeight + dy)
        break
      case 'top-right':
        newWidth = Math.max(50, startWidth + dx)
        newHeight = Math.max(50, startHeight - dy)
        break
      case 'top-left':
        newWidth = Math.max(50, startWidth - dx)
        newHeight = Math.max(50, startHeight - dy)
        break
    }
    
    // Maintain aspect ratio if shift key is held
    if (e.shiftKey) {
      const aspectRatio = startWidth / startHeight
      if (Math.abs(dx) > Math.abs(dy)) {
        newHeight = newWidth / aspectRatio
      } else {
        newWidth = newHeight * aspectRatio
      }
    }
    
    // Apply new dimensions
    img.style.width = `${newWidth}px`
    img.style.height = 'auto'
    img.style.maxWidth = '100%'
  }

  const stopResize = () => {
    isResizing.value = false
    currentImg.value = null
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.userSelect = ''
    updateContent()
  }

  const addResizeHandles = (img: HTMLElement) => {
    // Remove any existing handles
    const existingContainer = img.closest('.image-container')
    if (existingContainer) {
      const existingHandles = existingContainer.querySelectorAll('.resize-handle')
      existingHandles?.forEach(handle => handle.remove())
    }
    
    // Create container for the image and handles
    const container = document.createElement('div')
    container.className = 'image-container'
    container.style.cssText = `
      position: relative;
      display: inline-block;
      max-width: 100%;
      margin: 0.5rem 0;
    `
    
    // Insert the container before the image and move the image into it
    img.parentNode?.insertBefore(container, img)
    container.appendChild(img)
    
    // Reset image styles
    img.style.display = 'block'
    img.style.margin = '0'
    
    // Create and append resize handles
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    positions.forEach(position => {
      const handle = createResizeHandle(position)
      container.appendChild(handle)
    })
    
    // Add click handler to select the image
    const handleClick = (e: Event) => {
      e.stopPropagation()
      // Remove selection from other images
      document.querySelectorAll('.image-container.selected').forEach(el => {
        el.classList.remove('selected')
        el.querySelectorAll('.resize-handle').forEach(handle => {
          (handle as HTMLElement).style.display = 'none'
        })
      })
      
      container.classList.add('selected')
      container.querySelectorAll('.resize-handle').forEach(handle => {
        (handle as HTMLElement).style.display = 'block'
      })
    }
    
    img.addEventListener('click', handleClick)
    container.addEventListener('click', handleClick)
    
    // Initially hide handles
    container.querySelectorAll('.resize-handle').forEach(handle => {
      (handle as HTMLElement).style.display = 'none'
    })
    
    // Handle delete key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && container.classList.contains('selected')) {
        container.remove()
        updateContent()
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return container
  }

  const insertImage = (src: string) => {
    if (!editor.value) return
    
    const img = document.createElement('img')
    img.src = src
    img.style.cssText = `
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      display: block;
    `
    
    // Get current selection or insert at the end
    const selection = window.getSelection()
    let range: Range
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      // If no selection, insert at the end of the editor
      range = document.createRange()
      range.selectNodeContents(editor.value)
      range.collapse(false)
    }
    
    // Ensure we're inserting into the editor
    if (!editor.value.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(editor.value)
      range.collapse(false)
    }
    
    // Insert image at cursor position
    range.deleteContents()
    range.insertNode(img)
    
    // Add resize handles
    const container = addResizeHandles(img)
    
    // Move cursor after the image container
    const newRange = document.createRange()
    newRange.setStartAfter(container)
    newRange.collapse(true)
    
    const newSelection = window.getSelection()
    if (newSelection) {
      newSelection.removeAllRanges()
      newSelection.addRange(newRange)
    }
    
    updateContent()
  }

  // Click outside to deselect images
  const handleDocumentClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.image-container')) {
      document.querySelectorAll('.image-container.selected').forEach(el => {
        el.classList.remove('selected')
        el.querySelectorAll('.resize-handle').forEach(handle => {
          (handle as HTMLElement).style.display = 'none'
        })
      })
    }
  }
  
  document.addEventListener('click', handleDocumentClick)
  
  // Cleanup event listeners on component unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('click', handleDocumentClick)
  })

  return {
    triggerImageUpload,
    showImageInput,
    imageUrl,
    insertImage
  }
}

// Export a factory function for creating editor-specific image upload triggers
export const createEditorImageUploadTrigger = () => ({
  openFile: ref(false),
})

// Register an editor's image upload trigger
export const registerEditorImageUpload = (editorId: string, trigger: { openFile: Ref<boolean> }) => {
  editorImageUploadRegistry.set(editorId, trigger)
}

// Get an editor's image upload trigger
export const getEditorImageUpload = (editorId: string) => {
  return editorImageUploadRegistry.get(editorId)
}

// Unregister an editor's image upload trigger
export const unregisterEditorImageUpload = (editorId: string) => {
  editorImageUploadRegistry.delete(editorId)
}
