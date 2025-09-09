<template>
  <div class="relative inline-block" ref="popoverRef">
    <!-- Trigger slot -->
    <div @click="togglePopover" class="cursor-pointer">
      <slot name="trigger">
        <button class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: selectedColor }"></span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ selectedColor }}</span>
        </button>
      </slot>
    </div>

    <AnimatePresence :initial="false">
      <!-- Backdrop overlay -->
      <div
        v-if="isOpen"
        @click="closePopover"
        class="fixed inset-0 z-[998] bg-black/10 dark:bg-black/20"
      />

      <!-- Popover content -->
      <motion.div
        v-if="isOpen"
        class="absolute z-[999] mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        :class="[
          positionClasses,
          {
            'min-w-[200px]': !customWidth,
            'max-h-80 overflow-y-auto': !noMaxHeight
          }
        ]"
        :style="customWidth ? { width: customWidth } : {}"
        :initial="{ 
          opacity: 0, 
          scale: 0.95, 
          translateY: placement === 'top' ? 10 : -10 
        }"
        :animate="{ 
          opacity: 1, 
          scale: 1, 
          translateY: 0 
        }"
        :exit="{ 
          opacity: 0, 
          scale: 0.95, 
          translateY: placement === 'top' ? 10 : -10 
        }"
        :transition="{ 
          type: 'spring', 
          duration: 0.2, 
          bounce: 0.1 
        }"
      >
        <!-- Header slot -->
        <div v-if="$slots.header" class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <slot name="header" />
        </div>

        <!-- Main content -->
        <div class="p-4">
          <slot name="content">
            <!-- Default content when no content slot is provided -->
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Popover content goes here
            </div>
          </slot>
        </div>

        <!-- Footer slot -->
        <div v-if="$slots.footer" class="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <slot name="footer" />
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'

interface Props {
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  trigger?: 'click' | 'hover'
  disabled?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  offset?: number
  customWidth?: string
  noMaxHeight?: boolean
  selectedColor?: string
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-start',
  trigger: 'click',
  disabled: false,
  closeOnClickOutside: true,
  closeOnEscape: true,
  offset: 8,
  noMaxHeight: false,
  selectedColor: '#3b82f6'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const isOpen = ref(false)
const popoverRef = ref<HTMLDivElement | null>(null)

// Computed position classes based on placement
const positionClasses = computed(() => {
  const offset = props.offset
  
  const classMap = {
    'top': `bottom-full left-1/2 -translate-x-1/2 mb-${offset}`,
    'bottom': `top-full left-1/2 -translate-x-1/2 mt-${offset}`,
    'left': `right-full top-1/2 -translate-y-1/2 mr-${offset}`,
    'right': `left-full top-1/2 -translate-y-1/2 ml-${offset}`,
    'top-start': `bottom-full left-0 mb-${offset}`,
    'top-end': `bottom-full right-0 mb-${offset}`,
    'bottom-start': `top-full left-0 mt-${offset}`,
    'bottom-end': `top-full right-0 mt-${offset}`,
    'left-start': `right-full top-0 mr-${offset}`,
    'left-end': `right-full bottom-0 mr-${offset}`,
    'right-start': `left-full top-0 ml-${offset}`,
    'right-end': `left-full bottom-0 ml-${offset}`,
  }
  
  return classMap[props.placement] || classMap['bottom-start']
})

// Methods
const togglePopover = () => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closePopover()
  } else {
    openPopover()
  }
}

const openPopover = () => {
  if (props.disabled) return
  isOpen.value = true
  emit('update:modelValue', true)
  emit('open')
}

const closePopover = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('close')
}

// Handle clicks outside the popover
const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnClickOutside || !isOpen.value) return
  
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    closePopover()
  }
}

// Handle escape key
const handleEscape = (event: KeyboardEvent) => {
  if (!props.closeOnEscape || !isOpen.value) return
  
  if (event.key === 'Escape') {
    closePopover()
  }
}

// Hover handlers for hover trigger
const handleMouseEnter = () => {
  if (props.trigger === 'hover' && !props.disabled) {
    openPopover()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    closePopover()
  }
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    isOpen.value = newValue
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  
  if (props.trigger === 'hover' && popoverRef.value) {
    popoverRef.value.addEventListener('mouseenter', handleMouseEnter)
    popoverRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  
  if (props.trigger === 'hover' && popoverRef.value) {
    popoverRef.value.removeEventListener('mouseenter', handleMouseEnter)
    popoverRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})

// Expose methods for external control
defineExpose({
  open: openPopover,
  close: closePopover,
  toggle: togglePopover,
  isOpen: computed(() => isOpen.value)
})
</script>

<style scoped>
/* Custom scrollbar for the popover content */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>