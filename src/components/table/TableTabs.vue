<!-- components/TableTabs.vue -->
<template>
    <div class="mb-6 bg-gray-50 p-4 rounded-lg">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Create New Table Button -->
          <button 
            @click="$emit('createTable')" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <PlusIcon class="w-6 h-6" />
            New Table
          </button>
          
          <!-- Table Counter -->
          <div class="text-gray-600 font-medium">
            Tables: {{ tables.length }} | Active: {{ activeTableName || 'None' }}
          </div>
        </div>
        
        <!-- Table Selector -->
        <div v-if="tables.length > 0" class="flex items-center gap-2">
          <label class="text-gray-700 font-medium">Switch Table:</label>
          <select 
            :value="currentTableId" 
            @change="$emit('switchTable', ($event.target as HTMLSelectElement).value)"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a table</option>
            <option v-for="table in tables" :key="table.id" :value="table.id">
              {{ table.name }} ({{ table.rows }}×{{ table.cols }})
            </option>
          </select>
        </div>
      </div>
      
      <!-- Table List -->
      <div v-if="tables.length > 0" class="mt-4">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="table in tables" 
            :key="table.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer"
            :class="{
              'bg-blue-100 border-blue-300': currentTableId === table.id,
              'bg-white border-gray-200 hover:bg-gray-50': currentTableId !== table.id
            }"
            @click="$emit('switchTable', table.id)"
          >
            <span class="font-medium">{{ table.name }}</span>
            <span class="text-sm text-gray-500">({{ table.rows }}×{{ table.cols }})</span>
            
            <!-- Action Buttons -->
            <button 
              @click.stop="$emit('renameTable', table.id)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Rename table"
            >
              <EditIcon class="w-4 h-4" />
            </button>
            <button 
              @click.stop="$emit('duplicateTable', table.id)"
              class="text-green-600 hover:text-green-800 p-1"
              title="Duplicate table"
            >
              <CopyIcon class="w-4 h-4" />
            </button>
            <button 
              @click.stop="$emit('deleteTable', table.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Delete table"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { h } from 'vue'
  
  // Icon components (inline SVGs)
  const PlusIcon = () => h('svg', { 
    class: 'w-6 h-6', 
    fill: 'none', 
    stroke: 'currentColor', 
    viewBox: '0 0 24 24' 
  }, [
    h('path', { 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round', 
      'stroke-width': '2', 
      d: 'M12 4v16m8-8H4' 
    })
  ])
  
  const EditIcon = () => h('svg', { 
    class: 'w-4 h-4', 
    fill: 'none', 
    stroke: 'currentColor', 
    viewBox: '0 0 24 24' 
  }, [
    h('path', { 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round', 
      'stroke-width': '2', 
      d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' 
    })
  ])
  
  const CopyIcon = () => h('svg', { 
    class: 'w-4 h-4', 
    fill: 'none', 
    stroke: 'currentColor', 
    viewBox: '0 0 24 24' 
  }, [
    h('path', { 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round', 
      'stroke-width': '2', 
      d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' 
    })
  ])
  
  const TrashIcon = () => h('svg', { 
    class: 'w-4 h-4', 
    fill: 'none', 
    stroke: 'currentColor', 
    viewBox: '0 0 24 24' 
  }, [
    h('path', { 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round', 
      'stroke-width': '2', 
      d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' 
    })
  ])
  
  interface Props {
    tables: Table[]
    currentTableId: string
  }
  
  interface Emits {
    (e: 'createTable'): void
    (e: 'switchTable', id: string): void
    (e: 'renameTable', id: string): void
    (e: 'duplicateTable', id: string): void
    (e: 'deleteTable', id: string): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  const activeTableName = computed(() => {
    return props.tables.find(table => table.id === props.currentTableId)?.name
  })
  </script>