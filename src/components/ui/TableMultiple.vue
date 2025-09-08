<template>
  <div class="p-6">
    <!-- Table Management Header -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Create New Table Button -->
          <button 
            @click="openModal" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Table
          </button>
          
          <!-- Table Counter -->
          <div class="text-gray-600 font-medium">
            Tables: {{ tables.length }} | Active: {{ currentTableId ? getTableById(currentTableId)?.name : 'None' }}
          </div>
        </div>
        
        <!-- Table Selector -->
        <div v-if="tables.length > 0" class="flex items-center gap-2">
          <label class="text-gray-700 font-medium">Switch Table:</label>
          <select 
            v-model="currentTableId" 
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a table</option>
            <option v-for="table in tables" :key="table.id" :value="table.id">
              {{ table.name }} ({{ table.rows }}×{{ table.cols }})
            </option>
          </select>
        </div>
      </div>
      
      <!-- Table List -->
      <div v-if="tables.length > 0" class="mt-4">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="table in tables" 
            :key="table.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer"
            :class="{
              'bg-blue-100 border-blue-300': currentTableId === table.id,
              'bg-white border-gray-200 hover:bg-gray-50': currentTableId !== table.id
            }"
            @click="currentTableId = table.id"
          >
            <span class="font-medium">{{ table.name }}</span>
            <span class="text-sm text-gray-500">({{ table.rows }}×{{ table.cols }})</span>
            <button 
              @click.stop="renameTable(table.id)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Rename table"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button 
              @click.stop="duplicateTable(table.id)"
              class="text-green-600 hover:text-green-800 p-1"
              title="Duplicate table"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button 
              @click.stop="deleteTable(table.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Delete table"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Grid Selection -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Create New Table</h3>
        
        <!-- Table Name Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
          <input 
            v-model="newTableName"
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter table name..."
            @keyup.enter="generateTable"
          />
        </div>
        
        <!-- Grid Selector -->
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
            :disabled="!newTableName.trim()"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Modal -->
    <div v-if="showRenameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Rename Table</h3>
        <input 
          v-model="renameValue"
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          @keyup.enter="confirmRename"
        />
        <div class="flex gap-2 justify-end">
          <button @click="showRenameModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button @click="confirmRename" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Rename</button>
        </div>
      </div>
    </div>

    <!-- Current Table Editor -->
    <div v-if="currentTable" class="mt-6">
      <div class="mb-4 flex gap-2 flex-wrap">
        <h2 class="text-xl font-bold text-gray-800 mr-4">{{ currentTable.name }}</h2>
        
        <button 
          @click="exportCurrentTable" 
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export
        </button>
        
        <label class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
          Import
          <input 
            type="file" 
            accept=".json"
            @change="importTable"
            class="hidden"
            ref="fileInput"
          />
        </label>
        
        <button 
          @click="copyCurrentTableJSON" 
          class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Copy JSON
        </button>
        
        <button 
          @click="exportAllTables" 
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Export All
        </button>
      </div>
      
      <!-- Status Messages -->
      <div v-if="statusMessage" :class="statusMessageClass" class="mb-4 p-3 rounded">
        {{ statusMessage }}
      </div>
      
      <div class="overflow-auto relative border border-gray-300 rounded">
        <table class="min-w-full border-collapse">
          <tbody>
            <tr v-for="(row, rowIndex) in currentTable.data" :key="rowIndex" class="hover:bg-gray-50">
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

    <!-- Empty State -->
    <div v-if="tables.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-700 mb-2">No tables created yet</h3>
      <p class="text-gray-500">Create your first table to get started</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'

interface TableCell {
  value: string
  colspan?: number
  rowspan?: number
  merged?: boolean
  originalValue?: string
}

interface Table {
  id: string
  name: string
  rows: number
  cols: number
  data: TableCell[][]
  createdAt: string
  updatedAt: string
}

interface ExportData {
  version: string
  timestamp: string
  tables: Table[]
}

// Modal and Grid State
const showModal = ref(false)
const showRenameModal = ref(false)
const maxGridSize = 10
const selectedRows = ref(1)
const selectedCols = ref(1)
const newTableName = ref('')
const renameValue = ref('')
const renameTableId = ref('')

// Status messages
const statusMessage = ref('')
const statusMessageClass = ref('')
const fileInput = ref<HTMLInputElement>()

// Generate grid cells for the selector
const gridCells = computed(() => Array(maxGridSize * maxGridSize).fill(null))
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${maxGridSize}, 1fr)`
}))

// Tables management
const tables = ref<Table[]>([])
const currentTableId = ref('')

// Current table computed property
const currentTable = computed(() => 
  tables.value.find(table => table.id === currentTableId.value)
)

// Selection state for table
const selection = reactive({
  start: null as null | [number, number],
  end: null as null | [number, number],
  isSelecting: false
})

// Watch for table changes to update timestamps
watch(currentTable, (newTable, oldTable) => {
  if (newTable && oldTable && newTable.id === oldTable.id) {
    newTable.updatedAt = new Date().toISOString()
  }
}, { deep: true })

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
  newTableName.value = `Table ${tables.value.length + 1}`
}

function closeModal() {
  showModal.value = false
  newTableName.value = ''
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
  if (!newTableName.value.trim()) {
    showStatus('Please enter a table name', 'error')
    return
  }

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

  const newTable: Table = {
    id: generateUniqueId(),
    name: newTableName.value.trim(),
    rows: selectedRows.value,
    cols: selectedCols.value,
    data: newRows,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  tables.value.push(newTable)
  currentTableId.value = newTable.id
  closeModal()
  showStatus(`Table "${newTable.name}" created successfully!`, 'success')
}

// Table management functions
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getTableById(id: string) {
  return tables.value.find(table => table.id === id)
}

function renameTable(id: string) {
  const table = getTableById(id)
  if (table) {
    renameTableId.value = id
    renameValue.value = table.name
    showRenameModal.value = true
  }
}

function confirmRename() {
  const table = getTableById(renameTableId.value)
  if (table && renameValue.value.trim()) {
    table.name = renameValue.value.trim()
    table.updatedAt = new Date().toISOString()
    showRenameModal.value = false
    showStatus('Table renamed successfully!', 'success')
  }
}

function duplicateTable(id: string) {
  const table = getTableById(id)
  if (table) {
    const duplicatedTable: Table = {
      ...table,
      id: generateUniqueId(),
      name: `${table.name} (Copy)`,
      data: JSON.parse(JSON.stringify(table.data)), // Deep copy
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tables.value.push(duplicatedTable)
    currentTableId.value = duplicatedTable.id
    showStatus(`Table duplicated successfully!`, 'success')
  }
}

function deleteTable(id: string) {
  const table = getTableById(id)
  if (table && confirm(`Are you sure you want to delete "${table.name}"?`)) {
    const index = tables.value.findIndex(t => t.id === id)
    tables.value.splice(index, 1)
    
    if (currentTableId.value === id) {
      currentTableId.value = tables.value.length > 0 ? tables.value[0].id : ''
    }
    
    showStatus(`Table "${table.name}" deleted successfully!`, 'success')
  }
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
  if (!selection.start || !selection.end || !currentTable.value) return
  const [r1, c1] = selection.start
  const [r2, c2] = selection.end
  mergeCells(Math.min(r1, r2), Math.min(c1, c2), Math.max(r1, r2), Math.max(c1, c2))
  selection.start = selection.end = null
}

function unmergeSelectedCells() {
  if (!selection.start || !selection.end || !currentTable.value) return
  const [r1, c1] = selection.start
  const [r2, c2] = selection.end
  unmergeCells(Math.min(r1, r2), Math.min(c1, c2), Math.max(r1, r2), Math.max(c1, c2))
  selection.start = selection.end = null
}

function mergeCells(startRow: number, startCol: number, endRow: number, endCol: number) {
  if (!currentTable.value) return
  
  const rowspan = endRow - startRow + 1
  const colspan = endCol - startCol + 1
  let mergedValues: string[] = []

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = currentTable.value.data[r][c]
      if (!cell.originalValue) {
        cell.originalValue = cell.value
      }
      if (!cell.merged && cell.value) {
        mergedValues.push(cell.value)
      }
    }
  }

  const mainCell = currentTable.value.data[startRow][startCol]
  mainCell.rowspan = rowspan
  mainCell.colspan = colspan
  mainCell.value = mergedValues.join(' ')
  mainCell.merged = false

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r !== startRow || c !== startCol) {
        const cell = currentTable.value.data[r][c]
        cell.merged = true
        cell.colspan = 1
        cell.rowspan = 1
      }
    }
  }
  
  currentTable.value.updatedAt = new Date().toISOString()
}

function unmergeCells(startRow: number, startCol: number, endRow: number, endCol: number) {
  if (!currentTable.value) return
  
  const mainCell = currentTable.value.data[startRow][startCol]
  mainCell.rowspan = 1
  mainCell.colspan = 1
  if (mainCell.originalValue !== undefined) {
    mainCell.value = mainCell.originalValue
  }

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r !== startRow || c !== startCol) {
        const cell = currentTable.value.data[r][c]
        cell.merged = false
        cell.colspan = 1
        cell.rowspan = 1
        if (cell.originalValue !== undefined) {
          cell.value = cell.originalValue
        }
      }
    }
  }
  
  currentTable.value.updatedAt = new Date().toISOString()
}

// Export/Import Functions
function exportCurrentTable() {
  if (!currentTable.value) {
    showStatus('No table selected to export', 'error')
    return
  }
  
  const exportData: ExportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: [currentTable.value]
  }
  
  downloadJSON(exportData, `${currentTable.value.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`)
  showStatus(`Table "${currentTable.value.name}" exported successfully!`, 'success')
}

function exportAllTables() {
  if (tables.value.length === 0) {
    showStatus('No tables to export', 'error')
    return
  }
  
  const exportData: ExportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: tables.value
  }
  
  downloadJSON(exportData, `all-tables-${new Date().toISOString().split('T')[0]}.json`)
  showStatus(`All ${tables.value.length} tables exported successfully!`, 'success')
}

function downloadJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function importTable(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonString = e.target?.result as string
      const importData = JSON.parse(jsonString)
      
      // Handle both single table and multiple tables format
      let tablesToImport: Table[] = []
      
      if (importData.tables && Array.isArray(importData.tables)) {
        // New format with multiple tables
        tablesToImport = importData.tables
      } else if (importData.data && Array.isArray(importData.data)) {
        // Legacy single table format
        tablesToImport = [{
          id: generateUniqueId(),
          name: `Imported Table ${tables.value.length + 1}`,
          rows: importData.rows || importData.data.length,
          cols: importData.cols || (importData.data[0]?.length || 0),
          data: importData.data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      } else {
        throw new Error('Invalid file format')
      }
      
      // Import tables with unique IDs
      let importedCount = 0
      tablesToImport.forEach(table => {
        // Ensure unique ID and validate data structure
        const importedTable: Table = {
          ...table,
          id: generateUniqueId(),
          name: table.name || `Imported Table ${tables.value.length + 1}`,
          createdAt: table.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: table.data.map(row => 
            row.map(cell => ({
              value: cell.value || '',
              colspan: cell.colspan || 1,
              rowspan: cell.rowspan || 1,
              merged: cell.merged || false,
              originalValue: cell.originalValue
            }))
          )
        }
        
        tables.value.push(importedTable)
        importedCount++
      })
      
      // Set the first imported table as current
      if (importedCount > 0) {
        currentTableId.value = tables.value[tables.value.length - importedCount].id
        showStatus(`Successfully imported ${importedCount} table${importedCount > 1 ? 's' : ''}!`, 'success')
      }
      
    } catch (error) {
      console.error('Import error:', error)
      showStatus('Failed to import tables. Please check the file format.', 'error')
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

async function copyCurrentTableJSON() {
  if (!currentTable.value) {
    showStatus('No table selected to copy', 'error')
    return
  }
  
  const exportData: ExportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: [currentTable.value]
  }
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    showStatus(`Table "${currentTable.value.name}" JSON copied to clipboard!`, 'success')
  } catch (error) {
    console.error('Copy failed:', error)
    showStatus('Failed to copy to clipboard', 'error')
  }
}
</script>