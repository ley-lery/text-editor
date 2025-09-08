<template>
  <div class="flex items-center gap-2">
    <Select 
      :options="keywordOptions" 
      :modelValue="selectedKeyword"
      @update:modelValue="setSelectedKeyword"
      placeholder="Select keyword"
      class="min-w-40"
    >
    </Select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Select from './Select.vue';
import { useEditorStoreFactory } from '../../stores/index';

const props = defineProps<{ editorId: string }>()
const editorStore = useEditorStoreFactory(props.editorId)

// Local state for selected keyword
const selectedKeyword = ref('')

// Enhanced keyword options with more placeholders
const keywordOptions = [
  { label: 'Company Name', value: 'company' },
  { label: 'Product Name', value: 'product' },
  { label: 'Service Name', value: 'service' },
  { label: 'Technology', value: 'technology' },
  { label: 'Business Type', value: 'business' },
  { label: 'Skill/Expertise', value: 'skill' },
  { label: 'Location', value: 'location' },
  { label: 'Industry', value: 'industry' },
  { label: 'Client Name', value: 'client' },
  { label: 'Project Name', value: 'project' },
  { label: 'Team Member', value: 'team_member' },
  { label: 'Department', value: 'department' },
  { label: 'Date', value: 'date' },
  { label: 'Price/Cost', value: 'price' },
  { label: 'Contact Person', value: 'contact' },
  { label: 'Email Address', value: 'email' },
  { label: 'Phone Number', value: 'phone' },
  { label: 'Address', value: 'address' },
  { label: 'Website URL', value: 'website' },
  { label: 'User Name', value: 'username' },
];

// Update local selection
const setSelectedKeyword = (keyword: string | number) => {
  selectedKeyword.value = keyword as string;
  insertSelectedKeyword()
};

// Insert the selected keyword
const insertSelectedKeyword = () => {
  if (selectedKeyword.value) {
    editorStore.setKeyword(selectedKeyword.value);
    selectedKeyword.value = ''; // Reset selection after insertion
  }
};
</script>
