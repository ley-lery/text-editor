<template>
    <div class="relative w-full p-2 rounded-3xl bg-white/90 dark:bg-black/70 overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 z-0 opacity-15 pointer-events-none" :style="gradientStyle" />
  
      <!-- Editable area -->
      <div
        ref="editor"
        contenteditable="true"
        :placeholder="placeholderText"
        :style="editorStyle"
        :class="editorClasses"
        class="max-h-[30rem] overflow-auto has-scrollbar text-zinc-700 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-700 selection:rounded-xl relative z-10"
        @input="updateContent"
        @mouseup="handleSelection"
        @keyup="handleSelection"
        @click="handleLinkClick"
        spellcheck="true"
        aria-label="Rich text editor"
      />
      <!-- Placeholder -->
      <span
        v-if="!content"
        class="absolute top-4 left-4 right-4 text-zinc-400 pointer-events-none select-none w-full"
        :style="placeholderStyle"
      >
        {{ placeholderText }}
      </span>
  
      <!-- Overlay -->
      <div v-if="isOpen" @click="isOpen = false" class="absolute inset-0 z-10 opacity-35" />
  
      <!-- Toolbar -->
      <AnimatePresence :initial="false">
        <motion.div
          v-if="isOpen"
          ref="toolbar"
          :style="toolbarStyle"
          :class="toolbarClasses"
          :initial="motionInitial"
          :animate="motionAnimate"
          :exit="motionExit"
          :transition="motionTransition"
          tabindex="-1"
        >
          <div class="relative">
            <div
              class="absolute left-2 bottom-full translate-y-0 transform  w-3 h-3 rotate-45 bg-white dark:bg-black"
            />
            <div class="flex items-center gap-1 relative z-[1]">
              <ButtonIcon
                v-for="btn in toolbarButtons"
                :key="btn.label"
                :isActive="btn.active"
                @mousedown.prevent.stop="btn.action"
                radius="lg"
                :title="btn.label"
              >
                <component :is="btn.icon" />
              </ButtonIcon>
              <!-- Table Button -->
              <ButtonIcon
                :isActive="false"
                @mousedown.prevent.stop="openTableModal"
                radius="lg"
                title="Insert Table"
              >
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </ButtonIcon>
              <!-- Background Color Picker -->
              <label title="Background Color">
                <input type="color" @input="e => applyBackgroundColor((e.target as HTMLInputElement).value)" class="w-6 h-6" />
              </label>
              <!-- Text Color Picker -->
              <label title="Text Color">
                <input type="color" @input="e => applyTextColor((e.target as HTMLInputElement).value)" class="w-6 h-6" />
              </label>
            </div>
            <!-- Link Input -->
            <transition name="slide-fade" class="mt-2">
              <input
                v-if="showLinkInput"
                id="editor-link-input"
                v-model="linkUrl"
                type="text"
                placeholder="Enter link"
                @blur="showLinkInput = false"
                @keydown="handleLinkInputKeydown"
                @keydown.enter="applyLink()"
                @keydown.esc="showLinkInput = false"
                class="w-full py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 outline-none text-sm"
              />
            </transition>
          </div>
        </motion.div>
      </AnimatePresence>
  
      <!-- Table Modal -->
      <AnimatePresence :initial="false">
        <motion.div
          v-if="isTableModalOpen"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="fixed inset-0 bg-black/10 dark:bg-black/80 flex items-center justify-center z-10 w-full h-full"
          @click="isTableModalOpen = false"
        />
        <motion.div
          v-if="isTableModalOpen"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="fixed inset-0 flex items-center justify-center z-20"
          @click="closeTableModal"
        >
          <!-- Grid Selector -->
          <div class="mb-4">
            <motion.div
              v-if="isTableModalOpen"
              :initial="{ opacity: 0, height: 0 }"
              :animate="{ opacity: 1, height: 310 }"
              :exit="{ opacity: 0, height: 0 }"
              :transition="{ delay: 0.2, type: 'spring', damping: 15, stiffness: 100 }"
              class="overflow-hidden shadow-sm shadow-zinc-200/50 dark:shadow-zinc-900/50 
                border border-white dark:border-zinc-800 bg-white/50 dark:bg-zinc-300/10 
                backdrop-blur-sm rounded-3xl flex items-center justify-center px-4 relative"
            >
              <div :style="gradientStyle" class="w-full h-full absolute top-0 left-0 opacity-30 dark:opacity-0 blur-sm pointer-events-none"/>
              <motion.div
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ delay: 0.5, duration: 0.4 }"
                class="grid gap-1"
                :style="gridStyle"
              >
                <motion.div
                  v-for="(cell, index) in gridCells"
                  :key="index"
                  class="w-6 h-6 rounded-lg cursor-pointer transition-colors"
                  :class="{
                    'bg-blue-500': isGridCellSelected(index),
                    'hover:bg-zinc-200 bg-zinc-800/10 dark:bg-zinc-100/10': !isGridCellSelected(index)
                  }"
                  :initial="{ opacity: 0, scale: isGridCellSelected(index) ? 1 : 0.8 }"
                  :animate="{ opacity: 1, scale: isGridCellSelected(index) ? 1 : 0.8 }"
                  :exit="{ opacity: 0, scale: isGridCellSelected(index) ? 1 : 0.8 }"
                  @mouseover="highlightGrid(index)"
                  @click="selectGrid(index)"
                />
              </motion.div>
            </motion.div>
            <!-- Size Display -->
            <motion.div
              :initial="{ opacity: 1, scale: 0 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 1, scale: 0 }"
              :transition="{ delay: .5 }"
              class="flex items-center justify-center gap-2 mt-4"
            >
              <div class="text-center text-sm shadow-sm shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-white dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-300/10 backdrop-blur-xs rounded-3xl py-1 px-4 w-fit">
                {{ selectedRows }}×{{ selectedCols }}
              </div>
            </motion.div>
            
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence :initial="false">
        <motion.div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            v-if="showMergePopover"
            class="*:dark:bg-zinc-800 *:bg-white *:hover:bg-zinc-200 *:dark:hover:bg-zinc-700 *:text-left *:cursor-pointer *:px-3 *:py-1 *:rounded-full *:text-sm *:text-zinc-700 *:dark:text-zinc-200 bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-3xl p-2 w-fit absolute flex flex-col gap-2 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
            <button @click="mergeCells" class="flex items-center gap-2">
              <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Merge Cells
            </button>
            <button @click="clearCellSelection" class="flex items-center gap-2">
              <X class="size-4"/>
              Cancel
            </button>
            <button @click="addColumnLeft" class="flex items-center gap-2">
              <Plus class="size-4"/>
              Add Column Left
            </button>
            <button @click="addColumnRight" class="flex items-center gap-2">
              <Plus class="size-4"/>
              Add Column Right
            </button>
            <button @click="addRowAbove" class="flex items-center gap-2">
              <Plus class="size-4"/>
              Add Row Above
            </button>
            <button @click="addRowBelow" class="flex items-center gap-2">
              <Plus class="size-4"/>
              Add Row Below
            </button>
            <button @click="deleteColumn" class="flex items-center gap-2">
              <X class="size-4"/>
              Delete Column
            </button>
            <button @click="deleteRow" class="flex items-center gap-2">
              <X class="size-4"/>
              Delete Row
            </button>
            <button @click="deleteSelectedCells" class="flex items-center gap-2">
              <X class="size-4"/>
              Delete Selected Cells
            </button>
        </motion.div>
    </AnimatePresence>
     
    </div>
    <!-- <TableGrid
        :editor="editor"
        :update-content="updateContent"
        :is-open="isTableModalOpen"
        :on-open="openTableModal"
        :on-close="closeTableModal"
    /> -->
  </template>
  
  <script setup lang="ts">
  import { cn } from '../../lib/utils'
  import { useEditorStoreFactory } from '../../stores/index'
  import { computed, onMounted, ref, watch } from 'vue'
  import { motion, AnimatePresence } from 'motion-v'
  import { Bold, Italic, Link, Plus, Strikethrough, Underline, X } from 'lucide-vue-next'
  import ButtonIcon from '../ui/ButtonIcon.vue'
  import { useEditorCommands, useEditorLink, useEditorSelection, useEditorTable } from '../composables'
  import { useDisclosure } from '../../hooks/useDisclosure'
  import TableGrid from './TableGrid.vue'
  // ===== Props / Emits =====
  const props = defineProps<{ 
    editorId: string
    placeholder?: string
    modelValue?: string
  }>()
  
  const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>()
  
  // ===== State =====
  const isOpen = ref(false)
  const toolbarStyle = ref({})
  const editor = ref<HTMLElement | null>(null)
  const content = ref('')
  const editorStore = useEditorStoreFactory(props.editorId)
  const { isOpen: isTableModalOpen, onOpen: openTableModal, onClose: closeTableModal } = useDisclosure()  
  // ===== Computed =====
  const placeholderText = computed(() => props.placeholder || 'Start typing your document here…')
  const placeholderStyle = computed(() => ({
    fontSize: editorStore.fontSize ? `${editorStore.fontSize}px` : undefined,
    fontWeight: editorStore.fontWeight,
    fontFamily: editorStore.fontFamily,
    textAlign: editorStore.textAlign,
  }))
  
  const editorStyle = computed(() => ({
    fontSize: `${editorStore.fontSize}px`,
    fontWeight: editorStore.fontWeight,
    fontStyle: editorStore.fontStyle,
    textDecoration: editorStore.textDecoration,
    color: editorStore.textColor,
    fontFamily: editorStore.fontFamily,
    textAlign: editorStore.textAlign,
    listStyleType: editorStore.bulletList,
    textTransform: editorStore.capitalize,
  }))
  
  const editorClasses = computed(() =>
    cn('w-full h-[40rem] p-2 rounded-2xl focus:outline-none resize-none', {
      italic: editorStore.fontStyle === 'italic',
      underline: editorStore.textDecoration === 'underline',
      'line-through': editorStore.textDecoration === 'line-through',
    })
  )
  
  const toolbarClasses = 'absolute z-10 bg-white dark:bg-black rounded-2xl shadow-lg p-2 max-h-60 w-fit translate-y-2'
  
  const gradientStyle: any = {
    background: `
      radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
      radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
      radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
      radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
      linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
    `,
    pointerEvents: "none"
  }
  
  // ===== Motion =====
  const motionInitial = { opacity: 0, scale: 0 }
  const motionAnimate = computed(() => ({
    opacity: 1,
    scale: 1,
    height: showLinkInput.value ? '5.3rem' : '3rem',
  }))
  const motionExit = { opacity: 0, scale: 0 }
  const motionTransition = { duration: 0.2, ease: 'easeInOut' as const }
  
  // ===== Lifecycle =====
  function updateContent() {
    if (editor.value) content.value = editor.value.innerHTML
  }
  
  // ===== Composables =====
  const { handleSelection, applyBackgroundColor, applyTextColor } = useEditorSelection(editor, isOpen, toolbarStyle, content)
  const { exec } = useEditorCommands(editor, updateContent)
  const { showLinkInput, linkUrl, toggleLink, applyLink, handleLinkInputKeydown, handleLinkClick, removeLink, getLink } = useEditorLink(editor, updateContent)
  
  // Table composable
  const {
    selectedRows,
    selectedCols,
    gridCells,
    gridStyle,
    isGridCellSelected,
    highlightGrid,
    selectGrid,
    mergeCells,
    clearCellSelection,
    showMergePopover,
    mergePopoverPosition,
    addColumnLeft,
    addColumnRight,
    addRowAbove,
    addRowBelow,
    deleteColumn,
    deleteRow,
    deleteSelectedCells,
  } = useEditorTable(editor, updateContent)
  
  // ===== Sync parent ↔ local =====
  watch(() => props.modelValue, (val) => {
    if (val !== content.value) {
      content.value = val || ''
      if (editor.value && editor.value.innerHTML !== content.value) {
        editor.value.innerHTML = content.value
      }
    }
  }, { immediate: true })
  
  watch(content, (val) => {
    emit('update:modelValue', val)
    editorStore.updateModelValue(val)
  })
  
  // ===== Toolbar Actions =====
  const toolbarButtons = computed(() => {
    const currentLink = getLink()
    return [
      { label: 'Bold', icon: Bold, action: () => exec('bold'), active: editorStore.fontWeight === 'bold' },
      { label: 'Italic', icon: Italic, action: () => exec('italic'), active: editorStore.fontStyle === 'italic' },
      { label: 'Underline', icon: Underline, action: () => exec('underline'), active: editorStore.textDecoration === 'underline' },
      { label: 'Strike', icon: Strikethrough, action: () => exec('strikeThrough'), active: editorStore.textDecoration === 'line-through' },
      {
        label: 'Link',
        icon: Link,
        action: () => {
          if (currentLink) {
            removeLink()
          } else {
            toggleLink()
          }
        },
        active: !!currentLink
      },
    ]
  })
  
  onMounted(() => {
    if (editor.value) {
      editor.value.innerHTML = content.value
      editor.value.focus()
    }
  })
  </script>
  
  <style scoped>
  /* Table styles for better appearance */
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;
  }
  
  :deep(table td) {
    border: 1px solid #cbcfd4;
    padding: 8px;
    min-width: 100px;
    min-height: 30px;
    vertical-align: top;
    position: relative;
    background-color: #00000010;
  }
  .dark :deep(table td) {
    border-color: #ffffff;
    background-color: #ffffff10;
  }
  
  :deep(table td:focus) {
    outline: 2px solid #3b82f6;
    outline-offset: -1px;
  }
  
  /* Selected cell styles */
  :deep(table td.selected-cell) {
    background-color: rgba(59, 130, 246, 0.1);
    outline: 2px solid #3b82f6;
    outline-offset: -1px;
  }
  
  .dark :deep(table td.selected-cell) {
    background-color: rgba(59, 130, 246, 0.2);
  }
  
  /* Input in cell styles */
  :deep(.cell-input) {
    border: none !important;
    background: transparent !important;
    width: 100% !important;
    padding: 2px !important;
    outline: none !important;
    font-family: inherit;
    font-size: inherit;
  }
  
  /* Merged cell styles */
  :deep(table td[colspan]) {
    text-align: center;
  }
  :deep(table td[rowspan]) {
    vertical-align: middle;
  }

  .td-preview {
    padding: 5px;
  }
  /* Transition for slide-fade */
  .slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.2s ease;
  }
  .slide-fade-enter-from, .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  </style>