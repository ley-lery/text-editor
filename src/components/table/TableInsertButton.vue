<!-- TableInsertButton.vue - Button to insert tables in text editor -->
<template>
    <div class="relative">
      <!-- Table Insert Button -->
      <button 
        @click="showGridSelector = !showGridSelector"
        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        title="Insert Table"
      >
        <TableIcon class="w-4 h-4" />
      </button>
  
      <!-- Grid Selector Popup -->
      <div 
        v-if="showGridSelector"
        class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 z-20"
        @click.stop
      >
        <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">Select table size</div>
        
        <!-- Grid -->
        <div class="grid gap-1 mb-2" :style="{ gridTemplateColumns: `repeat(${maxSize}, 1fr)` }">
          <div 
            v-for="(cell, index) in gridCells" 
            :key="index"
            class="w-4 h-4 border border-gray-300 dark:border-gray-600 cursor-pointer transition-colors"
            :class="{
              'bg-blue-500': isCellHighlighted(index),
              'hover:bg-blue-200 dark:hover:bg-blue-700': !isCellHighlighted(index)
            }"
            @mouseover="highlightGrid(index)"
            @click="selectGrid(index)"
          />
        </div>
        
        <!-- Size Display -->
        <div class="text-xs text-center text-gray-600 dark:text-gray-400">
          {{ selectedRows }}×{{ selectedCols }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { h } from 'vue'
  
  // Table icon component
  const TableIcon = () => h('svg', { 
    class: 'w-4 h-4', 
    fill: 'none', 
    stroke: 'currentColor', 
    viewBox: '0 0 24 24' 
  }, [
    h('path', { 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round', 
      'stroke-width': '2', 
      d: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' 
    })
  ])
  
  interface Emits {
    (e: 'insertTable', rows: number, cols: number): void
  }
  
  const emit = defineEmits<Emits>()
  
  const showGridSelector = ref(false)
  const selectedRows = ref(1)
  const selectedCols = ref(1)
  const maxSize = 8
  
  const gridCells = computed(() => Array(maxSize * maxSize).fill(null))
  
  const getGridPosition = (index: number) => {
    const row = Math.floor(index / maxSize)
    const col = index % maxSize
    return { row, col }
  }
  
  const isCellHighlighted = (index: number) => {
    const { row, col } = getGridPosition(index)
    return row < selectedRows.value && col < selectedCols.value
  }
  
  const highlightGrid = (index: number) => {
    const { row, col } = getGridPosition(index)
    selectedRows.value = row + 1
    selectedCols.value = col + 1
  }
  
  const selectGrid = (index: number) => {
    const { row, col } = getGridPosition(index)
    const rows = row + 1
    const cols = col + 1
    
    emit('insertTable', rows, cols)
    showGridSelector.value = false
  }
  
  // Close grid selector when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showGridSelector.value = false
    }
  })
  </script>