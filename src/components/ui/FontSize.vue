<template>
  <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full p-1">
    <!-- Minus Button -->
    <button
      :class="buttonClass(fontSize <= 9)"
      @click="decreaseFont"
      :disabled="fontSize <= 9"
      aria-label="Decrease font size"
    >
      <Minus :size="14" class="text-zinc-600 dark:text-zinc-200" />
    </button>

    <!-- Font Size Popover -->
    <Popover :options="fontSizeOptions" v-model="fontSize">
      <template #topContent>
        <div class="flex items-center gap-1 px-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <Input
            type="number"
            :modelValue="fontSize.toString()"
            @update:modelValue="updateFontSizeFromInput"
            variant="solid"
            class="w-16"
            min="9"
            max="100"
          />
          <span class="text-base text-zinc-600 dark:text-zinc-200 font-normal">px</span>
        </div>
      </template>
      <div class="flex items-center gap-1 px-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
        <span class="text-base text-zinc-600 dark:text-zinc-200 font-normal">{{ fontSize }} px</span>
      </div>
    </Popover>

    <!-- Plus Button -->
    <button
      :class="buttonClass(fontSize >= 100)"
      @click="increaseFont"
      :disabled="fontSize >= 100"
      aria-label="Increase font size"
    >
      <Plus :size="14" class="text-zinc-600 dark:text-zinc-200" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import Popover from './Popover.vue'
import Input from './Input.vue'
import { useEditorStoreFactory } from '../../stores/index'

interface FontSizeOption {
  label: string
  value: string
}

const props = defineProps<{ editorId: string; modelValue?: string }>()
const fontSizeStore = useEditorStoreFactory(props.editorId)

const fontSize = computed({
  get: () => fontSizeStore.fontSize,
  set: (val: number) => {
    if (!isNaN(val) && val >= 9 && val <= 100) {
      fontSizeStore.setFontSize(val)
    }
  },
})

// Generate font size options dynamically
const fontSizeOptions: FontSizeOption[] = Array.from({ length: 92 }, (_, i) => {
  const size = i + 9
  return { label: `${size} px`, value: size.toString() }
})

// Button class helper
const buttonClass = (disabled: boolean) =>
  [
    'rounded-full p-1 cursor-pointer active:scale-95 transition-all duration-200',
    disabled
      ? 'bg-zinc-100/20 pointer-events-none select-none opacity-50'
      : 'bg-zinc-400/40 dark:bg-zinc-700 hover:bg-zinc-400/60 dark:hover:bg-zinc-700',
  ].join(' ')

// Increment/Decrement
const decreaseFont = () => {
  if (fontSize.value > 9) fontSize.value -= 1
}
const increaseFont = () => {
  if (fontSize.value < 100) fontSize.value += 1
}

// Handle input change
const updateFontSizeFromInput = (val: string) => {
  const num = parseInt(val, 10)
  if (!isNaN(num)) fontSize.value = num
}
</script>
