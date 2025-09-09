<template>
  <div class="flex items-center gap-2">
    <Select 
      :options="lineHeightOptions" 
      :modelValue="lineHeight"
      @update:modelValue="setLineHeight"
      placeholder="Line Height"
      class="min-w-32"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Select from './Select.vue';
import { useEditorStoreFactory } from '../../stores/index';

const props = defineProps<{ editorId: string }>()
const editorStore = useEditorStoreFactory(props.editorId)

// Line height options with display names
const lineHeightOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Tight (1.25)', value: 'tight' },
  { label: 'Snug (1.375)', value: 'snug' },
  { label: 'Relaxed (1.625)', value: 'relaxed' },
  { label: 'Loose (2)', value: 'loose' }
];

// Computed property for line height
const lineHeight = computed(() => editorStore.lineHeight);

// Line height setter
const setLineHeight = (height: string | number) => {
  editorStore.setLineHeight(height as any);
};
</script>
