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
        class="w-6 h-6 cursor-pointer  flex items-center justify-center group rounded-2xl"
        :class="{ 
          
          'border-gray-200 dark:border-gray-700': !modelValue || modelValue === ''
        }"
        :style="{ backgroundColor: (modelValue && modelValue !== '') ? modelValue : 'transparent' }"
      >
        <!-- Color display or default pattern -->
        <div 
          v-if="!modelValue || modelValue === ''" 
          class="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 group-hover:from-gray-300 group-hover:to-gray-400 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-200 rounded-2xl"
          style="background-image: 
            linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 75%, transparent 75%),
            linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 75%, transparent 75%);
            background-size: 4px 4px;
            background-position: 0 0, 2px 2px;"
        />
        
        <!-- Selected color indicator -->
        <div 
          v-if="modelValue && modelValue !== '' && isOpen"
          class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"
        />
        
        <!-- Clear button when color is selected -->
        <!-- <button
          v-if="showClearButton && modelValue && modelValue !== ''"
          @click.stop="clearColor"
          class="absolute -top-1 -left-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center transition-colors"
          title="Clear color"
        >
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button> -->
      </div>
    </template>

    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Color Picker</h3>
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
      <div class="flex items-center justify-between bg-white/10 p-2 rounded-2xl">
        <div class="flex items-center gap-2">
          <div 
            class="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
            :style="{ backgroundColor: (modelValue && modelValue !== '') ? modelValue : 'transparent' }"
          />
          <span class="text-xs font-mono text-gray-600 dark:text-gray-400">
            {{ (modelValue && modelValue !== '') ? modelValue : 'transparent' }}
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
