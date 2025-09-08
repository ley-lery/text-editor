export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const createEmptyTable = (name: string, rows: number, cols: number): Table => {
  const data: TableCell[][] = []
  
  for (let r = 0; r < rows; r++) {
    const row: TableCell[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        value: '',
        merged: false,
        colspan: 1,
        rowspan: 1
      })
    }
    data.push(row)
  }

  return {
    id: generateUniqueId(),
    name,
    rows,
    cols,
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const duplicateTable = (table: Table, newName?: string): Table => {
  return {
    ...table,
    id: generateUniqueId(),
    name: newName || `${table.name} (Copy)`,
    data: JSON.parse(JSON.stringify(table.data)), // Deep copy
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const getGridPosition = (index: number, maxGridSize: number): GridPosition => {
  const row = Math.floor(index / maxGridSize)
  const col = index % maxGridSize
  return { row, col }
}

export const isGridCellSelected = (
  index: number, 
  selectedRows: number, 
  selectedCols: number, 
  maxGridSize: number
): boolean => {
  const { row, col } = getGridPosition(index, maxGridSize)
  return row < selectedRows && col < selectedCols
}

export const isCellInRange = (
  row: number, 
  col: number, 
  start: [number, number], 
  end: [number, number]
): boolean => {
  const [r1, c1] = start
  const [r2, c2] = end
  const [minR, maxR] = [Math.min(r1, r2), Math.max(r1, r2)]
  const [minC, maxC] = [Math.min(c1, c2), Math.max(c1, c2)]
  return row >= minR && row <= maxR && col >= minC && col <= maxC
}

export const mergeCells = (table: Table, range: MergeRange): Table => {
  const { startRow, startCol, endRow, endCol } = range
  const rowspan = endRow - startRow + 1
  const colspan = endCol - startCol + 1
  let mergedValues: string[] = []

  // Collect values from cells to be merged
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = table.data[r][c]
      if (!cell.originalValue) {
        cell.originalValue = cell.value
      }
      if (!cell.merged && cell.value) {
        mergedValues.push(cell.value)
      }
    }
  }

  // Set main cell properties
  const mainCell = table.data[startRow][startCol]
  mainCell.rowspan = rowspan
  mainCell.colspan = colspan
  mainCell.value = mergedValues.join(' ')
  mainCell.merged = false

  // Mark other cells as merged
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r !== startRow || c !== startCol) {
        const cell = table.data[r][c]
        cell.merged = true
        cell.colspan = 1
        cell.rowspan = 1
      }
    }
  }

  return {
    ...table,
    updatedAt: new Date().toISOString()
  }
}

export const unmergeCells = (table: Table, range: MergeRange): Table => {
  const { startRow, startCol, endRow, endCol } = range
  
  // Reset main cell
  const mainCell = table.data[startRow][startCol]
  mainCell.rowspan = 1
  mainCell.colspan = 1
  if (mainCell.originalValue !== undefined) {
    mainCell.value = mainCell.originalValue
  }

  // Reset other cells
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r !== startRow || c !== startCol) {
        const cell = table.data[r][c]
        cell.merged = false
        cell.colspan = 1
        cell.rowspan = 1
        if (cell.originalValue !== undefined) {
          cell.value = cell.originalValue
        }
      }
    }
  }

  return {
    ...table,
    updatedAt: new Date().toISOString()
  }
}

export const validateTableData = (data: any): boolean => {
  return (
    data && 
    Array.isArray(data.data) && 
    data.data.length > 0 &&
    Array.isArray(data.data[0])
  )
}

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}