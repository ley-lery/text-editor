<template>
  <PopoverV2 
    :placement="placement"
    :trigger="trigger"
    :selected-color="modelValue"
    custom-width="280px"
    v-model="isOpen"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #trigger>
      <div 
        class="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md group"
        :class="{ 
          'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800': isOpen,
          'border-gray-200 dark:border-gray-700': !modelValue 
        }"
        :style="{ backgroundColor: modelValue || 'transparent' }"
      >
        <!-- Color display or default pattern -->
        <div 
          v-if="!modelValue" 
          class="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded group-hover:from-gray-300 group-hover:to-gray-400 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-200"
          style="background-image: 
            linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 75%, transparent 75%),
            linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 75%, transparent 75%);
            background-size: 4px 4px;
            background-position: 0 0, 2px 2px;"
        />
        
        <!-- Selected color indicator -->
        <div 
          v-if="modelValue && isOpen"
          class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"
        />
      </div>
    </template>

    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Color Picker</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ modelValue || 'No color' }}
          </span>
          <button 
            v-if="modelValue && showClearButton"
            @click="clearColor"
            class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </template>

    <template #content>
      <Colors
        :model-value="modelValue"
        :show-opacity="showOpacity"
        :show-custom-input="showCustomInput"
        @update:model-value="handleColorChange"
        @change="handleColorChange"
      />
    </template>

    <template #footer v-if="showFooter">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div 
            class="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
            :style="{ backgroundColor: modelValue || 'transparent' }"
          />
          <span class="text-xs font-mono text-gray-600 dark:text-gray-400">
            {{ modelValue || 'transparent' }}
          </span>
        </div>
        <div class="flex gap-2">
          <button 
            @click="handleCancel"
            class="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="handleApply"
            class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </template>
  </PopoverV2>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Colors from './Colors.vue'
import PopoverV2 from './PopoverV2.vue'

interface Props {
  modelValue?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  trigger?: 'click' | 'hover'
  showOpacity?: boolean
  showCustomInput?: boolean
  showClearButton?: boolean
  showFooter?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-start',
  trigger: 'click',
  showOpacity: true,
  showCustomInput: true,
  showClearButton: true,
  showFooter: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'apply', value: string): void
  (e: 'cancel'): void
}>()

const isOpen = ref(false)
const previousColor = ref(props.modelValue)

const handleColorChange = (color: string) => {
  emit('update:modelValue', color)
  emit('change', color)
}

const clearColor = () => {
  emit('update:modelValue', '')
  emit('change', '')
}

const handleOpen = () => {
  previousColor.value = props.modelValue
  emit('open')
}

const handleClose = () => {
  emit('close')
}

const handleApply = () => {
  emit('apply', props.modelValue || '')
  isOpen.value = false
}

const handleCancel = () => {
  if (previousColor.value !== props.modelValue) {
    emit('update:modelValue', previousColor.value || '')
  }
  emit('cancel')
  isOpen.value = false
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (!isOpen.value) {
    previousColor.value = newValue
  }
})

</script>
