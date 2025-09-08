<template>
  <nav class="flex flex-wrap items-center gap-4 p-2 bg-white dark:bg-black rounded-full">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <!-- Undo/Redo -->
        <div class="flex items-center gap-1">
          <ButtonIcon @click="undo" :isDisabled="!canUndo"><Undo /></ButtonIcon>
          <ButtonIcon @click="redo" :isDisabled="!canRedo"><Redo /></ButtonIcon>
        </div>

        <!-- Text Formatting -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="btn in textActions"
            :key="btn.label"
            :is-active="btn.isActive"
            @click="btn.onClick"
          >
            <component :is="btn.icon" />
          </ButtonIcon>
        </div>

        <!-- Font/Color -->
        <FontSize :editorId="props.editorId" />
        <FontFamily :editorId="props.editorId" />
        <ColorPicker :editorId="props.editorId" />
        <Popover :options="capitalizeActions" >
          <button
            :class="capitalizeActions.find(action => action.value === editorStore.capitalize)?.value"
            class="px-2 py-1 rounded cursor-pointer text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-200 font-medium text-base focus:outline-none">
            Aa
          </button>
        </Popover>
        <!-- Text Alignment -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="align in textAlignActions"
            :key="align.label"
            :is-active="align.isActive"
            @click="align.onClick"
          >
            <component :is="align.icon" />
          </ButtonIcon>
        </div>

        <!-- Bullet List -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="bullet in bulletList"
            :key="bullet.label"
            :is-active="bullet.isActive"
            @click="bullet.onClick"
          >
            <component :is="bullet.icon" />
          </ButtonIcon>
        </div>
        <!-- <ButtonIcon @click="onOpen">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
        </ButtonIcon> -->
      </div>
      <!-- Theme Switcher -->
      <ThemeSwitcher />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import ButtonIcon from '../ui/ButtonIcon.vue'
import { Bold, Italic, Underline, Strikethrough, Undo, Redo, AlignCenter, AlignLeft, AlignRight, AlignJustify, Disc, Circle, Square } from 'lucide-vue-next'
import { useEditorStoreFactory } from '../../stores/index'
import FontSize from '../ui/FontSize.vue'
import FontFamily from '../ui/FontFamily.vue'
import ColorPicker from '../ui/ColorPicker.vue'
import ThemeSwitcher from '../themes/ThemeSwitcher.vue'
import Popover from '../ui/Popover.vue'

const props = defineProps<{ editorId: string }>()
const editorStore = useEditorStoreFactory(props.editorId)
// Undo / Redo
const canUndo = computed(() => editorStore.historyIndex > 0)
const canRedo = computed(() => editorStore.historyIndex < editorStore.history.length - 1)
const undo = () => editorStore.undo()
const redo = () => editorStore.redo()

// Helper to toggle a value
const toggleValue = (current: string, active: string, inactive = 'normal') => current === active ? inactive : active

// Text formatting actions
const textActions = computed(() => [
  {
    label: 'Bold',
    icon: Bold,
    isActive: editorStore.fontWeight === 'bold',
    onClick: () => editorStore.setFontWeight(toggleValue(editorStore.fontWeight, 'bold')),
  },
  {
    label: 'Italic',
    icon: Italic,
    isActive: editorStore.fontStyle === 'italic',
    onClick: () => editorStore.setFontStyle(toggleValue(editorStore.fontStyle, 'italic')),
  },
  {
    label: 'Underline',
    icon: Underline,
    isActive: editorStore.textDecoration === 'underline',
    onClick: () => editorStore.setTextDecoration(toggleValue(editorStore.textDecoration, 'underline', 'none')),
  },
  {
    label: 'Strikethrough',
    icon: Strikethrough,
    isActive: editorStore.textDecoration === 'line-through',
    onClick: () => editorStore.setTextDecoration(toggleValue(editorStore.textDecoration, 'line-through', 'none')),
  },
])

// Text alignment actions
const textAlignActions = computed(() => [
  { label: 'Left', icon: AlignLeft, isActive: editorStore.textAlign === 'left', onClick: () => editorStore.setTextAlign('left') },
  { label: 'Center', icon: AlignCenter, isActive: editorStore.textAlign === 'center', onClick: () => editorStore.setTextAlign('center') },
  { label: 'Right', icon: AlignRight, isActive: editorStore.textAlign === 'right', onClick: () => editorStore.setTextAlign('right') },
  { label: 'Justify', icon: AlignJustify, isActive: editorStore.textAlign === 'justify', onClick: () => editorStore.setTextAlign('justify') },
])

const capitalizeActions = computed(() => [
  { 
    label: 'None', 
    value: 'none', 
    onClick: () => editorStore.setCapitalize('none')
  },
  { 
    label: 'Capitalize', 
    value: 'capitalize',
    onClick: () => editorStore.setCapitalize('capitalize')
  },
  { 
    label: 'Uppercase', 
    value: 'uppercase',
    onClick: () => editorStore.setCapitalize('uppercase')
  },
  { 
    label: 'Lowercase', 
    value: 'lowercase',
    onClick: () => editorStore.setCapitalize('lowercase')
  },
])

const formatList = (type: 'ul'|'ol', style?: string) => {
  if (type === 'ul') {
    document.execCommand('insertUnorderedList')
  } else {
    document.execCommand('insertOrderedList')
  }
  nextTick(() => {
    const selection = window.getSelection()
    if (selection && selection.anchorNode) {
      let el = selection.anchorNode as HTMLElement | null
      while (el && el.nodeName !== (type === 'ul' ? 'UL' : 'OL')) {
        el = el.parentElement
      }
      if (el && style) {
        el.classList.add(`list-${style}`)
      }
    }
    // updateTextFromEditor()
  })
}

const toggleBulletDisc = () => {
  if (editorStore.bulletList === 'disc') {
    editorStore.setBulletList('default')
    document.execCommand('insertUnorderedList')
  } else {
    editorStore.setBulletList('disc')
    formatList('ul', 'disc')
  }
}
const toggleBulletCircle = () => {
  if (editorStore.bulletList === 'circle') {
    editorStore.setBulletList('default')
    document.execCommand('insertUnorderedList')
  } else {
    editorStore.setBulletList('circle')
    formatList('ul', 'circle')
  }
}
const toggleBulletSquare = () => {
  if (editorStore.bulletList === 'square') {
    editorStore.setBulletList('default')
    document.execCommand('insertUnorderedList')
  } else {
    editorStore.setBulletList('square')
    formatList('ul', 'square')
  }
}

const bulletList = [
  { label: 'Disc', icon: Disc, isActive: editorStore.bulletList === 'disc', onClick: toggleBulletDisc },
  { label: 'Circle', icon: Circle, isActive: editorStore.bulletList === 'circle', onClick: toggleBulletCircle },
  { label: 'Square', icon: Square, isActive: editorStore.bulletList === 'square', onClick: toggleBulletSquare },
]

</script>
