<template>
    <div class="relative w-full p-2 rounded-3xl bg-white/90 dark:bg-black/70 overflow-hidden">
      <!-- Background gradient -->
      <div
        class="absolute inset-0 z-0 opacity-15"
        :style="gradientStyle"
      />
  
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
      />
  
      <!-- Placeholder -->
      <span
        v-if="!content"
        class="absolute top-4 left-4 right-4 text-zinc-400 pointer-events-none select-none w-full"
        :style="{ fontSize: editorStyle.fontSize, fontWeight: editorStyle.fontWeight, fontFamily: editorStyle.fontFamily, textAlign: editorStyle.textAlign }"
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
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </ButtonIcon>

                   <!-- Background Color Text Picker -->
                   <label>
                       <input type="color" @input="e => applyBackgroundColor((e.target as HTMLInputElement).value)" class="w-6 h-6"/>
                   </label>
                    <!-- Text Color Picker -->
                    <label>
                        <input type="color" @input="e => applyTextColor((e.target as HTMLInputElement).value)" class="w-6 h-6"/>
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
                        class="w-full py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 outline-none focus:outline-none text-sm"
                    />
                </transition>
            </div>
        </motion.div>
      </AnimatePresence>

      <!-- Table Modal -->
      <div v-if="showTableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Insert Table</h3>
          
          <!-- Grid Selector -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Table Size</label>
            <div class="grid gap-1 mb-4" :style="gridStyle">
              <div 
                v-for="(cell, index) in gridCells" 
                :key="index"
                class="w-6 h-6 border border-gray-300 cursor-pointer transition-colors"
                :class="{
                  'bg-blue-500': isGridCellSelected(index),
                  'hover:bg-blue-200': !isGridCellSelected(index)
                }"
                @mouseover="highlightGrid(index)"
                @click="selectGrid(index)"
              ></div>
            </div>
            
            <!-- Size Display -->
            <div class="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ selectedRows }}×{{ selectedCols }}
            </div>
          </div>
          
          <!-- Modal Buttons -->
          <div class="flex gap-2 justify-end">
            <button 
              @click="closeTableModal" 
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded dark:text-gray-300"
            >
              Cancel
            </button>
            <button 
              @click="insertTable" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
    import { cn } from '../../lib/utils'
    import { useEditorStoreFactory } from '../../stores/index'
    import { computed, onMounted, ref, watch } from 'vue'
    import { motion, AnimatePresence } from 'motion-v'
    import { Bold, Italic, Link, Strikethrough, Underline } from 'lucide-vue-next'
    import ButtonIcon from '../ui/ButtonIcon.vue'
    import { useEditorCommands, useEditorLink, useEditorSelection } from '../composables'
    
    //  ===== Props / Emits =====
    const props = defineProps<{ 
        editorId: string
        placeholder?: string
        modelValue?: string
    }>()
    
    const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>()
  
    //  ===== State =====
    const isOpen = ref(false)
    const toolbarStyle = ref({})
    const editor = ref<HTMLElement | null>(null)
    const content = ref('')
    const editorStore = useEditorStoreFactory(props.editorId)
    
    // Table Modal State
    const showTableModal = ref(false)
    const maxGridSize = 8
    const selectedRows = ref(1)
    const selectedCols = ref(1)

    //  ===== Computed =====
    const placeholderText = computed(() => props.placeholder || 'Start typing your document here…')
    
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
    
    const gradientStyle = {
        background: `
            radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
            radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
            radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
            radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
            linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
        `,
    }

    // Table Grid Computed
    const gridCells = computed(() => Array(maxGridSize * maxGridSize).fill(null))
    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${maxGridSize}, 1fr)`
    }))
    
    //  ===== Motion =====
    const motionInitial = { opacity: 0, scale: 0 }
    const motionAnimate = computed(() => ({
        opacity: 1,
        scale: 1,
        height: showLinkInput.value ? '5.3rem' : '3rem',
    }))

    const motionExit = { opacity: 0, scale: 0 }
    const motionTransition = { duration: 0.2, ease: 'easeInOut' as const }
    
    //  ===== Sync parent ↔ local =====
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
    
   
    //  ===== Toolbar Actions =====
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
                        removeLink() // remove if already linked
                    } else {
                        toggleLink() // show input if no link
                    }
                },
                active: !!currentLink
            },
        ]
    });

    //  ===== Start Table Functions =====
    function openTableModal() {
        showTableModal.value = true
        selectedRows.value = 1
        selectedCols.value = 1
        isOpen.value = false // Close main toolbar
    }

    function closeTableModal() {
        showTableModal.value = false
    }

    function getGridPosition(index: number) {
        const row = Math.floor(index / maxGridSize)
        const col = index % maxGridSize
        return { row, col }
    }

    function isGridCellSelected(index: number) {
        const { row, col } = getGridPosition(index)
        return row < selectedRows.value && col < selectedCols.value
    }

    function highlightGrid(index: number) {
        const { row, col } = getGridPosition(index)
        selectedRows.value = row + 1
        selectedCols.value = col + 1
    }

    function selectGrid(index: number) {
        const { row, col } = getGridPosition(index)
        selectedRows.value = row + 1
        selectedCols.value = col + 1
        insertTable()
    }

    function insertTable() {
        if (!editor.value) return

        // Create table HTML
        let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">'
        
        for (let r = 0; r < selectedRows.value; r++) {
            tableHTML += '<tr>'
            for (let c = 0; c < selectedCols.value; c++) {
                tableHTML += `<td contenteditable="true" style="border: 1px solid #ccc; padding: 8px; min-width: 100px; min-height: 30px;">&nbsp;</td>`
            }
            tableHTML += '</tr>'
        }
        
        tableHTML += '</table>'

        // Get current selection or cursor position
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            
            // Delete selected content if any
            range.deleteContents()
            
            // Create a temporary div to hold the table HTML
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = tableHTML
            
            // Insert the table at cursor position
            while (tempDiv.firstChild) {
                range.insertNode(tempDiv.firstChild)
            }
            
            // Move cursor after the table
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
        } else {
            // Fallback: append to end of editor content
            editor.value.innerHTML += tableHTML
        }

        updateContent()
        closeTableModal()

        // Focus back on editor
        editor.value.focus()
    }

    //  ===== End Table Functions =====

    //  ===== Composables =====
    const { handleSelection, applyBackgroundColor, applyTextColor } = useEditorSelection(editor, isOpen, toolbarStyle, content)
    const { exec } = useEditorCommands(editor, updateContent)
    const { showLinkInput, linkUrl, toggleLink, applyLink, handleLinkInputKeydown, handleLinkClick, removeLink, getLink } = useEditorLink(editor, updateContent)
    
    //  ===== Lifecycle =====
    function updateContent() {
        if (editor.value) content.value = editor.value.innerHTML
    }
    
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
    border: 1px solid #ccc;
    padding: 8px;
    min-width: 100px;
    min-height: 30px;
    vertical-align: top;
}


:deep(table td:focus) {
    outline: 2px solid #3b82f6;
    outline-offset: -1px;
}

/* Dark mode table styles */
.dark :deep(table td) {
    border-color: #4b5563;
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