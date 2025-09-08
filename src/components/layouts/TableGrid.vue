<template>
    <Modal 
      :isOpen="props.editorTable.showTableGrid"
      :onClose="props.editorTable.closeTableModal"
      :layouts="{ height: 350 }"
    >
      <div>
          <motion.div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ delay: 0.5, duration: 0.4 }"
            class="grid gap-1"
            :style="editorTable.gridStyle"
          >
            <motion.div
              v-for="(_, index) in editorTable.gridCells"
              :key="index"
              class="w-6 h-6 rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-blue-500': editorTable.isGridCellSelected(index),
                'hover:bg-zinc-200 bg-zinc-800/10 dark:bg-zinc-100/10': !editorTable.isGridCellSelected(index)
              }"
              :initial="{ opacity: 0, scale: editorTable.isGridCellSelected(index) ? 1 : 0.8 }"
              :animate="{ opacity: 1, scale: editorTable.isGridCellSelected(index) ? 1 : 0.8 }"
              :exit="{ opacity: 0, scale: editorTable.isGridCellSelected(index) ? 1 : 0.8 }"
                @mouseover="editorTable.highlightGrid(index)"
              @click="editorTable.selectGrid(index)"
            />
        </motion.div>
        <motion.div
          :initial="{ opacity: 1, scale: 0 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 1, scale: 0 }"
          :transition="{ delay: .5 }"
          class="flex items-center justify-center gap-2 mt-4"
        >
          <div class="text-center flex items-center gap-2 text-sm shadow-sm shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-white dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-300/10 backdrop-blur-xs rounded-3xl py-1 px-4 w-fit">
            {{ editorTable.selectedRows }}
              <X :size="10" />
            {{ editorTable.selectedCols }}
          </div>
        </motion.div>
          
      </div>
    </Modal>
</template>
<script setup lang="ts">
import { motion } from 'motion-v'
import Modal from '../ui/Modal.vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{ 
  editorTable: {
    showTableGrid: boolean,
    closeTableModal: () => void,
    gridCells: number[],
    gridStyle: any,
    selectedRows: number,
    selectedCols: number,
    highlightGrid: (index: number) => void,
    selectGrid: (index: number) => void,
    isGridCellSelected: (index: number) => boolean
  }
}>()

</script>