<template>
  <div class="flex flex-col justify-center items-center bg-zinc-200 dark:bg-zinc-800 h-screen">
    <!-- <Detail/> -->
    <TextEditor editorId="editor-1"/>
  </div>  
</template>
  
<script setup lang="ts">
  import { onMounted } from 'vue';
  import TextEditor from './components/layouts/TextEditor.vue';
  import { useEditorStoreFactory } from './stores/index'

  const editorStore = useEditorStoreFactory('editor-1')
  onMounted(() => {
    const properties = editorStore.storeProperties
    console.log(properties, "properties")
  })
</script>