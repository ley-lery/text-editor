import { ref, computed } from 'vue'
import { useEditorStoreFactory } from '../../stores/useEditorStoreFactory'

export function useEditorList(editor: any, updateContent: () => void, editorId: string) {
  const editorStore = useEditorStoreFactory(editorId)
  
  // List state
  const currentListType = ref<'none' | 'ul' | 'ol'>('none')
  const currentListStyle = ref<string>('disc')

  const formatList = (type: 'ul' | 'ol', style?: string) => {
    if (type === 'ul') {
      document.execCommand('insertUnorderedList')
      editorStore.setBulletList(style as any || 'disc')
    } else {
      document.execCommand('insertOrderedList')
      editorStore.setNumberList(style as any || 'decimal')
    }
    
    // Apply style class after a short delay to ensure the list is created
    setTimeout(() => {
      const selection = window.getSelection()
      if (selection && selection.anchorNode) {
        let el = selection.anchorNode as HTMLElement | null
        
        // Find the list element
        while (el && el.nodeName !== (type === 'ul' ? 'UL' : 'OL')) {
          el = el.parentElement
        }
        
        if (el && style) {
          // Remove existing list style classes
          el.classList.remove('list-disc', 'list-circle', 'list-square', 'list-decimal', 'list-lower-alpha', 'list-upper-alpha', 'list-lower-roman', 'list-upper-roman')
          // Add new style class
          el.classList.add(`list-${style}`)
        }
      }
      updateContent()
    }, 10)
  }

  const toggleBulletList = (style: 'disc' | 'circle' | 'square' = 'disc') => {
    const isCurrentlyList = document.queryCommandState('insertUnorderedList')
    
    if (isCurrentlyList && editorStore.bulletList === style) {
      // Remove list if same style is clicked
      document.execCommand('insertUnorderedList')
      editorStore.setBulletList('default')
      currentListType.value = 'none'
    } else {
      // Apply or change list style
      formatList('ul', style)
      currentListType.value = 'ul'
      currentListStyle.value = style
    }
  }

  const toggleNumberedList = (style: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman' = 'decimal') => {
    const isCurrentlyList = document.queryCommandState('insertOrderedList')
    
    if (isCurrentlyList && editorStore.numberList === style) {
      // Remove list if same style is clicked
      document.execCommand('insertOrderedList')
      editorStore.setNumberList('default')
      currentListType.value = 'none'
    } else {
      // Apply or change list style
      formatList('ol', style)
      currentListType.value = 'ol'
      currentListStyle.value = style
    }
  }

  const toggleBulletDisc = () => toggleBulletList('disc')
  const toggleBulletCircle = () => toggleBulletList('circle')
  const toggleBulletSquare = () => toggleBulletList('square')

  const toggleNumberDecimal = () => toggleNumberedList('decimal')
  const toggleNumberLowerAlpha = () => toggleNumberedList('lower-alpha')
  const toggleNumberUpperAlpha = () => toggleNumberedList('upper-alpha')
  const toggleNumberLowerRoman = () => toggleNumberedList('lower-roman')
  const toggleNumberUpperRoman = () => toggleNumberedList('upper-roman')

  // Computed properties for toolbar states
  const isUnorderedList = computed(() => document.queryCommandState('insertUnorderedList'))
  const isOrderedList = computed(() => document.queryCommandState('insertOrderedList'))

  // List options for dropdowns
  const bulletListOptions = computed(() => [
    { 
      label: 'Disc', 
      value: 'disc', 
      onClick: toggleBulletDisc,
      active: editorStore.bulletList === 'disc' && isUnorderedList.value
    },
    { 
      label: 'Circle', 
      value: 'circle', 
      onClick: toggleBulletCircle,
      active: editorStore.bulletList === 'circle' && isUnorderedList.value
    },
    { 
      label: 'Square', 
      value: 'square', 
      onClick: toggleBulletSquare,
      active: editorStore.bulletList === 'square' && isUnorderedList.value
    },
  ])

  const numberedListOptions = computed(() => [
    { 
      label: 'Numbers (1, 2, 3)', 
      value: 'decimal', 
      onClick: toggleNumberDecimal,
      active: editorStore.numberList === 'decimal' && isOrderedList.value
    },
    { 
      label: 'Letters (a, b, c)', 
      value: 'lower-alpha', 
      onClick: toggleNumberLowerAlpha,
      active: editorStore.numberList === 'lower-alpha' && isOrderedList.value
    },
    { 
      label: 'Letters (A, B, C)', 
      value: 'upper-alpha', 
      onClick: toggleNumberUpperAlpha,
      active: editorStore.numberList === 'upper-alpha' && isOrderedList.value
    },
    { 
      label: 'Roman (i, ii, iii)', 
      value: 'lower-roman', 
      onClick: toggleNumberLowerRoman,
      active: editorStore.numberList === 'lower-roman' && isOrderedList.value
    },
    { 
      label: 'Roman (I, II, III)', 
      value: 'upper-roman', 
      onClick: toggleNumberUpperRoman,
      active: editorStore.numberList === 'upper-roman' && isOrderedList.value
    },
  ])

  return {
    // Functions
    formatList,
    toggleBulletList,
    toggleNumberedList,
    toggleBulletDisc,
    toggleBulletCircle,
    toggleBulletSquare,
    toggleNumberDecimal,
    toggleNumberLowerAlpha,
    toggleNumberUpperAlpha,
    toggleNumberLowerRoman,
    toggleNumberUpperRoman,
    
    // State
    currentListType,
    currentListStyle,
    
    // Computed
    isUnorderedList,
    isOrderedList,
    bulletListOptions,
    numberedListOptions,
  }
}
