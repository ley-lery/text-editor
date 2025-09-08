<template>
  <nav 
    class="flex flex-col gap-2 p-2 bg-white dark:bg-black"
    :class="isMenusOpen ? 'h-[6.2rem] rounded-3xl duration-300' : 'h-12 rounded-3xl duration-300'"
  >
    <div class="flex items-center justify-between w-full h-fit">
      <div class="flex items-center gap-2">
        <!-- Undo/Redo -->
        <div class="flex items-center gap-1">
          <ButtonIcon @click="undo" :isDisabled="!canUndo"><Undo /></ButtonIcon>
          <ButtonIcon @click="redo" :isDisabled="!canRedo"><Redo /></ButtonIcon>
        </div>

        <!-- Text Formatting -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="(btn, index) in textActions"
            :key="index"
            :is-active="btn.isActive"
            @click="btn.onClick"
          > 
            <component :is="btn.icon" />
          </ButtonIcon>
        </div>

        <!-- Font/Color Controls -->
        <div 
          class="flex items-center gap-2"
        >
          <FontSize :editorId="props.editorId" />
          <FontFamily :editorId="props.editorId" />
          <Keyword :editorId="props.editorId" />
          <ColorPicker :editorId="props.editorId" />
          <Popover :options="capitalizeActions">
            <button
              :class="capitalizeActions.find(action => action.value === editorStore.capitalize)?.value"
              class="px-2 py-1 rounded cursor-pointer text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-200 font-medium text-base focus:outline-none"
            >
              Aa
            </button>
          </Popover>
        </div>

        <!-- Text Alignment -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="(align, index) in textAlignActions"
            :key="index"
            :is-active="align.isActive"
            @click="align.onClick"
          >
            <component :is="align.icon" />
          </ButtonIcon>
        </div>

        <!-- Bullet List -->
        <div class="flex items-center gap-1">
          <ButtonIcon
            v-for="(bullet, index) in bulletList"
            :key="index"
            :is-active="bullet.isActive"
            @click="bullet.onClick"
          >
            <component :is="bullet.icon" />
          </ButtonIcon>
        </div>

        <!-- Table and Image Buttons -->
        <div class="flex items-center gap-1">
          <ButtonIcon @click="showTableGrid.showTableGrid.value = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621.504 1.125 1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125-1.125-1.125m0 0h7.5" />
            </svg>
          </ButtonIcon>

          <ButtonIcon @click="uploadImage.openFile.value = true">
              <Image /> 
            </ButtonIcon>
        </div>
      </div>

      <!-- Menu Toggle Button -->
      <div>
        <ButtonIcon :is-active="isMenusOpen" @click="toggleMenu">
          <ChevronDown class="size-7 transition-all duration-300 " :class="isMenusOpen ? 'rotate-180' : ''"/>
        </ButtonIcon>
      </div>
    </div>

    
    <!-- Animated Divider -->
    <motion.div 
      class="w-full border-t border-zinc-100 dark:border-zinc-800 flex"
      :initial="{ scale: 0 }"
      :animate="{ scale: 1 }"
      :transition="{ delay: 0.7, duration: 0.5, ease: 'easeOut' }"
      style="transform-origin: left"
      v-if="isMenusOpen"
    />
    <!-- Expanded Menu Section -->
    <AnimatePresence>
      <motion.div
        v-if="isMenusOpen"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        class="flex items-center justify-between w-full h-fit overflow-hidden"
      >
        <div class="flex items-center gap-2">
          <ButtonIcon @click="toggleMinimize">
            <Expand v-if="minimize" class="size-7 transition-all duration-300 "/>
            <Minimize v-else class="size-7 transition-all duration-300 "/>
          </ButtonIcon>
        </div>
        
        <ThemeSwitcher />
      </motion.div>
    </AnimatePresence>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import ButtonIcon from '../ui/ButtonIcon.vue'
import { Bold, Italic, Underline, Strikethrough, Undo, Redo, AlignCenter, AlignLeft, AlignRight, AlignJustify, Disc, Circle, Square, Image, CaseUpper, Menu, ChevronDown, Expand, Minimize } from 'lucide-vue-next'
import { useEditorStoreFactory } from '../../stores/index'
import FontSize from '../ui/FontSize.vue'
import FontFamily from '../ui/FontFamily.vue'
import ColorPicker from '../ui/ColorPicker.vue'
import ThemeSwitcher from '../themes/ThemeSwitcher.vue'
import Popover from '../ui/Popover.vue'
import Keyword from '../ui/Keyword.vue'
import { showTableGrid } from '../composables/useEditorTable'
import { uploadImage } from '../composables/useEditorImage'
import { AnimatePresence, motion } from 'motion-v'
import { useMiminize } from '../../hooks/useMiminize'

const { minimize, toggleMinimize } = useMiminize()

const props = defineProps<{ editorId: string }>()
const editorStore = useEditorStoreFactory(props.editorId)

// Menu state with smooth toggle
const isMenusOpen = ref<boolean>(false)

const toggleMenu = () => {
  isMenusOpen.value = !isMenusOpen.value
}

// ====== Undo / Redo ======
const canUndo = computed(() => editorStore.historyIndex > 0)
const canRedo = computed(() => editorStore.historyIndex < editorStore.history.length - 1)
const undo = () => editorStore.undo()
const redo = () => editorStore.redo()

// ====== Helper to toggle a value ======
const toggleValue = (current: string, active: string, inactive = 'normal') => current === active ? inactive : active

// ====== Text formatting actions ======
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
    icon: null, 
    value: 'none', 
    onClick: () => editorStore.setCapitalize('none')
  },
  { 
    label: 'Capitalize', 
    icon: 'Aa',
    value: 'capitalize',
    onClick: () => editorStore.setCapitalize('capitalize')
  },
  { 
    label: 'Uppercase', 
    icon: 'AA',
    value: 'uppercase',
    onClick: () => editorStore.setCapitalize('uppercase')
  },
  { 
    label: 'Lowercase', 
    icon: 'aa',
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
