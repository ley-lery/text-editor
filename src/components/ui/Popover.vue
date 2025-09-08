<template>
  <div class="relative" ref="popoverRef">
    <!-- Trigger button -->
    <button @click="togglePopover" class="relative z-[1]">
      <slot />
    </button>

    <AnimatePresence :initial="false">
      <!-- Overlay -->
      <div
        v-if="isOpen"
        @click="isOpen = false"
        class="absolute inset-0 z-0 w-full h-full bg-transparent opacity-35"
      />

      <!-- Popover content -->
      <motion.div
        v-if="isOpen"
        class="absolute z-20 mt-2 w-40 bg-white/50 dark:bg-black/80 backdrop-blur-lg rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-black/50 left-4 -translate-x-1/2 top-full p-2 max-h-60 overflow-y-auto scrollbar-none"
        :initial="{ opacity: 0, scale: 0.9, translateY: -20 }"
        :animate="{ opacity: 1, scale: 1, translateY: 0 }"
        :exit="{ opacity: 0, scale: 0.9, translateY: -20 }"
        :transition="{ type: 'tween', duration: 0.2, ease: 'easeInOut' }"
      >
        <!-- Top content slot -->
          <slot name="topContent" />
        <!-- Options list -->
        <div
          v-for="option in options"
          :key="option.value"
          class="text-sm cursor-pointer text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-xl px-2 py-1 select-none"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>

        <!-- Bottom content slot -->
        <slot name="bottomContent" />
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import type { VNodeChild, PropType } from 'vue'

interface Option {
  label: string
  value: string
  onClick?: () => void
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true
  },
  modelValue: [String, Number],
  topContent: Object as PropType<VNodeChild>,
  bottomContent: Object as PropType<VNodeChild>,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const popoverRef = ref<HTMLDivElement | null>(null)

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
  option.onClick?.()
}

// Handle clicks outside the popover
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Computed slots presence
const topContent = computed(() => !!props.topContent)
const bottomContent = computed(() => !!props.bottomContent)
</script>
