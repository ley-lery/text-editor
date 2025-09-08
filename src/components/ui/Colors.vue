<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const selectedColor = ref(props.modelValue || "#ff0000")
const opacity = ref(100)

watch(selectedColor, (val) => {
  const rgba = hexToRgba(val, opacity.value / 100)
  emit("update:modelValue", rgba)
})

watch(opacity, (val) => {
  const rgba = hexToRgba(selectedColor.value, val / 100)
  emit("update:modelValue", rgba)
})

function hexToRgba(hex: string, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const presetColors = [
  "#FF0000", "#FF8000", "#00FF00", "#00CFFF", "#0000FF", "#FF00FF"
]
</script>

<template>
  <div class="w-72 rounded-xl bg-neutral-900 text-white p-4 space-y-4">
    <!-- Color Grid -->
    <div class="grid grid-cols-10 gap-1">
      <div
        v-for="color in [
          '#000000','#444444','#666666','#999999','#CCCCCC','#FFFFFF',
          '#FF0000','#FF8000','#FFFF00','#00FF00',
          '#00FFFF','#0000FF','#8000FF','#FF00FF','#FF0080'
        ]"
        :key="color"
        :style="{ backgroundColor: color }"
        class="w-6 h-6 rounded cursor-pointer border border-neutral-600"
        @click="selectedColor = color"
      >
        <div
          v-if="selectedColor === color"
          class="w-full h-full flex items-center justify-center"
        >
          <span class="text-xs text-white">✓</span>
        </div>
      </div>
    </div>

    <!-- Opacity -->
    <div class="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="100"
        v-model="opacity"
        class="flex-1 accent-red-500"
      />
      <span class="text-sm w-12 text-right">{{ opacity }}%</span>
    </div>

    <!-- Presets -->
    <div class="flex gap-2">
      <button
        v-for="preset in presetColors"
        :key="preset"
        :style="{ backgroundColor: preset }"
        class="w-7 h-7 rounded-full border border-neutral-700"
        @click="selectedColor = preset"
      />
    </div>

    <!-- Preview -->
    <div
      class="w-full h-10 rounded border border-neutral-700"
      :style="{ backgroundColor: hexToRgba(selectedColor, opacity / 100) }"
    ></div>
  </div>
</template>
