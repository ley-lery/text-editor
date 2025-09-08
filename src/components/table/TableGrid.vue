<template>
    <div class="overflow-auto relative border border-gray-300 rounded">
      <table class="min-w-full border-collapse">
        <tbody>
          <tr v-for="(row, rowIndex) in table.data" :key="rowIndex" class="hover:bg-gray-50">
            <template v-for="(cell, colIndex) in row" :key="colIndex">
              <td
                v-if="!cell.merged"
                class="border border-gray-300 px-1 py-1 min-w-[100px]"
                :colspan="cell.colspan || 1"
                :rowspan="cell.rowspan || 1"
                :class="{
                  'bg-blue-200': isCellSelected(rowIndex, colIndex)
                }"
                @mousedown.prevent="startSelection(rowIndex, colIndex)"
                @mouseover.prevent="moveSelection(rowIndex, colIndex)"
                @mouseup.prevent="endSelection"
              >
                <input 
                  v-model="cell.value" 
                  class="w-full border-none outline-none bg-transparent px-2 py-2"
                  placeholder="Enter text..."
                  @mousedown.stop
                  @click.stop
                  @focus.stop
                  @input="handleCellUpdate"
                />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      
      <!-- Merge/Unmerge Popover -->
      <div
        v-if="showPopover"
        :style="popoverStyle"
        class="absolute bg-white border rounded shadow px-3 py-2"
      >
        <button
          class="bg-blue-600 text-white px-3 py-1 rounded mr-2 text-sm"
          @click="handleMerge"
        >
          Merge
        </button>
        <button
          class="bg-red-600 text-white px-3 py-1 rounded text-sm"
          @click="handleUnmerge"
        >
          Unmerge
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useTableSelection } from '../composables/useTableSelection'
  import { mergeCells, unmergeCells } from '../../utils/tableUtils'
  
  interface Props {
    table: Table
  }
  
  interface Emits {
    (e: 'update', table: Table): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  const {
    startSelection,
    moveSelection,
    endSelection,
    clearSelection,
    isCellSelected,
    isMultiCellSelection,
    selectionRange
  } = useTableSelection()
  
  const showPopover = computed(() => isMultiCellSelection.value)
  
  const popoverStyle = {
    top: '10px',
    left: '10px',
    zIndex: 99
  }
  
  const handleCellUpdate = () => {
    emit('update', {
      ...props.table,
      updatedAt: new Date().toISOString()
    })
  }
  
  const handleMerge = () => {
    if (!selectionRange.value) return
    
    const updatedTable = mergeCells(props.table, selectionRange.value)
    emit('update', updatedTable)
    clearSelection()
  }
  
  const handleUnmerge = () => {
    if (!selectionRange.value) return
    
    const updatedTable = unmergeCells(props.table, selectionRange.value)
    emit('update', updatedTable)
    clearSelection()
  }
  </script>