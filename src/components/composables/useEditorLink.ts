import { ref, nextTick } from 'vue'

export function useEditorLink(editor: any, updateContent: () => void) {
  const showLinkInput = ref(false)
  const linkUrl = ref('')
  const savedRange = ref<Range | null>(null)

  const toggleLink = () => {
    showLinkInput.value = !showLinkInput.value
    if (showLinkInput.value) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        savedRange.value = selection.getRangeAt(0)

        // If selection already inside a link → prefill input
        const existingLink = getLink()
        if (existingLink) {
          linkUrl.value = existingLink
        } else {
          linkUrl.value = ''
        }
      }
      nextTick(() => {
        const input = document.getElementById('editor-link-input') as HTMLInputElement
        if (input) input.focus()
      })
    }
  }

  const applyLink = () => {
    if (linkUrl.value && linkUrl.value.trim() !== '') {
      let url = linkUrl.value.trim()
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
      }

      const selection = window.getSelection()
      if (savedRange.value && selection) {
        selection.removeAllRanges()
        selection.addRange(savedRange.value)
      }

      document.execCommand('createLink', false, url)

      const anchors = editor.value?.getElementsByTagName('a')
      if (anchors && anchors.length > 0) {
        const linkEl = anchors[anchors.length - 1]
        linkEl.style.color = '#2563eb'
        linkEl.style.textDecoration = 'underline'
        linkEl.style.cursor = 'pointer'
        linkEl.setAttribute('target', '_blank')
        linkEl.setAttribute('rel', 'noopener noreferrer')
      }

      updateContent()
    }
    showLinkInput.value = false
  }

  const removeLink = () => {
    const selection = window.getSelection()
    if (savedRange.value && selection) {
      selection.removeAllRanges()
      selection.addRange(savedRange.value)
    }
    document.execCommand('unlink') // built-in unlink command
    updateContent()
  }

  const getLink = (): string | null => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    let container: HTMLElement | null = range.commonAncestorContainer as HTMLElement

    if (container.nodeType === 3) {
      container = container.parentElement
    }

    const link = container?.closest('a')
    return link ? link.getAttribute('href') : null
  }

  const handleLinkInputKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyLink()
    } else if (e.key === 'Escape') {
      showLinkInput.value = false
    }
  }

  const handleLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'A') {
      e.preventDefault()
      const href = (target as HTMLAnchorElement).href
      if (href) {
        window.open(href, '_blank') // open in new tab
      }
    }
  }

  return {
    showLinkInput,
    linkUrl,
    toggleLink,
    applyLink,
    removeLink,
    getLink,
    handleLinkInputKeydown,
    handleLinkClick,
  }
}
