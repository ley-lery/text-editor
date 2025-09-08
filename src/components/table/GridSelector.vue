<!-- components/GridSelector.vue -->
<template>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select Table Size</label>
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
      <div class="text-center text-sm text-gray-600 mb-4">
        {{ selectedRows }}×{{ selectedCols }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { getGridPosition, isGridCellSelected as utilIsGridCellSelected } from '../../utils/tableUtils'
  
  interface Props {
    selectedRows: number
    selectedCols: number
    maxGridSize?: number
  }
  
  interface Emits {
    (e: 'update:selectedRows', value: number): void
    (e: 'update:selectedCols', value: number): void
    (e: 'select', rows: number, cols: number): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    maxGridSize: 10
  })
  
  const emit = defineEmits<Emits>()
  
  // Generate grid cells for the selector
  const gridCells = computed(() => Array(props.maxGridSize * props.maxGridSize).fill(null))
  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${props.maxGridSize}, 1fr)`
  }))
  
  const isGridCellSelected = (index: number): boolean => {
    return utilIsGridCellSelected(index, props.selectedRows, props.selectedCols, props.maxGridSize)
  }
  
  const highlightGrid = (index: number): void => {
    const { row, col } = getGridPosition(index, props.maxGridSize)
    emit('update:selectedRows', row + 1)
    emit('update:selectedCols', col + 1)
  }
  
  const selectGrid = (index: number): void => {
    const { row, col } = getGridPosition(index, props.maxGridSize)
    const rows = row + 1
    const cols = col + 1
    
    emit('update:selectedRows', rows)
    emit('update:selectedCols', cols)
    emit('select', rows, cols)
  }
  </script>