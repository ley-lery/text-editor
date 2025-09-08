export const downloadJSON = (data: any, filename: string): void => {
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

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

export const readJSONFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string
        const data = JSON.parse(jsonString)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON format'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

export const generateFilename = (baseName: string, extension = 'json'): string => {
  const sanitizedName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const date = new Date().toISOString().split('T')[0]
  return `${sanitizedName}-${date}.${extension}`
}