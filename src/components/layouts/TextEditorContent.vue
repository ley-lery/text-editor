<template>
  <div class="relative w-full p-2 rounded-3xl bg-white/90 dark:bg-black/70 overflow-hidden h-full">
    <!-- Background gradient -->
    <div class="absolute inset-0 z-0 opacity-15 pointer-events-none" :style="gradientStyle" />

    <!-- Editable area -->
    <div
      ref="editor"
      contenteditable="true"
      :placeholder="placeholderText"
      :style="editorStyle"
      :class="editorClasses"
      class="min-h-full overflow-auto has-scrollbar text-zinc-700 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-700 selection:rounded-xl relative z-10"
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

    <!-- Style and Merge Popover -->
    <Modal 
      :isOpen="showMergePopover || showStylePopover"
      :onClose="onCloseMerge"
      :layouts="{ height: 450 }"
      :hideOverlay="true"
      class="flex gap-4 items-center"
      blur-size="sm"
    >
      <!-- Style Menus -->
      <motion.div
          :initial="{ opacity: 0, scale: 0.8 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.8 }"
          :transition="{ duration: 0.2, ease: 'easeOut' }"
          v-if="showStylePopover"
          @click.stop
          class="m-4"
          
      >
        <div class="space-y-4 h-96 overflow-auto scrollbar-none pr-4">
          <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cell Styling</div>
          
          <!-- Background Colors -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Background Color</div>
            <div class="grid grid-cols-6 gap-2">
              <div 
                v-for="color in availableBackgroundColors"
                :key="color.value"
                @click="setCellBackgroundColor(color.value)"
                class="w-8 h-8 rounded-xl cursor-pointer border-none hover:border-blue-400 transition-colors flex items-center justify-center"
                :style="{ backgroundColor: color.value === 'transparent' ? '#ffffff' : color.value }"
                :title="color.name"
              >
                <div v-if="color.value === 'transparent'" class="text-zinc-400 text-xs">
                  <X class="size-4"/>
                </div>
                <div v-else>
                  <motion.span 
                    :initial="color.value === cellBackgroundColor ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
                    :animate="color.value === cellBackgroundColor ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
                    :transition="{ type: 'spring', stiffness: 100, damping: 10 }"
                    class="text-xs text-zinc-500"
                  >
                    <Check class="size-4" />
                  </motion.span>
                </div>
              </div>
            </div>
          </div>

          
          <!-- Text Colors -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Text Color</div>
            <div class="grid grid-cols-6 gap-2">
              <div 
                v-for="color in availableTextColors"
                :key="color.value"
                @click="setCellTextColor(color.value)"
                class="w-8 h-8 rounded-xl cursor-pointer  hover:border-blue-400 transition-colors flex items-center justify-center"
                :style="{ backgroundColor: color.value === 'transparent' ? '#ffffff' : color.value }"
                :title="color.name"
              >
                <div v-if="color.value === 'transparent'" class="text-zinc-400 text-xs">
                  <X class="size-4"/>
                </div>
                <div v-else>
                  <motion.span 
                    :initial="color.value === cellTextColor ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
                    :animate="color.value === cellTextColor ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
                    :transition="{ type: 'spring', stiffness: 100, damping: 10 }"
                    class="text-xs text-zinc-500"
                  >
                    <Check class="size-4" />
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Text Alignment -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Text Alignment</div>
            <div class="flex gap-1">
              <ButtonIcon 
                v-for="btn in cellTextAlign"
                :key="btn.label"
                @click="btn.action"
                radius="lg"
                :isActive="btn.active"
                title="Text Align"
              >
                <component :is="btn.icon" />
              </ButtonIcon>
            </div>
          </div>

          <!-- Vertical Alignment -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Vertical Alignment</div>
            <div class="flex gap-1">
              <ButtonIcon 
                v-for="btn in cellVerticalAlign"
                :key="btn.label"
                @click="btn.action"
                radius="lg"
                :isActive="btn.active"
                title="Vertical Align"
              >
                <component :is="btn.icon" />
              </ButtonIcon>
            </div>
          </div>

          <!-- Text Formatting -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Text Formatting</div>
            <div class="flex gap-1">
              <ButtonIcon 
                @click="setCellBold(fontWeight !== 'bold')"
                radius="lg"
                :isActive="fontWeight === 'bold'"
                title="Bold"
              >
                <Bold />
              </ButtonIcon>
              <ButtonIcon 
                @click="setCellItalic(fontStyle !== 'italic')"
                radius="lg"
                :isActive="fontStyle === 'italic'"
                title="Italic"
              >
                <Italic />
              </ButtonIcon>
              <ButtonIcon 
                @click="setCellUnderline(textDecoration !== 'underline')"
                radius="lg"
                :isActive="textDecoration === 'underline'"
                title="Underline"
              >
                <Underline />
              </ButtonIcon>
            </div>
          </div>

          <!-- Font Size -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Font Size</div>
            <div class="flex gap-1">
              <ButtonIcon 
                v-for="btn in cellFontSize"
                :key="btn.label"
                @click="btn.action"
                radius="lg"
                :isActive="btn.active"
              >
                {{ btn.label }}
              </ButtonIcon>
            </div>
          </div>

          <!-- Padding -->
          <div>
            <div class="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">Padding</div>
            <div class="flex gap-1">
              <ButtonIcon 
                v-for="btn in cellPaddings"
                :key="btn.label"
                @click="btn.action"
                radius="lg"
                :isActive="btn.active"
              >
                {{ btn.label }}
              </ButtonIcon>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="border-t border-zinc-200 dark:border-zinc-600 pt-3 flex gap-2">
            <button 
              @click="resetCellStyles"
              class="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
            >
              Reset Styles
            </button>
            <button 
              @click="clearCellSelection"
              class="px-3 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
      <!-- Merge Options -->
      <div v-if="showMergePopover" class="flex flex-col gap-2 h-96 overflow-auto scrollbar-none m-4 border-l border-black/10 pl-4">
        <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Table Actions</div>
          <button @click="mergeCells" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Merge Cells
          </button>
          <div class="border-t border-zinc-200 dark:border-zinc-600 my-1"></div>
          <button @click="addColumnLeft" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <Plus class="size-4"/>
            Add Column Left
          </button>
          <button @click="addColumnRight" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <Plus class="size-4"/>
            Add Column Right
          </button>
          <button @click="addRowAbove" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <Plus class="size-4"/>
            Add Row Above
          </button>
          <button @click="addRowBelow" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <Plus class="size-4"/>
            Add Row Below
          </button>
          <div class="border-t border-zinc-200 dark:border-zinc-600 my-1"></div>
          <button @click="deleteColumn" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <X class="size-4"/>
            Delete Column
          </button>
          <button @click="deleteRow" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <X class="size-4"/>
            Delete Row
          </button>
          <button @click="deleteSelectedCells" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <X class="size-4"/>
            Clear Content
          </button>
          <div class="border-t border-zinc-200 dark:border-zinc-600 my-1"></div>
          <button @click="clearCellSelection" class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors">
            <X class="size-4"/>
            Cancel
          </button>
      </div>
      
    </Modal>

    <!-- Test Use this  -->
    <TableGrid 
      :editorTable="{
        showTableGrid: showTableGrid.showTableGrid.value,
        closeTableModal: showTableGrid.closeTableModal,
        gridCells: gridCells,
        gridStyle: gridStyle,
        selectedRows: selectedRows,
        selectedCols: selectedCols,
        highlightGrid: highlightGrid,
        selectGrid: selectGrid,
        isGridCellSelected: isGridCellSelected
      }"
    />
   
  </div>
</template>

<script setup lang="ts">
import { cn } from '../../lib/utils'
import { useEditorStoreFactory } from '../../stores/index'
import { computed, onMounted, ref, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, AlignVerticalDistributeCenter, AlignVerticalDistributeEnd, AlignVerticalDistributeStart, Bold, Check, Italic, Link, Plus, Strikethrough, Underline, X } from 'lucide-vue-next'
import ButtonIcon from '../ui/ButtonIcon.vue'
import { useEditorCommands } from '../composables/useEditorCommands'
import { useEditorSelection } from '../composables/useEditorSelection'
import { useEditorLink } from '../composables/useEditorLink'
import { useEditorTable, showTableGrid } from '../composables/useEditorTable'
import { useEditorImage, uploadImage } from '../composables/useEditorImage'
import Modal from '../ui/Modal.vue'
import { useDisclosure } from '../../hooks/useDisclosure'
import TableGrid from './TableGrid.vue'

const { onClose: onCloseMerge } = useDisclosure()


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

// ===== Keyword  =====
watch(() => editorStore.keyword, (newKeyword, oldKeyword) => {
  if (newKeyword && newKeyword !== oldKeyword) {
    insertKeyword(newKeyword)
    editorStore.setKeyword('')
  }
})

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
const updateContent = () => {
  if (editor.value) content.value = editor.value.innerHTML
}

// ===== Composables =====
const { handleSelection, applyBackgroundColor, applyTextColor } = useEditorSelection(editor, isOpen, toolbarStyle, content)
const { exec, insertKeyword } = useEditorCommands(editor, updateContent)
const { showLinkInput, linkUrl, toggleLink, applyLink, handleLinkInputKeydown, handleLinkClick, getLink } = useEditorLink(editor, updateContent)
const { triggerImageUpload } = useEditorImage(editor, updateContent)

// Table composable
const {
  mergeCells,
  clearCellSelection,
  showMergePopover,
  showStylePopover,
  availableBackgroundColors,
  availableTextColors,
  setCellBackgroundColor,
  setCellTextAlign,
  setCellVerticalAlign,
  setCellBold,
  setCellItalic,
  setCellUnderline,
  setCellFontSize,
  setCellTextColor,
  setCellPadding,
  resetCellStyles,
  addColumnLeft,
  addColumnRight,
  addRowAbove,
  addRowBelow,
  deleteColumn,
  deleteRow,
  deleteSelectedCells,
  closeTableModal,
  textAlign,
  verticalAlign,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  cellPadding,
  cellTextColor,
  cellBackgroundColor,
  gridCells,
  gridStyle,
  selectedRows,
  selectedCols,
  highlightGrid,
  selectGrid,
  isGridCellSelected,
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

// Watch for image upload trigger from toolbar
watch(() => uploadImage.openFile.value, (shouldOpen) => {
  if (shouldOpen) {
    triggerImageUpload()
    uploadImage.openFile.value = false // Reset the trigger
  }
})

// ===== Toolbar Actions =====
const toolbarButtons = computed(() => {
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
      label: 'Link',
      icon: Link,
      action: () => toggleLink(),
      active: !!currentLink
    },
  ]
})

const cellTextAlign = computed(() => [
  { label: 'Left', icon: AlignLeft, action: () => setCellTextAlign('left'), active: textAlign.value === 'left' },
  { label: 'Center', icon: AlignCenter, action: () => setCellTextAlign('center'), active: textAlign.value === 'center' },
  { label: 'Right', icon: AlignRight, action: () => setCellTextAlign('right'), active: textAlign.value === 'right' },
  { label: 'Justify', icon: AlignJustify, action: () => setCellTextAlign('justify'), active: textAlign.value === 'justify' },
])

const cellFontSize = computed(() => [
  { label: 'Sm', icon: "Small", action: () => setCellFontSize('12px'), active: fontSize.value === '12px' },
  { label: 'Md', icon: "Medium", action: () => setCellFontSize('16px'), active: fontSize.value === '16px' },
  { label: 'Lg', icon: "Large", action: () => setCellFontSize('20px'), active: fontSize.value === '20px' },
])

const cellPaddings = computed(() => [
  { label: 'Sm', icon: "Small", action: () => setCellPadding('4px'), active: cellPadding.value === '4px' },
  { label: 'Md', icon: "Medium", action: () => setCellPadding('8px'), active: cellPadding.value === '8px' },
  { label: 'Lg', icon: "Large", action: () => setCellPadding('12px'), active: cellPadding.value === '12px' },
])

const cellVerticalAlign = computed(() => [
  { label: 'Top', icon: AlignVerticalDistributeEnd, action: () => setCellVerticalAlign('top'), active: verticalAlign.value === 'top' },
  { label: 'Middle', icon: AlignVerticalDistributeCenter, action: () => setCellVerticalAlign('middle'), active: verticalAlign.value === 'middle' },
  { label: 'Bottom', icon: AlignVerticalDistributeStart, action: () => setCellVerticalAlign('bottom'), active: verticalAlign.value === 'bottom' },
])


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

/* Preview table styles */
:deep(.preview-table) {
  opacity: 0.7;
  border: 2px dashed #3b82f6;
}

:deep(.preview-table td) {
  background-color: #f8f9fa !important;
  border: 1px dashed #ccc !important;
}

.dark :deep(.preview-table td) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Keyword placeholder styles */
:deep(.keyword-placeholder) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  display: inline-block !important;
  margin: 0 2px !important;
  cursor: default !important;
  user-select: none !important;
  transition: all 0.2s ease !important;
}

.dark :deep(.keyword-placeholder) {
  background-color: #374151 !important;
  color: #f9fafb !important;
}

:deep(.keyword-placeholder:hover) {
  background-color: #e5e7eb !important;
}

.dark :deep(.keyword-placeholder:hover) {
  background-color: #4b5563 !important;
}

/* Transition for slide-fade */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Popover animations */
.popover-enter-active, .popover-leave-active {
  transition: all 0.2s ease;
}
.popover-enter-from, .popover-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>