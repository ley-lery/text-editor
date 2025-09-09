import { ref, computed } from 'vue'

// Types for document styling
export interface DocumentStyle {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  content: string
  styles: {
    // Global styles
    fontSize: number
    fontFamily: string
    fontWeight: string
    fontStyle: string
    textDecoration: string
    textColor: string
    backgroundColor: string
    textAlign: string
    lineHeight: string
    capitalize: string
    // Layout styles
    padding: string
    margin: string
    width: string
    height: string
    // Theme
    theme: 'light' | 'dark'
  }
  // Inline styles for selected text
  inlineStyles: Array<{
    selector: string
    styles: Record<string, string>
  }>
}

export interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'txt'
  includeStyles: boolean
  pageSize: 'A4' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Store for document management
class DocumentStore {
  private documents = ref<DocumentStyle[]>([])
  private currentDocument = ref<DocumentStyle | null>(null)
  private autoSaveEnabled = ref(true)
  private autoSaveInterval = ref(30000) // 30 seconds

  constructor() {
    this.loadFromLocalStorage()
    this.setupAutoSave()
  }

  // Document management
  createDocument(name: string, editorStore: any): DocumentStyle {
    const document: DocumentStyle = {
      id: this.generateId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: editorStore.modelValue || '',
      styles: {
        fontSize: editorStore.fontSize,
        fontFamily: editorStore.fontFamily,
        fontWeight: editorStore.fontWeight,
        fontStyle: editorStore.fontStyle,
        textDecoration: editorStore.textDecoration,
        textColor: editorStore.textColor,
        backgroundColor: editorStore.backgroundColor || '#ffffff',
        textAlign: editorStore.textAlign,
        lineHeight: editorStore.lineHeight,
        capitalize: editorStore.capitalize,
        padding: '1rem',
        margin: '0',
        width: '100%',
        height: 'auto',
        theme: 'light'
      },
      inlineStyles: []
    }

    this.documents.value.push(document)
    this.currentDocument.value = document
    this.saveToLocalStorage()
    return document
  }

  updateDocument(documentId: string, editorStore: any, content: string) {
    const document = this.documents.value.find(doc => doc.id === documentId)
    if (!document) return

    document.content = content
    document.updatedAt = new Date()
    document.styles = {
      ...document.styles,
      fontSize: editorStore.fontSize,
      fontFamily: editorStore.fontFamily,
      fontWeight: editorStore.fontWeight,
      fontStyle: editorStore.fontStyle,
      textDecoration: editorStore.textDecoration,
      textColor: editorStore.textColor,
      backgroundColor: editorStore.backgroundColor || document.styles.backgroundColor,
      textAlign: editorStore.textAlign,
      lineHeight: editorStore.lineHeight,
      capitalize: editorStore.capitalize,
    }

    this.saveToLocalStorage()
  }

  deleteDocument(documentId: string) {
    const index = this.documents.value.findIndex(doc => doc.id === documentId)
    if (index > -1) {
      this.documents.value.splice(index, 1)
      if (this.currentDocument.value?.id === documentId) {
        this.currentDocument.value = null
      }
      this.saveToLocalStorage()
    }
  }

  loadDocument(documentId: string): DocumentStyle | null {
    const document = this.documents.value.find(doc => doc.id === documentId)
    if (document) {
      this.currentDocument.value = document
      return document
    }
    return null
  }

  duplicateDocument(documentId: string): DocumentStyle | null {
    const original = this.documents.value.find(doc => doc.id === documentId)
    if (!original) return null

    const duplicate: DocumentStyle = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.documents.value.push(duplicate)
    this.saveToLocalStorage()
    return duplicate
  }

  // Style management
  generateCSS(document: DocumentStyle): string {
    const { styles } = document
    
    let css = `
      .document-preview {
        font-size: ${styles.fontSize}px;
        font-family: ${styles.fontFamily};
        font-weight: ${styles.fontWeight};
        font-style: ${styles.fontStyle};
        text-decoration: ${styles.textDecoration};
        color: ${styles.textColor};
        background-color: ${styles.backgroundColor};
        text-align: ${styles.textAlign};
        line-height: ${this.getLineHeightValue(styles.lineHeight)};
        text-transform: ${styles.capitalize};
        padding: ${styles.padding};
        margin: ${styles.margin};
        width: ${styles.width};
        height: ${styles.height};
        min-height: 500px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
      }
      
      .document-preview * {
        font-family: inherit;
      }
      
      .document-preview h1, .document-preview h2, .document-preview h3,
      .document-preview h4, .document-preview h5, .document-preview h6 {
        margin: 1em 0 0.5em 0;
        font-weight: bold;
      }
      
      .document-preview p {
        margin: 0.5em 0;
      }
      
      .document-preview ul, .document-preview ol {
        margin: 1em 0;
        padding-left: 2em;
      }
      
      .document-preview li {
        margin: 0.25em 0;
      }
      
      .document-preview table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      
      .document-preview table td, .document-preview table th {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }
      
      .document-preview a {
        color: #3b82f6;
        text-decoration: underline;
      }
    `

    // Add inline styles
    document.inlineStyles.forEach((style) => {
      css += `
        .document-preview ${style.selector} {
          ${Object.entries(style.styles).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
      `
    })

    return css
  }

  private getLineHeightValue(lineHeight: string): string {
    const lineHeightMap: Record<string, string> = {
      'normal': 'normal',
      'tight': '1.25',
      'snug': '1.375',
      'relaxed': '1.625',
      'loose': '2'
    }
    return lineHeightMap[lineHeight] || lineHeight
  }

  // Export functionality
  async exportToPDF(documentData: DocumentStyle, options: ExportOptions): Promise<void> {
    try {
      // Create a simplified PDF export without external dependencies
      const content = this.createPrintableHTML(documentData, options)
      
      // Open print dialog for PDF generation
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(content)
        printWindow.document.close()
        printWindow.focus()
        
        // Trigger print dialog
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw new Error('Failed to export document to PDF')
    }
  }

  private createPrintableHTML(documentData: DocumentStyle, options: ExportOptions): string {
    const css = this.generateCSS(documentData)
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentData.name}</title>
    <style>
        @page {
            size: ${options.pageSize} ${options.orientation};
            margin: ${options.margins.top}mm ${options.margins.right}mm ${options.margins.bottom}mm ${options.margins.left}mm;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
        }
        
        ${css}
        
        .document-preview {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
        }
        
        @media print {
            body { 
                background: white; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="document-preview">
        ${documentData.content}
    </div>
</body>
</html>`
  }

  async exportToHTML(document: DocumentStyle): Promise<void> {
    const css = this.generateCSS(document)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.name}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        ${css}
    </style>
</head>
<body>
    <div class="document-preview">
        ${document.content}
    </div>
</body>
</html>`

    this.downloadFile(html, `${document.name}.html`, 'text/html')
  }

  private downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // Persistence
  private saveToLocalStorage() {
    localStorage.setItem('editor-documents', JSON.stringify(this.documents.value))
    localStorage.setItem('editor-current-document', JSON.stringify(this.currentDocument.value))
  }

  private loadFromLocalStorage() {
    const documents = localStorage.getItem('editor-documents')
    const currentDocument = localStorage.getItem('editor-current-document')
    
    if (documents) {
      this.documents.value = JSON.parse(documents).map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt)
      }))
    }
    
    if (currentDocument) {
      const parsed = JSON.parse(currentDocument)
      if (parsed) {
        this.currentDocument.value = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        }
      }
    }
  }

  private setupAutoSave() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.autoSaveEnabled.value && this.currentDocument.value) {
          this.saveToLocalStorage()
        }
      }, this.autoSaveInterval.value)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Getters
  get allDocuments() {
    return computed(() => this.documents.value)
  }

  get current() {
    return computed(() => this.currentDocument.value)
  }

  get isAutoSaveEnabled() {
    return computed(() => this.autoSaveEnabled.value)
  }

  // Setters
  setAutoSave(enabled: boolean) {
    this.autoSaveEnabled.value = enabled
  }

  setAutoSaveInterval(interval: number) {
    this.autoSaveInterval.value = interval
  }
}

// Create singleton instance
export const documentStore = new DocumentStore()

// Composable for using document store
export function useDocumentStore() {
  return {
    documents: documentStore.allDocuments,
    currentDocument: documentStore.current,
    isAutoSaveEnabled: documentStore.isAutoSaveEnabled,
    
    createDocument: (name: string, editorStore: any) => documentStore.createDocument(name, editorStore),
    updateDocument: (id: string, editorStore: any, content: string) => documentStore.updateDocument(id, editorStore, content),
    deleteDocument: (id: string) => documentStore.deleteDocument(id),
    loadDocument: (id: string) => documentStore.loadDocument(id),
    duplicateDocument: (id: string) => documentStore.duplicateDocument(id),
    
    generateCSS: (document: DocumentStyle) => documentStore.generateCSS(document),
    exportToPDF: (document: DocumentStyle, options: ExportOptions) => documentStore.exportToPDF(document, options),
    exportToHTML: (document: DocumentStyle) => documentStore.exportToHTML(document),
    
    setAutoSave: (enabled: boolean) => documentStore.setAutoSave(enabled),
    setAutoSaveInterval: (interval: number) => documentStore.setAutoSaveInterval(interval)
  }
}
