import { ref, computed } from 'vue'
import { useDisclosure } from '../../hooks/useDisclosure'

export function useEditorTable(editor: any, updateContent: () => void) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    // Table Modal State
    const maxGridSize = 10
    const selectedRows = ref(1)
    const selectedCols = ref(1)

    // Cell selection and merging state
    const selectedCells = ref<HTMLTableCellElement[]>([])
    const showMergePopover = ref(false)
    const mergePopoverPosition = ref({ top: 0, left: 0 })
    const isSelecting = ref(false)

    // Table Grid Computed
    const gridCells = computed(() => Array(maxGridSize * maxGridSize).fill(null))
    const gridStyle = computed(() => ({
        gridTemplateColumns: `repeat(${maxGridSize}, 1fr)`
    }))

    // Check if merge button should be shown
    const canMergeCells = computed(() => {
        return selectedCells.value.length >= 2
    })

    function openTableModal() {
        onOpen()
        selectedRows.value = 1
        selectedCols.value = 1
    }

    function closeTableModal() {
        clearCellSelection()
        removePreviewTable()
        onClose()
    }

    function getGridPosition(index: number) {
        const row = Math.floor(index / maxGridSize)
        const col = index % maxGridSize
        return { row, col }
    }

    function isGridCellSelected(index: number) {
        const { row, col } = getGridPosition(index)
        return row < selectedRows.value && col < selectedCols.value
    }

    let previewTable: HTMLTableElement | null = null

    function highlightGrid(index: number) {
        const { row, col } = getGridPosition(index)
        selectedRows.value = row + 1
        selectedCols.value = col + 1

        showPreviewTable()
    }

    function showPreviewTable() {
        if (!editor.value) return

        // Remove old preview if exists
        removePreviewTable()

        // Build preview table
        const table = document.createElement('table')
        table.className = 'editor-table preview-table'
        table.style.cssText = 'border-collapse: collapse; width: 100%; margin: 10px 0; '

        for (let r = 0; r < selectedRows.value; r++) {
            const tr = document.createElement('tr')
            for (let c = 0; c < selectedCols.value; c++) {
                const td = document.createElement('td')
                td.className = 'table-cell td-preview'
                td.style.cssText = 'border: 1px dashed #ccc; height: 20px;'
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }

        // Insert at end of editor (or cursor position if you want advanced)
        editor.value.appendChild(table)
        previewTable = table
    }

    function removePreviewTable() {
        if (previewTable && previewTable.parentNode) {
            previewTable.parentNode.removeChild(previewTable)
        }
        previewTable = null
    }

    function selectGrid(index: number) {
        const { row, col } = getGridPosition(index)
        selectedRows.value = row + 1
        selectedCols.value = col + 1
        editor.value.focus()
        insertTable()
    }

    function insertTable() {
        if (!editor.value) return

        // Create table HTML with enhanced functionality
        let tableHTML = '<table class="editor-table" style="border-collapse: collapse; width: 100%; margin: 10px 0;">'
        
        for (let r = 0; r < selectedRows.value; r++) {
            tableHTML += '<tr>' 
            for (let c = 0; c < selectedCols.value; c++) {
                tableHTML += `<td 
                    contenteditable="true" 
                    data-row="${r}" 
                    data-col="${c}"
                    class="table-cell"
                >&nbsp;</td>`
            }
            tableHTML += '</tr>'
        }
        
        tableHTML += '</table>'

        // Get current selection or cursor position
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            
            // Delete selected content if any
            range.deleteContents()
            
            // Create a temporary div to hold the table HTML
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = tableHTML
            
            // Insert the table at cursor position
            const tableElement = tempDiv.querySelector('table')
            if (tableElement) {
                range.insertNode(tableElement)
                setupTableEventListeners(tableElement)
            }
            
            // Move cursor after the table
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
            removePreviewTable()
        } else {
            // Fallback: append to end of editor content
            editor.value.innerHTML += tableHTML
            const tableElement = editor.value.querySelector('table:last-child')
            if (tableElement) {
                setupTableEventListeners(tableElement)
            }
        }

        updateContent()
        closeTableModal()

        // Focus back on editor
        editor.value.focus()
    }

    // Setup event listeners for table cells
    function setupTableEventListeners(table: HTMLTableElement) {
        const cells = table.querySelectorAll('td')
        
        cells.forEach(cell => {
            // Cell selection for merging
            cell.addEventListener('mousedown', handleCellMouseDown)
            cell.addEventListener('mouseenter', handleCellMouseEnter)
            cell.addEventListener('mouseup', handleCellMouseUp)
            cell.addEventListener('dblclick', handleCellDoubleClick)
            
            // Right click for context menu (merge options)
            cell.addEventListener('contextmenu', handleCellRightClick)
        })

        // Global mouse up to end selection
        document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    function handleCellMouseDown(e: MouseEvent) {
        e.preventDefault()
        const cell = e.target as HTMLTableCellElement
        
        if (e.ctrlKey || e.metaKey) {
            // Multi-select mode
            toggleCellSelection(cell)
        } else {
            // Start new selection
            clearCellSelection()
            selectedCells.value = [cell]
            isSelecting.value = true
            cell.classList.add('selected-cell')
        }
    }

    function handleCellMouseEnter(e: MouseEvent) {
        if (!isSelecting.value) return
        
        const cell = e.target as HTMLTableCellElement
        if (!selectedCells.value.includes(cell)) {
            selectedCells.value.push(cell)
            cell.classList.add('selected-cell')
        }
    }

    function handleCellMouseUp(e: MouseEvent) {
        isSelecting.value = false
        if (canMergeCells.value) {
            showMergePopover.value = true
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            mergePopoverPosition.value = {
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX
            }
        }
    }

    function handleDocumentMouseUp() {
        isSelecting.value = false
    }

    function handleCellDoubleClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        const cell = e.target as HTMLTableCellElement
        
        // Focus the cell and place cursor at the end of content
        cell.focus()
        
        // Select all text in the cell for easy replacement
        const range = document.createRange()
        range.selectNodeContents(cell)
        const selection = window.getSelection()
        if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
        }
    }

    function handleCellRightClick(e: MouseEvent) {
        e.preventDefault()
        const cell = e.target as HTMLTableCellElement
        
        if (!selectedCells.value.includes(cell)) {
            clearCellSelection()
            selectedCells.value = [cell]
            cell.classList.add('selected-cell')
        }
        
        if (selectedCells.value.length >= 1) {
            showMergePopover.value = true
            mergePopoverPosition.value = {
                top: e.clientY + window.scrollY,
                left: e.clientX + window.scrollX
            }
        }
    }

    function toggleCellSelection(cell: HTMLTableCellElement) {
        const index = selectedCells.value.indexOf(cell)
        if (index > -1) {
            selectedCells.value.splice(index, 1)
            cell.classList.remove('selected-cell')
        } else {
            selectedCells.value.push(cell)
            cell.classList.add('selected-cell')
        }
    }

    function clearCellSelection() {
        selectedCells.value.forEach(cell => {
            cell.classList.remove('selected-cell')
        })
        selectedCells.value = []
        showMergePopover.value = false
    }

    function mergeCells() {
        if (selectedCells.value.length < 2) return

        const firstCell = selectedCells.value[0]
        let combinedContent = ''

        // Collect content from all selected cells
        selectedCells.value.forEach(cell => {
            const cellContent = cell.textContent?.trim()
            if (cellContent && cellContent !== '&nbsp;' && cellContent !== '') {
                combinedContent += (combinedContent ? ' ' : '') + cellContent
            }
        })

        // Calculate colspan and rowspan based on selection
        const rows = new Set(selectedCells.value.map(cell => {
            const tr = cell.parentElement as HTMLTableRowElement
            return Array.from(tr.parentElement!.children).indexOf(tr)
        }))
        
        const cols = new Set(selectedCells.value.map(cell => {
            const tr = cell.parentElement as HTMLTableRowElement
            return Array.from(tr.children).indexOf(cell)
        }))

        // Set combined content
        firstCell.innerHTML = combinedContent || '&nbsp;'
        
        // Set colspan and rowspan
        if (cols.size > 1) {
            firstCell.setAttribute('colspan', cols.size.toString())
        }
        if (rows.size > 1) {
            firstCell.setAttribute('rowspan', rows.size.toString())
        }

        // Remove other selected cells (except the first one)
        selectedCells.value.slice(1).forEach(cell => {
            if (cell.parentElement) {
                cell.remove()
            }
        })

        clearCellSelection()
        updateContent()
    }

    function splitCell(cell: HTMLTableCellElement) {
        const colspan = parseInt(cell.getAttribute('colspan') || '1')
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1')
        
        if (colspan === 1 && rowspan === 1) return // Already split
        
        const table = cell.closest('table') as HTMLTableElement
        const currentRow = cell.parentElement as HTMLTableRowElement
        const currentRowIndex = Array.from(table.rows).indexOf(currentRow)
        const currentCellIndex = Array.from(currentRow.cells).indexOf(cell)
        
        // Remove colspan and rowspan attributes
        cell.removeAttribute('colspan')
        cell.removeAttribute('rowspan')
        
        // Add cells for colspan
        for (let c = 1; c < colspan; c++) {
            const newCell = document.createElement('td')
            newCell.contentEditable = 'true'
            newCell.className = 'table-cell'
            newCell.style.cssText = cell.style.cssText
            newCell.innerHTML = '&nbsp;'
            
            if (currentCellIndex + c < currentRow.cells.length) {
                currentRow.insertBefore(newCell, currentRow.cells[currentCellIndex + c])
            } else {
                currentRow.appendChild(newCell)
            }
            
            setupCellEventListeners(newCell)
        }
        
        // Add rows for rowspan
        for (let r = 1; r < rowspan; r++) {
            const targetRowIndex = currentRowIndex + r
            if (targetRowIndex < table.rows.length) {
                const targetRow = table.rows[targetRowIndex]
                
                for (let c = 0; c < colspan; c++) {
                    const newCell = document.createElement('td')
                    newCell.contentEditable = 'true'
                    newCell.className = 'table-cell'
                    newCell.style.cssText = cell.style.cssText
                    newCell.innerHTML = '&nbsp;'
                    
                    if (currentCellIndex + c < targetRow.cells.length) {
                        targetRow.insertBefore(newCell, targetRow.cells[currentCellIndex + c])
                    } else {
                        targetRow.appendChild(newCell)
                    }
                    
                    setupCellEventListeners(newCell)
                }
            }
        }
        
        updateContent()
    }

    function setupCellEventListeners(cell: HTMLTableCellElement) {
        cell.addEventListener('mousedown', handleCellMouseDown)
        cell.addEventListener('mouseenter', handleCellMouseEnter)
        cell.addEventListener('mouseup', handleCellMouseUp)
        cell.addEventListener('dblclick', handleCellDoubleClick)
        cell.addEventListener('contextmenu', handleCellRightClick)
    }

    function addRowAbove() {
        if (selectedCells.value.length === 0) return
        
        const firstCell = selectedCells.value[0]
        const row = firstCell.parentElement as HTMLTableRowElement
        const table = row.parentElement as HTMLTableElement
        const colCount = Math.max(...Array.from(table.rows).map(r => r.cells.length))
        
        const newRow = document.createElement('tr')
        for (let i = 0; i < colCount; i++) {
            const newCell = document.createElement('td')
            newCell.contentEditable = 'true'
            newCell.className = 'table-cell'
            newCell.style.cssText = firstCell.style.cssText
            newCell.innerHTML = '&nbsp;'
            newRow.appendChild(newCell)
            setupCellEventListeners(newCell)
        }
        
        table.insertBefore(newRow, row)
        clearCellSelection()
        updateContent()
    }

    function addRowBelow() {
        if (selectedCells.value.length === 0) return
        
        const firstCell = selectedCells.value[0]
        const row = firstCell.parentElement as HTMLTableRowElement
        const table = row.parentElement as HTMLTableElement
        const colCount = Math.max(...Array.from(table.rows).map(r => r.cells.length))
        
        const newRow = document.createElement('tr')
        for (let i = 0; i < colCount; i++) {
            const newCell = document.createElement('td')
            newCell.contentEditable = 'true'
            newCell.className = 'table-cell'
            newCell.style.cssText = firstCell.style.cssText
            newCell.innerHTML = '&nbsp;'
            newRow.appendChild(newCell)
            setupCellEventListeners(newCell)
        }
        
        if (row.nextSibling) {
            table.insertBefore(newRow, row.nextSibling)
        } else {
            table.appendChild(newRow)
        }
        
        clearCellSelection()
        updateContent()
    }

    function addColumnLeft() {
        if (selectedCells.value.length === 0) return
        
        const firstCell = selectedCells.value[0]
        const table = firstCell.closest('table') as HTMLTableElement
        const cellIndex = Array.from(firstCell.parentElement!.children).indexOf(firstCell)
        
        Array.from(table.rows).forEach(row => {
            const newCell = document.createElement('td')
            newCell.contentEditable = 'true'
            newCell.className = 'table-cell'
            newCell.style.cssText = firstCell.style.cssText
            newCell.innerHTML = '&nbsp;'
            
            if (cellIndex < row.cells.length) {
                row.insertBefore(newCell, row.cells[cellIndex])
            } else {
                row.appendChild(newCell)
            }
            
            setupCellEventListeners(newCell)
        })
        
        clearCellSelection()
        updateContent()
    }

    function addColumnRight() {
        if (selectedCells.value.length === 0) return
        
        const firstCell = selectedCells.value[0]
        const table = firstCell.closest('table') as HTMLTableElement
        const cellIndex = Array.from(firstCell.parentElement!.children).indexOf(firstCell)
        
        Array.from(table.rows).forEach(row => {
            const newCell = document.createElement('td')
            newCell.contentEditable = 'true'
            newCell.className = 'table-cell'
            newCell.style.cssText = firstCell.style.cssText
            newCell.innerHTML = '&nbsp;'
            
            if (cellIndex + 1 < row.cells.length) {
                row.insertBefore(newCell, row.cells[cellIndex + 1])
            } else {
                row.appendChild(newCell)
            }
            
            setupCellEventListeners(newCell)
        })
        
        clearCellSelection()
        updateContent()
    }

    function deleteRow() {
        if (selectedCells.value.length === 0) return
        
        const rows = new Set(selectedCells.value.map(cell => cell.parentElement))
        rows.forEach(row => {
            if (row && row.parentElement) {
                row.remove()
            }
        })
        
        clearCellSelection()
        updateContent()
    }

    function deleteColumn() {
        if (selectedCells.value.length === 0) return
        
        const firstCell = selectedCells.value[0]
        const table = firstCell.closest('table') as HTMLTableElement
        const cellIndex = Array.from(firstCell.parentElement!.children).indexOf(firstCell)
        
        Array.from(table.rows).forEach(row => {
            if (row.cells[cellIndex]) {
                row.cells[cellIndex].remove()
            }
        })
        
        clearCellSelection()
        updateContent()
    }

    function deleteSelectedCells() {
        selectedCells.value.forEach(cell => {
            cell.innerHTML = '&nbsp;'
        })
        clearCellSelection()
        updateContent()
    }

    return {
        // State
        maxGridSize,
        selectedRows,
        selectedCols,
        gridCells,
        gridStyle,
        selectedCells,
        showMergePopover,
        mergePopoverPosition,
        canMergeCells,
        
        // Methods
        openTableModal,
        closeTableModal,
        getGridPosition,
        isGridCellSelected,
        highlightGrid,
        selectGrid,
        insertTable,
        setupTableEventListeners,
        clearCellSelection,
        mergeCells,
        splitCell,
        deleteSelectedCells,
        addRowAbove,
        addRowBelow,
        addColumnLeft,
        addColumnRight,
        deleteRow,
        deleteColumn
    }
}