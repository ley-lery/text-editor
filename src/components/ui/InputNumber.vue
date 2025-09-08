<template>
    <div class="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800/50 rounded-xl ">
      <!-- Number Input -->
      <div class="flex items-center gap-2">
        <input
            type="number"
            :value="currentValue"
            :min="props.min"
            :max="props.max"
            :step="props.step || 1"
            @input="onInput"
            class="min-h-8 max-h-8 rounded-xl border-none outline-none transition-colors duration-300 px-3"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from "vue";
  
  // Props & Emits
  const props = defineProps<{
    modelValue?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    endContent?: string | Node;
  }>();
  
  const emit = defineEmits<{ (e: "update:modelValue", value: number): void }>();
  
  // Internal value to handle defaultValue fallback
  const currentValue = computed({
    get: () => props.modelValue ?? props.defaultValue ?? 0,
    set: (val: number) => emit("update:modelValue", val),
  });
  
  // Handle user typing
  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    let value = target.value === "" ? props.min ?? 0 : Number(target.value);
  
    // Clamp value to min/max
    if (props.min !== undefined) value = Math.max(value, props.min);
    if (props.max !== undefined) value = Math.min(value, props.max);
  
    currentValue.value = value;
  };
  
  // Increment / Decrement
  const increment = () => {
    let value = currentValue.value + (props.step ?? 1);
    if (props.max !== undefined) value = Math.min(value, props.max);
    currentValue.value = value;
  };
  
  const decrement = () => {
    let value = currentValue.value - (props.step ?? 1);
    if (props.min !== undefined) value = Math.max(value, props.min);
    currentValue.value = value;
  };
  </script>
  
  <style scoped>
  /* Hide native number input arrows */
  /* input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield; 
  } */
  </style>
  