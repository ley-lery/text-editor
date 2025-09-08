<!-- components/MultiTableEditor.vue -->
<template>
    <div class="p-6">
      <!-- Table Management Header -->
      <TableTabs
        :tables="tables"
        :current-table-id="currentTableId"
        @create-table="showCreateModal = true"
        @switch-table="switchTable"
        @rename-table="handleRenameTable"
        @duplicate-table="handleDuplicateTable"
        @delete-table="handleDeleteTable"
      />
  
      <!-- Create Table Modal -->
      <CreateTableModal
        v-if="showCreateModal"
        :default-name="`Table ${tables.length + 1}`"
        @close="showCreateModal = false"
        @create="handleCreateTable"
      />
  
      <!-- Rename Modal -->
      <RenameModal
        v-if="showRenameModal && renameTableId"
        :current-name="getTableById(renameTableId)?.name || ''"
        @close="closeRenameModal"
        @rename="handleConfirmRename"
      />
  
      <!-- Current Table Editor -->
      <div v-if="currentTable" class="mt-6">
        <!-- Action Buttons -->
        <div class="mb-4 flex gap-2 flex-wrap">
          <h2 class="text-xl font-bold text-gray-800 mr-4">{{ currentTable.name }}</h2>
          
          <button 
            @click="handleExportCurrent" 
            :disabled="isExporting"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <ExportIcon class="w-4 h-4" />
            {{ isExporting ? 'Exporting...' : 'Export' }}
          </button>
          
          <label class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer flex items-center gap-2">
            <ImportIcon class="w-4 h-4" />
            {{ isImporting ? 'Importing...' : 'Import' }}
            <input 
              type="file" 
              accept=".json"
              @change="handleImportFile"
              class="hidden"
              ref="fileInput"
              :disabled="isImporting"
            />
          </label>
          
          <button 
            @click="handleCopyJSON" 
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
          >
            <CopyIcon class="w-4 h-4" />
            Copy JSON
          </button>
          
          <button 
            @click="handleExportAll" 
            :disabled="isExporting || tables.length === 0"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <DownloadIcon class="w-4 h-4" />
            Export All
          </button>
        </div>
        
        <!-- Status Messages -->
        <div v-if="statusMessage" :class="statusMessageClass" class="mb-4 p-3 rounded">
          {{ statusMessage }}
        </div>
        
        <!-- Table Grid -->
        <TableGrid
          :table="currentTable"
          @update="updateCurrentTable"
        />
      </div>
  
      <!-- Empty State -->
      <div v-if="tables.length === 0" class="text-center py-12">
        <TableIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-700 mb-2">No tables created yet</h3>
        <p class="text-gray-500">Create your first table to get started</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { h, ref } from 'vue'
  
  // Components
  import TableTabs from './TableTabs.vue'
  import CreateTableModal from './modals/CreateTableModal.vue'
  import RenameModal from './modals/RenameModal.vue'
  import TableGrid from './TableGrid.vue'
  
  // Composables
  import { useTableManager } from '../composables/useTableManager'
  import { useTableExport } from '../composables/useTableExport'
  import { useStatusMessages } from '../composables/useStatusMessages'
  
  // Icon components (inline for simplicity)
  const ExportIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
  ])
  
  const ImportIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' })
  ])
  
  const CopyIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' })
  ])
  
  const DownloadIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
  ])
  
  const TableIcon = () => h('svg', { class: 'w-16 h-16', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })
  ])
  
  // Composables
  const {
    tables,
    currentTableId,
    currentTable,
    getTableById,
    createTable,
    deleteTable,
    renameTable,
    duplicateTable,
    switchTable,
    updateCurrentTable,
    addTables
  } = useTableManager()
  
  const {
    isExporting,
    isImporting,
    exportTable,
    exportAllTables,
    copyTableJSON,
    importFromFile
  } = useTableExport()
  
  const {
    statusMessage,
    statusMessageClass,
    showStatus
  } = useStatusMessages()
  
  // Modal states
  const showCreateModal = ref(false)
  const showRenameModal = ref(false)
  const renameTableId = ref('')
  const fileInput = ref<HTMLInputElement>()
  
  // Event handlers
  const handleCreateTable = async (params: TableCreationParams) => {
    try {
      const newTable = createTable(params)
      showStatus(`Table "${newTable.name}" created successfully!`, 'success')
      showCreateModal.value = false
    } catch (error) {
      showStatus('Failed to create table', 'error')
    }
  }
  
  const handleRenameTable = (id: string) => {
    renameTableId.value = id
    showRenameModal.value = true
  }
  
  const closeRenameModal = () => {
    showRenameModal.value = false
    renameTableId.value = ''
  }
  
  const handleConfirmRename = (newName: string) => {
    if (renameTable(renameTableId.value, newName)) {
      showStatus('Table renamed successfully!', 'success')
    } else {
      showStatus('Failed to rename table', 'error')
    }
    closeRenameModal()
  }
  
  const handleDuplicateTable = (id: string) => {
    const duplicated = duplicateTable(id)
    if (duplicated) {
      showStatus('Table duplicated successfully!', 'success')
    } else {
      showStatus('Failed to duplicate table', 'error')
    }
  }
  
  const handleDeleteTable = (id: string) => {
    const table = getTableById(id)
    if (table && deleteTable(id)) {
      showStatus(`Table "${table.name}" deleted successfully!`, 'success')
    }
  }
  
  const handleExportCurrent = async () => {
    if (!currentTable.value) return
    
    const success = await exportTable(currentTable.value)
    if (success) {
      showStatus(`Table "${currentTable.value.name}" exported successfully!`, 'success')
    } else {
      showStatus('Failed to export table', 'error')
    }
  }
  
  const handleExportAll = async () => {
    const success = await exportAllTables(tables.value)
    if (success) {
      showStatus(`All ${tables.value.length} tables exported successfully!`, 'success')
    } else {
      showStatus('Failed to export tables', 'error')
    }
  }
  
  const handleCopyJSON = async () => {
    if (!currentTable.value) return
    
    const success = await copyTableJSON(currentTable.value)
    if (success) {
      showStatus(`Table "${currentTable.value.name}" JSON copied to clipboard!`, 'success')
    } else {
      showStatus('Failed to copy to clipboard', 'error')
    }
  }
  
  const handleImportFile = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (!file) return
    
    try {
      const importedTables = await importFromFile(file)
      addTables(importedTables)
      
      const count = importedTables.length
      showStatus(`Successfully imported ${count} table${count > 1 ? 's' : ''}!`, 'success')
    } catch (error) {
      showStatus(error instanceof Error ? error.message : 'Failed to import tables', 'error')
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
  </script>