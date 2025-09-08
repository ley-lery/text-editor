<template>
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="cn(customClass, variantMaps[variant])"
      class="w-full outline-none"
    />
  </template>
  
  <script setup lang="ts">
  import { cn } from '../../lib/utils';
  
  type Variant = 'solid' | 'bordered';
  
  interface Props {
    modelValue: string;
    type?: string;
    class?: string;
    variant?: Variant;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();
  
  const { modelValue, type = 'text', class: customClass = '', variant = 'solid' } = props;
  
  const variantMaps: Record<Variant, string> = {
    solid: 'border-none bg-zinc-200 dark:bg-zinc-800/50',
    bordered: 'border border-zinc-200 dark:border-zinc-700'
  };
  </script>
  