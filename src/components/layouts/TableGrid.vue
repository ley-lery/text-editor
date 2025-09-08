<template>
      <AnimatePresence :initial="false">
        <motion.div
          v-if="isOpen"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="fixed inset-0 bg-black/10 dark:bg-black/80 flex items-center justify-center z-10 w-full h-full"
          @click="onClose"
        />
        <motion.div
          v-if="isOpen"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="fixed inset-0 flex items-center justify-center z-20"
          @click="onClose"
        >
          <!-- Grid Selector -->
          <div class="mb-4">
            <motion.div
              v-if="isOpen"
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
                :transition="{ delay: 0.4, duration: 0.4 }"
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
</template>
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { useEditorTable } from '../composables'
const props = defineProps<{ 
    editor: any
    updateContent: () => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}>()
    const {
        selectedRows,
        selectedCols,
        gridCells,
        gridStyle,
        isGridCellSelected,
        highlightGrid,
        selectGrid,
    } = useEditorTable(props.editor, props.updateContent)
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
</script>