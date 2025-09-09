<template>
  <div class="space-y-4">
    <!-- Color Palette Grid -->
    <div class="space-y-3">
      <!-- Grayscale Colors -->
      <div class="flex flex-wrap gap-2 justify-center">
        <div 
          v-for="color in grayscaleColors" 
          :key="color"
          class="relative group"
        >
          <div 
            class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:shadow-md relative overflow-hidden"
            :class="getColorClasses(color)"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          >
            <!-- Selection indicator -->
            <div 
              v-if="selectedColor === color"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-white rounded-full shadow-md border border-gray-300" />
            </div>
            
            <!-- Hover tooltip -->
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {{ color }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bright Colors -->
      <div class="flex flex-wrap gap-2 justify-center">
        <div 
          v-for="color in brightColors" 
          :key="color"
          class="relative group"
        >
          <div 
            class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:shadow-md relative overflow-hidden"
            :class="getColorClasses(color)"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          >
            <!-- Selection indicator -->
            <div 
              v-if="selectedColor === color"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-white rounded-full shadow-md border border-gray-300" />
            </div>
            
            <!-- Hover tooltip -->
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {{ color }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pastel Colors -->
      <div class="flex flex-wrap gap-2 justify-center">
        <div 
          v-for="color in pastelColors" 
          :key="color"
          class="relative group"
        >
          <div 
            class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:shadow-md relative overflow-hidden"
            :class="getColorClasses(color)"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          >
            <!-- Selection indicator -->
            <div 
              v-if="selectedColor === color"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-white rounded-full shadow-md border border-gray-300" />
            </div>
            
            <!-- Hover tooltip -->
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {{ color }}
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Colors -->
      <div class="flex flex-wrap gap-2 justify-center">
        <div 
          v-for="color in additionalColors" 
          :key="color"
          class="relative group"
        >
          <div 
            class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:shadow-md relative overflow-hidden"
            :class="getColorClasses(color)"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          >
            <!-- Selection indicator -->
            <div 
              v-if="selectedColor === color"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-white rounded-full shadow-md border border-gray-300" />
            </div>
            
            <!-- Hover tooltip -->
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {{ color }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Custom Color Input -->
    <div v-if="showCustomInput" class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Custom Color
      </label>
      <div class="flex gap-2">
        <input 
          type="color"
          v-model="customColor"
          @input="handleCustomColorChange"
          class="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input 
          type="text"
          v-model="customColorText"
          @input="handleCustomTextChange"
          @keydown.enter="applyCustomColor"
          placeholder="#000000"
          class="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button 
          @click="applyCustomColor"
          class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
    
    <!-- Opacity Slider -->
    <div v-if="showOpacity" class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
          Opacity
        </label>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ opacity }}%
        </span>
      </div>
      <div class="relative">
        <input 
          type="range" 
          class="w-full h-2 bg-gradient-to-r from-transparent to-current rounded-lg outline-none appearance-none slider"
          :style="{ color: selectedColor || '#000000' }"
          min="0" 
          max="100" 
          v-model="opacity"
          @input="updateOpacity"
        />
      </div>
    </div>

    <!-- Recently Used Colors -->
    <div v-if="recentColors.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Recently Used
      </label>
      <div class="flex gap-2 flex-wrap">
        <div 
          v-for="color in recentColors" 
          :key="color"
          class="relative group"
        >
          <div 
            class="w-6 h-6 rounded cursor-pointer border-2 transition-all duration-200 hover:scale-110"
            :class="getColorClasses(color)"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
            :title="color"
          >
            <!-- Selection indicator -->
            <div 
              v-if="selectedColor === color"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  showOpacity?: boolean
  showCustomInput?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  showOpacity: true,
  showCustomInput: true
})

const emit = defineEmits<Emits>()

const selectedColor = ref(props.modelValue)
const opacity = ref(100)
const customColor = ref('#000000')
const customColorText = ref('')
const recentColors = ref<string[]>([])

// Enhanced color palettes
const grayscaleColors = [
  '#FFFFFF', // white
  '#F3F4F6', // gray-100
  '#E5E7EB', // gray-200
  '#D1D5DB', // gray-300
  '#9CA3AF', // gray-400
  '#6B7280', // gray-500
  '#374151', // gray-700
  '#1F2937', // gray-800
  '#000000'  // black
]

const brightColors = [
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#06B6D4', // cyan-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899'  // pink-500
]

const pastelColors = [
  '#FEE2E2', // red-100
  '#FED7AA', // orange-100
  '#FEF3C7', // yellow-100
  '#D1FAE5', // green-100
  '#CFFAFE', // cyan-100
  '#DBEAFE', // blue-100
  '#E9D5FF', // violet-100
  '#FCE7F3'  // pink-100
]

const additionalColors = [
  '#DC2626', // red-600
  '#EA580C', // orange-600
  '#CA8A04', // yellow-600
  '#16A34A', // green-600
  '#0891B2', // cyan-600
  '#2563EB', // blue-600
  '#7C3AED', // violet-600
  '#DB2777'  // pink-600
]

const getColorClasses = (color: string) => {
  const isSelected = selectedColor.value === color
  const baseClasses = isSelected 
    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800' 
    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
  
  return baseClasses
}

const selectColor = (color: string) => {
  selectedColor.value = color
  customColorText.value = color
  
  // Add to recent colors
  if (!recentColors.value.includes(color)) {
    recentColors.value.unshift(color)
    if (recentColors.value.length > 8) {
      recentColors.value.pop()
    }
  }
  
  emit('update:modelValue', color)
  emit('change', color)
}

const handleCustomColorChange = () => {
  customColorText.value = customColor.value
  selectColor(customColor.value)
}

const handleCustomTextChange = () => {
  // Validate hex color format
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (hexPattern.test(customColorText.value)) {
    customColor.value = customColorText.value
  }
}

const applyCustomColor = () => {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (hexPattern.test(customColorText.value)) {
    selectColor(customColorText.value)
  }
}

const updateOpacity = () => {
  // Handle opacity changes if needed
  console.log('Opacity:', opacity.value)
  // You can emit opacity changes here if needed
}

// Watch for external changes
watch(() => props.modelValue, (newValue: string) => {
  selectedColor.value = newValue
  if (newValue) {
    customColorText.value = newValue
    customColor.value = newValue
  }
}, { immediate: true })
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #D1D5DB;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #D1D5DB;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, transparent, currentColor);
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, transparent, currentColor);
}

/* Dark mode slider styling */
.dark .slider::-webkit-slider-thumb {
  border-color: #6B7280;
  background: #F9FAFB;
}

.dark .slider::-moz-range-thumb {
  border-color: #6B7280;
  background: #F9FAFB;
}

/* Hide default range track in Firefox */
.slider::-moz-range-progress {
  background: transparent;
}

/* Input focus styles */
input[type="color"]:focus,
input[type="text"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>


<style scoped>
/* Custom slider thumb styling */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #D1D5DB;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #D1D5DB;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: none;
}

/* Dark mode slider thumb */
@media (prefers-color-scheme: dark) {
  .slider::-webkit-slider-thumb {
    border-color: #6B7280;
  }
  
  .slider::-moz-range-thumb {
    border-color: #6B7280;
  }
}
</style>