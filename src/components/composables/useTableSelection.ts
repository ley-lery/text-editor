// composables/useTableSelection.ts
import { reactive, computed } from 'vue'
import { isCellInRange } from '../../utils/tableUtils'

export const useTableSelection = () => {
  const selection = reactive<SelectionState>({
    start: null,
    end: null,
    isSelecting: false
  })

  const hasSelection = computed(() => 
    selection.start !== null && selection.end !== null
  )

  const isMultiCellSelection = computed(() => {
    if (!selection.start || !selection.end) return false
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    return !(r1 === r2 && c1 === c2)
  })

  const selectionRange = computed((): MergeRange | null => {
    if (!selection.start || !selection.end) return null
    
    const [r1, c1] = selection.start
    const [r2, c2] = selection.end
    
    return {
      startRow: Math.min(r1, r2),
      startCol: Math.min(c1, c2),
      endRow: Math.max(r1, r2),
      endCol: Math.max(c1, c2)
    }
  })

  const startSelection = (row: number, col: number): void => {
    selection.start = [row, col]
    selection.end = [row, col]
    selection.isSelecting = true
  }

  const moveSelection = (row: number, col: number): void => {
    if (selection.isSelecting && selection.start) {
      selection.end = [row, col]
    }
  }

  const endSelection = (): void => {
    selection.isSelecting = false
  }

  const clearSelection = (): void => {
    selection.start = null
    selection.end = null
    selection.isSelecting = false
  }

  const isCellSelected = (row: number, col: number): boolean => {
    if (!selection.start || !selection.end) return false
    return isCellInRange(row, col, selection.start, selection.end)
  }

  return {
    // State
    selection,
    hasSelection,
    isMultiCellSelection,
    selectionRange,
    
    // Methods
    startSelection,
    moveSelection,
    endSelection,
    clearSelection,
    isCellSelected
  }
}