

<template>
  <div class="flex items-center gap-2">
    <Select 
      :options="fontFamilyOptions" 
      :modelValue="fontFamily"
      @update:modelValue="setFontFamily"
      placeholder="Font"
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

// Font family options with display names
const fontFamilyOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Gill Sans', value: 'Gill Sans' }
];

// Computed property for font family
const fontFamily = computed(() => editorStore.fontFamily);

// Font family setter
const setFontFamily = (family: string | number) => {
  editorStore.setFontFamily(family as any);
};
</script>
