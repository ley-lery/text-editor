<!-- InlineTableEditor.vue - For embedding in text content -->
<template>
    <div class="my-4 p-4 border border-gray-200 rounded-lg bg-white/50 dark:bg-black/20">
      <!-- Table Header with Controls -->
      <div class="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <input 
            v-model="tableName" 
            @blur="updateTableName"
            class="text-sm font-medium bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            placeholder="Table name..."
          />
          <span class="text-xs text-gray-500">({{ rows }}×{{ cols }})</span>
        </div>
        
        <div class="flex items-center gap-1">
          <!-- Export/Import Controls -->
          <button 
            @click="exportTable" 
            class="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
            title="Export table"
          >
            <DownloadIcon class="w-4 h-4" />
          </button>
          
          <label class="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer" title="Import table">
            <UploadIcon class="w-4 h-4" />
            <input 
              type="file" 
              accept=".json"
              @change="importTable"
              class="hidden"
            />
          </label>
          
          <button 
            @click="duplicateTable" 
            class="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Duplicate table"
          >
            <CopyIcon class="w-4 h-4" />
          </button>
          
          <button 
            @click="removeTable" 
            class="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove table"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
  
      <!-- Status Message -->
      <div v-if="statusMessage" :class="statusMessageClass" class="mb-3 p-2 rounded text-sm">
        {{ statusMessage }}
      </div>
      
      <!-- Table Grid -->
      <div class="overflow-auto relative border border-gray-300 rounded-lg">
        <table class="min-w-full border-collapse bg-white dark:bg-gray-900">
          <tbody>
            <tr v-for="(row, rowIndex) in tableData" :key="rowIndex" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <template v-for="(cell, colIndex) in row" :key="colIndex">
                <td
                  v-if="!cell.merged"
                  class="border border-gray-300 dark:border-gray-600 px-2 py-2 min-w-[80px]"
                  :colspan="cell.colspan || 1"
                  :rowspan="cell.rowspan || 1"
                  :class="{
                    'bg-blue-100 dark:bg-blue-900': isCellSelected(rowIndex, colIndex)
                  }"
                  @mousedown.prevent="startSelection(rowIndex, colIndex)"
                  @mouseover.prevent="moveSelection(rowIndex, colIndex)"
                  @mouseup.prevent="endSelection"
                >
                  <input 
                    v-model="cell.value" 
                    class="w-full border-none outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 px-1 py-1"
                    placeholder="..."
                    @mousedown.stop
                    @click.stop
                    @focus.stop
                    @input="updateContent"
                  />
                </td>
              </template>
            </tr>
          </tbody>
        </table>
        
        <!-- Merge Controls Popover -->
        <div
          v-if="showMergeControls"
          class="absolute bg-white dark:bg-gray-800 border rounded shadow-lg px-2 py-1 z-10"
          :style="{ top: '10px', left: '10px' }"
        >
          <button
            class="bg-blue-600 text-white px-2 py-1 rounded mr-1 text-xs"
            @click="mergeSelectedCells"
          >
            Merge
          </button>
          <button
            class="bg-red-600 text-white px-2 py-1 rounded text-xs"
            @click="unmergeSelectedCells"
          >
            Unmerge
          </button>
        </div>
      </div>
  
      <!-- Add Row/Column Controls -->
      <div class="mt-2 flex gap-2">
        <button 
          @click="addRow" 
          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
        >
          + Row
        </button>
        <button 
          @click="addColumn" 
          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
        >
          + Column
        </button>
        <button 
          @click="removeRow" 
          :disabled="rows <= 1"
          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          - Row
        </button>
        <button 
          @click="removeColumn" 
          :disabled="cols <= 1"
          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          - Column
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, reactive, watch } from 'vue'
  import { downloadJSON, readJSONFile } from '../../utils/fileUtils'
  import { h } from 'vue'
  
  // Icons (simplified inline components)
  const DownloadIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
  ])
  
  const UploadIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' })
  ])
  
  const CopyIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' })
  ])
  
  const TrashIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
  ])
  
  // Props & Emits
  interface Props {
    initialRows?: number
    initialCols?: number
    initialName?: string
    modelValue?: any
  }
  
  interface Emits {
    (e: 'update:modelValue', value: any): void
    (e: 'remove'): void
    (e: 'duplicate', tableData: any): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    initialRows: 3,
    initialCols: 3,
    initialName: 'Table'
  })
  
  const emit = defineEmits<Emits>()
  
  // Table state
  const tableName = ref(props.initialName)
  const rows = ref(props.initialRows)
  const cols = ref(props.initialCols)
  const tableData = ref<any[][]>([])
  
  // Selection state
  const selection = reactive({
    start: null as null | [number, number],
    end: null as null | [number, number],
    isSelecting: false
  })
  
  // Status messages
  const statusMessage = ref('')
  const statusType = ref<'success' | 'error' | 'info'>('info')
  
  const statusMessageClass = computed(() => {
    switch (statusType.value) {
      case 'success': return 'bg-green-100 text-green-700 border border-green-200'
      case 'error': return 'bg-red-100 text-red-700 border border-red-200'
      case 'info': default: return 'bg-blue-100 text-blue-700 border border-blue-200'
    }
  })
  
  const showMergeControls = computed(() => {
    if (!selection.start || !selection.end) return false
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    return !(r1 === r2 && c1 === c2)
  })
  
  // Initialize table data
  const initializeTable = () => {
    const data: any[][] = []
    for (let r = 0; r < rows.value; r++) {
      const row: any[] = []
      for (let c = 0; c < cols.value; c++) {
        row.push({
          value: '',
          merged: false,
          colspan: 1,
          rowspan: 1
        })
      }
      data.push(row)
    }
    tableData.value = data
  }
  
  // Status helper
  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    statusMessage.value = message
    statusType.value = type
    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
  }
  
  // Selection methods
  const startSelection = (row: number, col: number) => {
    selection.start = [row, col]
    selection.end = [row, col]
    selection.isSelecting = true
  }
  
  const moveSelection = (row: number, col: number) => {
    if (selection.isSelecting && selection.start) {
      selection.end = [row, col]
    }
  }
  
  const endSelection = () => {
    selection.isSelecting = false
  }
  
  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end) return false
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    const [minR, maxR] = [Math.min(r1, r2), Math.max(r1, r2)]
    const [minC, maxC] = [Math.min(c1, c2), Math.max(c1, c2)]
    return row >= minR && row <= maxR && col >= minC && col <= maxC
  }
  
  // Table manipulation
  const addRow = () => {
    const newRow: any[] = []
    for (let c = 0; c < cols.value; c++) {
      newRow.push({ value: '', merged: false, colspan: 1, rowspan: 1 })
    }
    tableData.value.push(newRow)
    rows.value++
    updateContent()
  }
  
  const addColumn = () => {
    tableData.value.forEach(row => {
      row.push({ value: '', merged: false, colspan: 1, rowspan: 1 })
    })
    cols.value++
    updateContent()
  }
  
  const removeRow = () => {
    if (rows.value > 1) {
      tableData.value.pop()
      rows.value--
      updateContent()
    }
  }
  
  const removeColumn = () => {
    if (cols.value > 1) {
      tableData.value.forEach(row => {
        row.pop()
      })
      cols.value--
      updateContent()
    }
  }
  
  // Merge/Unmerge
  const mergeSelectedCells = () => {
    if (!selection.start || !selection.end) return
    
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    const [minR, maxR] = [Math.min(r1, r2), Math.max(r1, r2)]
    const [minC, maxC] = [Math.min(c1, c2), Math.max(c1, c2)]
    
    const rowspan = maxR - minR + 1
    const colspan = maxC - minC + 1
    let mergedValues: string[] = []
  
    // Collect values
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const cell = tableData.value[r][c]
        if (!cell.merged && cell.value) {
          mergedValues.push(cell.value)
        }
      }
    }
  
    // Set main cell
    const mainCell = tableData.value[minR][minC]
    mainCell.rowspan = rowspan
    mainCell.colspan = colspan
    mainCell.value = mergedValues.join(' ')
    mainCell.merged = false
  
    // Mark others as merged
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r !== minR || c !== minC) {
          tableData.value[r][c].merged = true
        }
      }
    }
  
    selection.start = selection.end = null
    updateContent()
  }
  
  const unmergeSelectedCells = () => {
    if (!selection.start || !selection.end) return
    
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    const [minR, maxR] = [Math.min(r1, r2), Math.max(r1, r2)]
    const [minC, maxC] = [Math.min(c1, c2), Math.max(c1, c2)]
    
    // Reset main cell
    const mainCell = tableData.value[minR][minC]
    mainCell.rowspan = 1
    mainCell.colspan = 1
  
    // Reset other cells
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r !== minR || c !== minC) {
          const cell = tableData.value[r][c]
          cell.merged = false
          cell.colspan = 1
          cell.rowspan = 1
        }
      }
    }
  
    selection.start = selection.end = null
    updateContent()
  }
  
  // Export/Import/Actions
  const exportTable = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      name: tableName.value,
      rows: rows.value,
      cols: cols.value,
      data: tableData.value
    }
    
    const filename = `${tableName.value.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`
    downloadJSON(exportData, filename)
    showStatus('Table exported successfully!', 'success')
  }
  
  const importTable = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    
    try {
      const importData = await readJSONFile(file)
      
      if (importData.data && Array.isArray(importData.data)) {
        tableName.value = importData.name || 'Imported Table'
        rows.value = importData.rows || importData.data.length
        cols.value = importData.cols || (importData.data[0]?.length || 0)
        tableData.value = importData.data
        
        showStatus('Table imported successfully!', 'success')
        updateContent()
      } else {
        throw new Error('Invalid file format')
      }
    } catch (error) {
      showStatus('Failed to import table. Please check the file format.', 'error')
    }
    
    input.value = ''
  }
  
  const duplicateTable = () => {
    const tableData: any = {
      name: `${tableName.value} (Copy)`,
      rows: rows.value,
      cols: cols.value,
      data: JSON.parse(JSON.stringify(tableData.value))
    }
    emit('duplicate', tableData)
  }
  
  const removeTable = () => {
    if (confirm('Are you sure you want to remove this table?')) {
      emit('remove')
    }
  }
  
  const updateTableName = () => {
    updateContent()
  }
  
  const updateContent = () => {
    const tableObject = {
      name: tableName.value,
      rows: rows.value,
      cols: cols.value,
      data: tableData.value
    }
    emit('update:modelValue', tableObject)
  }
  
  // Initialize
  initializeTable()
  
  // Watch for external changes
  watch(() => props.modelValue, (newValue) => {
    if (newValue && newValue.data) {
      tableName.value = newValue.name || props.initialName
      rows.value = newValue.rows || props.initialRows
      cols.value = newValue.cols || props.initialCols
      tableData.value = newValue.data
    }
  }, { immediate: true })
  </script>