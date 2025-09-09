import { computed } from 'vue'
import { Bold, Italic, Underline, Strikethrough, List, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-vue-next'
import type { Ref } from 'vue'

// Types for toolbar button
export interface ToolbarButton {
  label: string
  icon: any
  action: () => void
  active: boolean
}

// Hook for formatting buttons (bold, italic, etc.)
export function useFormattingButtons(
  exec: (command: string) => void,
  toggleBulletDisc: () => void,
  toggleLink: () => void,
  isUnorderedList: Ref<boolean>,
  getLink: () => string | null
) {
  const toolbarButtons = computed((): ToolbarButton[] => {
    const currentLink = getLink()
    
    return [
      {
        label: 'Bold',
        icon: Bold,
        action: () => exec('bold'),
        active: document.queryCommandState('bold')
      },
      {
        label: 'Italic',
        icon: Italic,
        action: () => exec('italic'),
        active: document.queryCommandState('italic')
      },
      {
        label: 'Underline',
        icon: Underline,
        action: () => exec('underline'),
        active: document.queryCommandState('underline')
      },
      {
        label: 'Strikethrough',
        icon: Strikethrough,
        action: () => exec('strikeThrough'),
        active: document.queryCommandState('strikeThrough')
      },
      {
        label: 'Bullet List',
        icon: List,
        action: () => toggleBulletDisc(),
        active: isUnorderedList.value
      },
      {
        label: 'Link',
        icon: Link,
        action: () => toggleLink(),
        active: !!currentLink
      },
    ]
  })

  return { toolbarButtons }
}

// Hook for text alignment buttons
export function useTextAlignmentButtons(
  applyTextAlignment: (alignment: string) => void,
  currentTextAlign: Ref<string>
) {
  const textAlignButtons = computed((): ToolbarButton[] => [
    {
      label: 'Align Left',
      icon: AlignLeft,
      action: () => applyTextAlignment('left'),
      active: currentTextAlign.value === 'left'
    },
    {
      label: 'Align Center',
      icon: AlignCenter,
      action: () => applyTextAlignment('center'),
      active: currentTextAlign.value === 'center'
    },
    {
      label: 'Align Right',
      icon: AlignRight,
      action: () => applyTextAlignment('right'),
      active: currentTextAlign.value === 'right'
    },
    {
      label: 'Align Justify',
      icon: AlignJustify,
      action: () => applyTextAlignment('justify'),
      active: currentTextAlign.value === 'justify'
    }
  ])

  return { textAlignButtons }
}

// Hook for line height options
export function useLineHeightOptions() {
  const lineHeightOptions = [
    { label: 'Line Height', value: '', disabled: true },
    { label: 'Normal', value: 'normal' },
    { label: 'Tight (1.25)', value: 'tight' },
    { label: 'Snug (1.375)', value: 'snug' },
    { label: 'Relaxed (1.625)', value: 'relaxed' },
    { label: 'Loose (2)', value: 'loose' }
  ]

  return { lineHeightOptions }
}
