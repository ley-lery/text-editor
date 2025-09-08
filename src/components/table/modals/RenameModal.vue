<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Rename Table</h3>
        
        <input 
          v-model="newName"
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Enter new name..."
          @keyup.enter="handleRename"
          ref="nameInput"
        />
        
        <div class="flex gap-2 justify-end">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            @click="handleRename" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="!newName.trim()"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  
  interface Props {
    currentName: string
  }
  
  interface Emits {
    (e: 'close'): void
    (e: 'rename', newName: string): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  const newName = ref('')
  const nameInput = ref<HTMLInputElement>()
  
  const handleRename = () => {
    if (!newName.value.trim()) return
    emit('rename', newName.value.trim())
  }
  
  onMounted(() => {
    newName.value = props.currentName
    nextTick(() => {
      nameInput.value?.focus()
      nameInput.value?.select()
    })
  })
  </script>