// composables/useTableExport.ts
import { ref } from 'vue'
import { downloadJSON, copyToClipboard, readJSONFile, generateFilename } from '../../utils/fileUtils'
import { generateUniqueId, validateTableData } from '../../utils/tableUtils'

export const useTableExport = () => {
  const isExporting = ref(false)
  const isImporting = ref(false)

  const exportTable = async (table: Table): Promise<boolean> => {
    if (!table) return false
    
    isExporting.value = true
    
    try {
      const exportData: ExportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tables: [table]
      }
      
      const filename = generateFilename(table.name)
      downloadJSON(exportData, filename)
      return true
    } catch (error) {
      console.error('Export failed:', error)
      return false
    } finally {
      isExporting.value = false
    }
  }

  const exportAllTables = async (tables: Table[]): Promise<boolean> => {
    if (tables.length === 0) return false
    
    isExporting.value = true
    
    try {
      const exportData: ExportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tables
      }
      
      const filename = generateFilename('all-tables')
      downloadJSON(exportData, filename)
      return true
    } catch (error) {
      console.error('Export all failed:', error)
      return false
    } finally {
      isExporting.value = false
    }
  }

  const copyTableJSON = async (table: Table): Promise<boolean> => {
    if (!table) return false
    
    try {
      const exportData: ExportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tables: [table]
      }
      
      const jsonString = JSON.stringify(exportData, null, 2)
      return await copyToClipboard(jsonString)
    } catch (error) {
      console.error('Copy JSON failed:', error)
      return false
    }
  }

  const importFromFile = async (file: File): Promise<Table[]> => {
    if (!file) return []
    
    isImporting.value = true
    
    try {
      const importData = await readJSONFile(file)
      return parseImportData(importData)
    } catch (error) {
      console.error('Import failed:', error)
      throw new Error('Failed to import tables. Please check the file format.')
    } finally {
      isImporting.value = false
    }
  }

  const parseImportData = (importData: any): Table[] => {
    let tablesToImport: Table[] = []
    
    // Handle new multi-table format
    if (importData.tables && Array.isArray(importData.tables)) {
      tablesToImport = importData.tables
    } 
    // Handle legacy single-table format
    else if (validateTableData(importData)) {
      tablesToImport = [{
        id: generateUniqueId(),
        name: 'Imported Table',
        rows: importData.rows || importData.data.length,
        cols: importData.cols || (importData.data[0]?.length || 0),
        data: importData.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    } else {
      throw new Error('Invalid file format')
    }

    // Validate and sanitize imported tables
    return tablesToImport.map((table, index) => ({
      ...table,
      id: generateUniqueId(),
      name: table.name || `Imported Table ${index + 1}`,
      createdAt: table.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: sanitizeTableData(table.data)
    }))
  }

  const sanitizeTableData = (data: TableCell[][]): TableCell[][] => {
    return data.map(row => 
      row.map(cell => ({
        value: cell.value || '',
        colspan: cell.colspan || 1,
        rowspan: cell.rowspan || 1,
        merged: cell.merged || false,
        originalValue: cell.originalValue
      }))
    )
  }

  return {
    // State
    isExporting,
    isImporting,
    
    // Methods
    exportTable,
    exportAllTables,
    copyTableJSON,
    importFromFile,
    parseImportData
  }
}