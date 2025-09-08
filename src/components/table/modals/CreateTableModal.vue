<!-- components/modals/CreateTableModal.vue -->
<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Create New Table</h3>
        
        <!-- Table Name Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
          <input 
            v-model="tableName"
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter table name..."
            @keyup.enter="handleCreate"
            ref="nameInput"
          />
        </div>
        
        <!-- Grid Selector -->
        <GridSelector
          v-model:selected-rows="selectedRows"
          v-model:selected-cols="selectedCols"
          @select="handleGridSelect"
        />
        
        <!-- Modal Buttons -->
        <div class="flex gap-2 justify-end">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            @click="handleCreate" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="!tableName.trim()"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick, onMounted } from 'vue'
  import GridSelector from '../GridSelector.vue'
  
  interface Props {
    defaultName?: string
  }
  
  interface Emits {
    (e: 'close'): void
    (e: 'create', params: TableCreationParams): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    defaultName: ''
  })
  
  const emit = defineEmits<Emits>()
  
  const tableName = ref('')
  const selectedRows = ref(1)
  const selectedCols = ref(1)
  const nameInput = ref<HTMLInputElement>()
  
  const handleCreate = () => {
    if (!tableName.value.trim()) return
    
    emit('create', {
      name: tableName.value.trim(),
      rows: selectedRows.value,
      cols: selectedCols.value
    })
  }
  
  const handleGridSelect = (rows: number, cols: number) => {
    selectedRows.value = rows
    selectedCols.value = cols
    handleCreate()
  }
  
  onMounted(() => {
    tableName.value = props.defaultName
    nextTick(() => {
      nameInput.value?.focus()
    })
  })
  </script>