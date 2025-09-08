// composables/useTableManager.ts
import { ref, computed } from 'vue'
import { createEmptyTable, duplicateTable as duplicateTableUtil, generateUniqueId } from '../../utils/tableUtils'

export const useTableManager = () => {
  const tables = ref<Table[]>([])
  const currentTableId = ref('')

  const currentTable = computed(() => 
    tables.value.find(table => table.id === currentTableId.value)
  )

  const getTableById = (id: string): Table | undefined => {
    return tables.value.find(table => table.id === id)
  }

  const createTable = (params: TableCreationParams): Table => {
    const newTable = createEmptyTable(params.name, params.rows, params.cols)
    tables.value.push(newTable)
    currentTableId.value = newTable.id
    return newTable
  }

  const deleteTable = (id: string): boolean => {
    const table = getTableById(id)
    if (!table) return false

    const confirmed = confirm(`Are you sure you want to delete "${table.name}"?`)
    if (!confirmed) return false

    const index = tables.value.findIndex(t => t.id === id)
    tables.value.splice(index, 1)
    
    // Switch to another table if current was deleted
    if (currentTableId.value === id) {
      currentTableId.value = tables.value.length > 0 ? tables.value[0].id : ''
    }
    
    return true
  }

  const renameTable = (id: string, newName: string): boolean => {
    const table = getTableById(id)
    if (!table || !newName.trim()) return false

    table.name = newName.trim()
    table.updatedAt = new Date().toISOString()
    return true
  }

  const duplicateTable = (id: string): Table | null => {
    const table = getTableById(id)
    if (!table) return null

    const duplicated = duplicateTableUtil(table)
    tables.value.push(duplicated)
    currentTableId.value = duplicated.id
    return duplicated
  }

  const switchTable = (id: string): boolean => {
    const table = getTableById(id)
    if (!table) return false

    currentTableId.value = id
    return true
  }

  const updateCurrentTable = (updatedTable: Table): void => {
    const index = tables.value.findIndex(t => t.id === updatedTable.id)
    if (index !== -1) {
      tables.value[index] = {
        ...updatedTable,
        updatedAt: new Date().toISOString()
      }
    }
  }

  const addTables = (newTables: Table[]): void => {
    const tablesWithUniqueIds = newTables.map(table => ({
      ...table,
      id: generateUniqueId(),
      createdAt: table.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    tables.value.push(...tablesWithUniqueIds)
    
    // Set first imported table as current if no current table
    if (!currentTableId.value && tablesWithUniqueIds.length > 0) {
      currentTableId.value = tablesWithUniqueIds[0].id
    }
  }

  const clearAllTables = (): void => {
    tables.value = []
    currentTableId.value = ''
  }

  return {
    // State
    tables,
    currentTableId,
    currentTable,
    
    // Methods
    getTableById,
    createTable,
    deleteTable,
    renameTable,
    duplicateTable,
    switchTable,
    updateCurrentTable,
    addTables,
    clearAllTables
  }
}