import { ref, computed } from 'vue'
export const useStatusMessages = () => {
  const statusMessage = ref('')
  const statusType = ref<'success' | 'error' | 'info'>('info')
  const timeoutId = ref<number | null>(null)

  const statusMessageClass = computed(() => {
    switch (statusType.value) {
      case 'success':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'error':
        return 'bg-red-100 text-red-700 border border-red-200'
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200'
    }
  })

  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Clear any existing timeout
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }

    statusMessage.value = message
    statusType.value = type
    
    // Auto-hide after 3 seconds
    timeoutId.value = window.setTimeout(() => {
      statusMessage.value = ''
      timeoutId.value = null
    }, 3000)
  }

  const clearStatus = () => {
    statusMessage.value = ''
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }

  return {
    statusMessage,
    statusMessageClass,
    showStatus,
    clearStatus
  }
}