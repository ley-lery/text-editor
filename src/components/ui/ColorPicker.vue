<template>
  <div class="relative inline-block">
    <!-- Trigger Button -->
    <button
      :class="['cursor-pointer flex flex-col items-center rounded-full focus:outline-none transition', buttonClass, disabled && 'opacity-50 pointer-events-none']"
      @click="togglePicker"
      :disabled="disabled"
      aria-label="Pick a color"
      type="button"
    >
        <span class="text-zinc-700 dark:text-zinc-300">A</span>
        <span
            class="w-5 h-1 rounded-full border border-zinc-300"
            :style="{background: color || '#fff'}"
        />
    </button>

    <!-- Popover -->
    <motion.div
      v-if="isOpen"
      class="color-picker-popover z-30 absolute"
      :class="[
        popoverClass,
        placement === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        placement === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
        placement === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
        placement === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
        // fallback
        !placement && 'top-full left-1/2 -translate-x-1/2 mt-2'
      ]"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :exit="{ opacity: 0, scale: 0.9 }"
      :transition="{ duration: 0.18, ease: 'easeInOut' }"
    >
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-lg p-4 min-w-[220px]">
        <!-- Swatches -->
        <div class="grid grid-cols-6 gap-2 mb-2">
          <button
            v-for="swatch in swatches"
            :key="swatch"
            class="w-7 h-7 rounded-full border-2 border-zinc-200 hover:border-zinc-400 transition cursor-pointer"
            :style="{ background: swatch }"
            @click="selectColor(swatch)"
            :aria-label="swatch"
            type="button"
          >
            <span
              v-if="color === swatch"
              class="block w-full h-full rounded-full ring-2 ring-blue-500 ring-offset-2"
            />
          </button>
        </div>
        <!-- Input -->
        <div v-if="showInput" class="flex items-center gap-2 mt-2">
          <input
            class="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
            type="text"
            :value="color"
            @input="onInputChange"
            placeholder="#hex or color"
            maxlength="16"
            aria-label="Custom color"
          />
          <span
            v-if="color"
            class="w-6 h-6 rounded border border-zinc-300"
            :style="{background: color}"
          />
        </div>
      </div>
    </motion.div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch, defineProps, defineEmits, nextTick } from 'vue'
import { motion } from 'motion-v'
import { useEditorStoreFactory } from '../../stores/index'

// Props
const props = defineProps<{
  modelValue?: string
  swatches?: string[]
  showInput?: boolean
  open?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right'
  buttonClass?: string
  popoverClass?: string
  disabled?: boolean
  editorId: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', value: string): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const isOpen = ref(props.open ?? false)
const color = computed({
  get: () => useEditorStoreFactory(props.editorId).textColor,
  set: (v) => {
    useEditorStoreFactory(props.editorId).textColor = v
    emit('update:modelValue', v)
  }
})

const swatches = computed(() => props.swatches ?? [
  '#ef4444', '#f59e42', '#fde68a', '#22d3ee', '#34d399', '#4f46e5', '#a78bfa', '#f472b6', '#6b7280', '#000000', '#ffffff'
])

// Toggle open/close
function togglePicker() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  nextTick(() => {
    isOpen.value ? emit('open') : emit('close')
  })
}

// Handle swatch click
function selectColor(val: string) {
  color.value = val
  emit('select', val)
  isOpen.value = false
  emit('close')
  console.log(val, 'val')
}

// Handle input change
function onInputChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  color.value = val
}

// Close popover on outside click
function handleClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.color-picker-popover, .color-picker-btn')) {
    isOpen.value = false
    emit('close')
    window.removeEventListener('mousedown', handleClickOutside)
  }
}
watch(isOpen, (val) => {
  if (val) window.addEventListener('mousedown', handleClickOutside)
  else window.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style scoped>
.color-picker-popover {
  min-width: 180px;
}
</style>