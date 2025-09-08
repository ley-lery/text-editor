<template>
    <div class="p-6">
      <!-- Table Icon Button -->
      <button 
        v-if="!showTable"
        @click="openModal" 
        class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center gap-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        Insert Table
      </button>
  
      <!-- Modal for Grid Selection -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 shadow-xl">
          <h3 class="text-lg font-semibold mb-4">Select Table Size</h3>
          
          <!-- Grid Selector -->
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
          
          <!-- Modal Buttons -->
          <div class="flex gap-2 justify-end">
            <button 
              @click="closeModal" 
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              @click="generateTable" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Table
            </button>
          </div>
        </div>
      </div>
  
      <!-- Generated Table -->
      <div v-if="showTable" class="mt-6">
        <div class="mb-4 flex gap-2 flex-wrap">
          <button 
            @click="resetTable" 
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            New Table
          </button>
          
          <button 
            @click="exportToJSON" 
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export JSON
          </button>
          
          <label class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            Import JSON
            <input 
              type="file" 
              accept=".json"
              @change="importFromJSON"
              class="hidden"
              ref="fileInput"
            />
          </label>
          
          <button 
            @click="copyJSONToClipboard" 
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Copy JSON
          </button>
        </div>
        
        <!-- Status Messages -->
        <div v-if="statusMessage" :class="statusMessageClass" class="mb-4 p-3 rounded">
          {{ statusMessage }}
        </div>
        
        <div class="overflow-auto relative border border-gray-300 rounded">
          <table class="min-w-full border-collapse">
            <tbody>
              <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="hover:bg-gray-50">
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
              @click="mergeSelectedCells"
            >
              Merge
            </button>
            <button
              class="bg-red-600 text-white px-3 py-1 rounded text-sm"
              @click="unmergeSelectedCells"
            >
              Unmerge
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  
  interface TableCell {
    value: string
    colspan?: number
    rowspan?: number
    merged?: boolean
    originalValue?: string
  }
  
  interface TableData {
    version: string
    timestamp: string
    rows: number
    cols: number
    data: TableCell[][]
  }
  
  // Modal and Grid State
  const showModal = ref(false)
  const showTable = ref(false)
  const maxGridSize = 10
  const selectedRows = ref(1)
  const selectedCols = ref(1)
  
  // Status messages
  const statusMessage = ref('')
  const statusMessageClass = ref('')
  const fileInput = ref<HTMLInputElement>()
  
  // Generate grid cells for the selector
  const gridCells = computed(() => Array(maxGridSize * maxGridSize).fill(null))
  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${maxGridSize}, 1fr)`
  }))
  
  // Table data
  const rows = ref<TableCell[][]>([])
  
  // Selection state for table
  const selection = reactive({
    start: null as null | [number, number],
    end: null as null | [number, number],
    isSelecting: false
  })
  
  // Status message helper
  function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    statusMessage.value = message
    statusMessageClass.value = type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                              type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                              'bg-blue-100 text-blue-700 border border-blue-200'
    
    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
  }
  
  // Modal functions
  function openModal() {
    showModal.value = true
    selectedRows.value = 1
    selectedCols.value = 1
  }
  
  function closeModal() {
    showModal.value = false
  }
  
  function resetTable() {
    showTable.value = false
    rows.value = []
    statusMessage.value = ''
  }
  
  // Grid selector functions
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
    generateTable()
  }
  
  // Generate table based on selection
  function generateTable() {
    const newRows: TableCell[][] = []
    
    for (let r = 0; r < selectedRows.value; r++) {
      const row: TableCell[] = []
      for (let c = 0; c < selectedCols.value; c++) {
        row.push({
          value: '',
          merged: false,
          colspan: 1,
          rowspan: 1
        })
      }
      newRows.push(row)
    }
    
    rows.value = newRows
    showTable.value = true
    closeModal()
  }
  
  // Table selection functions
  function startSelection(row: number, col: number) {
    selection.start = [row, col]
    selection.end = [row, col]
    selection.isSelecting = true
  }
  
  function moveSelection(row: number, col: number) {
    if (selection.isSelecting && selection.start) {
      selection.end = [row, col]
    }
  }
  
  function endSelection() {
    selection.isSelecting = false
  }
  
  function isCellSelected(row: number, col: number) {
    if (!selection.start || !selection.end) return false
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    const [minR, maxR] = [Math.min(r1, r2), Math.max(r1, r2)]
    const [minC, maxC] = [Math.min(c1, c2), Math.max(c1, c2)]
    return row >= minR && row <= maxR && col >= minC && col <= maxC
  }
  
  // Popover
  const showPopover = computed(() => {
    if (!selection.start || !selection.end) return false
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    return !(r1 === r2 && c1 === c2)
  })
  
  const popoverStyle = {
    top: '10px',
    left: '10px',
    zIndex: 99
  }
  
  // Merge functions
  function mergeSelectedCells() {
    if (!selection.start || !selection.end) return
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    mergeCells(Math.min(r1, r2), Math.min(c1, c2), Math.max(r1, r2), Math.max(c1, c2))
    selection.start = selection.end = null
  }
  
  function unmergeSelectedCells() {
    if (!selection.start || !selection.end) return
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    unmergeCells(Math.min(r1, r2), Math.min(c1, c2), Math.max(r1, r2), Math.max(c1, c2))
    selection.start = selection.end = null
  }
  
  function mergeCells(startRow: number, startCol: number, endRow: number, endCol: number) {
    const rowspan = endRow - startRow + 1
    const colspan = endCol - startCol + 1
    let mergedValues: string[] = []
  
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = rows.value[r][c]
        if (!cell.originalValue) {
          cell.originalValue = cell.value
        }
        if (!cell.merged && cell.value) {
          mergedValues.push(cell.value)
        }
      }
    }
  
    const mainCell = rows.value[startRow][startCol]
    mainCell.rowspan = rowspan
    mainCell.colspan = colspan
    mainCell.value = mergedValues.join(' ')
    mainCell.merged = false
  
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r !== startRow || c !== startCol) {
          const cell = rows.value[r][c]
          cell.merged = true
          cell.colspan = 1
          cell.rowspan = 1
        }
      }
    }
  }
  
  function unmergeCells(startRow: number, startCol: number, endRow: number, endCol: number) {
    const mainCell = rows.value[startRow][startCol]
    mainCell.rowspan = 1
    mainCell.colspan = 1
    if (mainCell.originalValue !== undefined) {
      mainCell.value = mainCell.originalValue
    }
  
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r !== startRow || c !== startCol) {
          const cell = rows.value[r][c]
          cell.merged = false
          cell.colspan = 1
          cell.rowspan = 1
          if (cell.originalValue !== undefined) {
            cell.value = cell.originalValue
          }
        }
      }
    }
  }
  
  // JSON Export/Import Functions
  function exportToJSON() {
    if (!rows.value.length) {
      showStatus('No table data to export', 'error')
      return
    }
    
    const tableData: TableData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      rows: rows.value.length,
      cols: rows.value[0]?.length || 0,
      data: rows.value
    }
    
    const jsonString = JSON.stringify(tableData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `table-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showStatus('Table exported successfully!', 'success')
  }
  
  function importFromJSON(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string
        const tableData: TableData = JSON.parse(jsonString)
        
        // Validate the JSON structure
        if (!tableData.data || !Array.isArray(tableData.data)) {
          throw new Error('Invalid table data format')
        }
        
        // Import the data
        rows.value = tableData.data.map(row => 
          row.map(cell => ({
            value: cell.value || '',
            colspan: cell.colspan || 1,
            rowspan: cell.rowspan || 1,
            merged: cell.merged || false,
            originalValue: cell.originalValue
          }))
        )
        
        showTable.value = true
        showStatus(`Table imported successfully! (${tableData.rows}×${tableData.cols})`, 'success')
        
      } catch (error) {
        console.error('Import error:', error)
        showStatus('Failed to import table. Please check the file format.', 'error')
      }
    }
    
    reader.onerror = () => {
      showStatus('Failed to read the file', 'error')
    }
    
    reader.readAsText(file)
    
    // Reset the input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  
  async function copyJSONToClipboard() {
    if (!rows.value.length) {
      showStatus('No table data to copy', 'error')
      return
    }
    
    const tableData: TableData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      rows: rows.value.length,
      cols: rows.value[0]?.length || 0,
      data: rows.value
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(tableData, null, 2))
      showStatus('Table JSON copied to clipboard!', 'success')
    } catch (error) {
      console.error('Copy failed:', error)
      showStatus('Failed to copy to clipboard', 'error')
    }
  }
  </script>