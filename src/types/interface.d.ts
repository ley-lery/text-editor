type FontWeight = 'thin' | 'light' | 'normal' | 'medium' | 'bold' | 'extrabold' | 'black'
type FontFamily = 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Verdana' | 'Gill Sans'
type FontStyle = 'normal' | 'italic'
type TextDecoration = 'none' | 'underline' | 'line-through'
type TextAlign = 'left' | 'center' | 'right' | 'justify'
type LineHeight = 'normal' | 'tight' | 'snug' | 'relaxed' | 'loose'
type BulletList = 'default' | 'disc' | 'circle' | 'square'
type NumberList = 'default' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman'
type Link = string
type Capitalizes = 'none' | 'lowercase' | 'uppercase' | 'capitalize'
interface StoreProperty {
    label: string
    value: Ref<any>
    type: 'number' | 'text' | 'color' | 'select' | null
    min?: number
    max?: number
    step?: number
    unit?: string
    options?: readonly string[]
}

// Table
// types.ts - TypeScript Interface Definitions
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

interface SelectionState {
    start: null | [number, number]
    end: null | [number, number]
    isSelecting: boolean
}
  
interface GridPosition {
    row: number
    col: number
}
  
type StatusType = 'success' | 'error' | 'info'

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
  
interface SelectionState {
    start: [number, number] | null
    end: [number, number] | null
    isSelecting: boolean
}
  
interface GridPosition {
    row: number
    col: number
}
  
interface StatusMessage {
    message: string
    type: 'success' | 'error' | 'info'
}
  
interface TableCreationParams {
    name: string
    rows: number
    cols: number
}
  
interface MergeRange {
    startRow: number
    startCol: number
    endRow: number
    endCol: number
}